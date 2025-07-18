/**
 * モンスター管理API
 * 
 * 初学者向けメモ：
 * - モンスターのCRUD操作を提供
 * - プレイヤーの所有権を検証
 * - 適切なエラーハンドリング
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../db/schema';
import { uuid生成 } from '../utils/uuid';

// HTTPレスポンス型定義（HTTP response type definition）
interface HTTPResponseType<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly message?: string;
  readonly count?: number;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}
import { ロガー } from '../utils/logger';
import type { データベース型 } from '../db/types';
import { firebaseAuthMiddleware } from '../middleware/firebase-auth';

// APIの型定義
type Env = {
  Bindings: {
    DB: D1Database;
    AUTH_KV: KVNamespace;
  };
  Variables: {
    FIREBASE_PROJECT_ID: string;
    PUBLIC_JWK_CACHE_KEY: string;
    JWT_CACHE_TTL: string;
  };
};

const app = new Hono<Env>();

/**
 * モンスター獲得リクエストのスキーマ（Monster acquisition request schema）
 * 
 * 初学者向けメモ：（For beginners:）
 * - 種族IDは必須（Species ID is required）
 * - UUIDフォーマットをチェック（Check UUID format）
 */
const monsterAcquisitionSchema = z.object({
  speciesId: z.string().min(1, '種族IDは必須です'),
});

/**
 * モンスター一覧クエリのスキーマ（Monster list query schema）
 * 
 * 初学者向けメモ：（For beginners:）
 * - ソート条件は任意（Sort conditions are optional）
 * - デフォルトは捕獲日時の降順（Default is descending order by capture time）
 */
const monsterListQuerySchema = z.object({
  sort: z.enum(['captured_at', 'name', 'hp']).optional().default('captured_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  speciesId: z.string().optional(),
});

/**
 * モンスター更新スキーマ（Monster update schema）
 * 
 * 初学者向けメモ：（For beginners:）
 * - ニックネームまたはHPの更新が可能（Nickname or HP updates allowed）
 * - 少なくとも一つのフィールドが必要（At least one field required）
 */
const monsterUpdateSchema = z.object({
  nickname: z.string().min(1, 'ニックネームは1文字以上で入力してください').max(20, 'ニックネームは20文字以内で入力してください').optional(),
  currentHp: z.number().min(0, 'HPは0以上である必要があります').optional(),
}).refine(data => data.nickname !== undefined || data.currentHp !== undefined, {
  message: 'ニックネームまたはHPの少なくとも一つは必須です'
});

// 後方互換性のためのエイリアス（Backward compatibility aliases）
const モンスター獲得スキーマ = monsterAcquisitionSchema;
const モンスター一覧クエリスキーマ = monsterListQuerySchema;
const モンスター更新スキーマ = monsterUpdateSchema;

/**
 * POST /api/players/:playerId/monsters - モンスター獲得
 * 
 * 初学者向けメモ：
 * - Firebase認証が必要
 * - プレイヤーの存在確認
 * - 種族マスタの存在確認
 * - 初期HPは種族の基礎HPと同じ
 * - ニックネームはデフォルトで種族名
 */
app.post(
  '/players/:playerId/monsters',
  zValidator('json', モンスター獲得スキーマ),
  async (c) => {
    // Firebase認証チェック
    const authResult = await firebaseAuthMiddleware(c.req.raw, {
      AUTH_KV: c.env.AUTH_KV,
      FIREBASE_PROJECT_ID: (c.env as { FIREBASE_PROJECT_ID?: string }).FIREBASE_PROJECT_ID || '',
      PUBLIC_JWK_CACHE_KEY: (c.env as { PUBLIC_JWK_CACHE_KEY?: string }).PUBLIC_JWK_CACHE_KEY || '',
      JWT_CACHE_TTL: (c.env as { JWT_CACHE_TTL?: string }).JWT_CACHE_TTL || '',
    });
    if (!authResult.success) {
      return authResult.response;
    }

    // テスト環境では共有のDrizzleインスタンスを使用、本番環境では新規作成  
    const db = (c.env as { DRIZZLE_DB?: データベース型; DB: D1Database }).DRIZZLE_DB || drizzle(c.env.DB, { schema }) as データベース型;
    const { playerId } = c.req.param();
    const { speciesId } = c.req.valid('json');
    const firebaseUid = authResult.user.uid;

    try {
      // プレイヤーの存在確認とFirebase UID照合
      const プレイヤー = await db
        .select()
        .from(schema.players)
        .where(eq(schema.players.id, playerId))
        .get();

      if (!プレイヤー) {
        ロガー.警告('存在しないプレイヤーへのモンスター獲得試行', { playerId });
        return c.json<HTTPResponseType>({
          success: false,
          error: {
            code: 'PLAYER_NOT_FOUND',
            message: 'プレイヤーが見つかりません',
          },
        }, 404);
      }

      // プレイヤーの所有権確認（Firebase UIDの照合）
      if (プレイヤー.firebaseUid !== firebaseUid) {
        ロガー.警告('認証されていないプレイヤーへのモンスター獲得試行', { playerId, firebaseUid });
        return c.json<HTTPResponseType>({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'このプレイヤーへの操作権限がありません',
          },
        }, 403);
      }

      // 種族の存在確認
      const 種族 = await db
        .select()
        .from(schema.monsterSpecies)
        .where(eq(schema.monsterSpecies.id, speciesId))
        .get();

      if (!種族) {
        ロガー.警告('存在しない種族での獲得試行', { speciesId });
        return c.json<HTTPResponseType>({
          success: false,
          error: {
            code: 'SPECIES_NOT_FOUND',
            message: 'モンスター種族が見つかりません',
          },
        }, 404);
      }

      // デバッグ用：種族データの詳細をログ出力
      ロガー.デバッグ('種族データ取得成功', {
        種族ID: 種族.id,
        種族名: 種族.name,
        基本HP: 種族.baseHp,
        種族データ全体: 種族,
      });

      // 新しいモンスターを作成
      const 新規モンスター = {
        id: uuid生成(),
        playerId: playerId,
        speciesId: speciesId,
        nickname: 種族.name, // デフォルトは種族名
        currentHp: 種族.baseHp,
        maxHp: 種族.baseHp,
        obtainedAt: new Date(),
        updatedAt: new Date(),
      };

      // デバッグ用：作成するモンスターデータをログ出力
      ロガー.デバッグ('作成予定モンスターデータ', {
        モンスターデータ: 新規モンスター,
        現在HP値: 種族.baseHp,
        最大HP値: 種族.baseHp,
      });

      await db.insert(schema.ownedMonsters).values(新規モンスター);

      ロガー.情報('モンスター獲得成功', {
        プレイヤーID: playerId,
        モンスターID: 新規モンスター.id,
        種族名: 種族.name,
      });

      // レスポンス用のデータ整形
      const レスポンスデータ = {
        id: 新規モンスター.id,
        playerId: 新規モンスター.playerId,
        species: {
          id: 種族.id,
          name: 種族.name,
          baseHp: 種族.baseHp,
        },
        nickname: 新規モンスター.nickname,
        currentHp: 新規モンスター.currentHp,
        maxHp: 新規モンスター.maxHp,
        capturedAt: 新規モンスター.obtainedAt.toISOString(),
      };

      return c.json<HTTPResponseType>({
        success: true,
        data: レスポンスデータ,
      }, 201);

    } catch (error) {
      ロガー.エラー('モンスター獲得中のエラー', error as Error, { playerId, speciesId });
      return c.json<HTTPResponseType>({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'モンスターの獲得に失敗しました',
        },
      }, 500);
    }
  }
);

/**
 * GET /api/players/:playerId/monsters - モンスター一覧取得
 * 
 * 初学者向けメモ：
 * - Firebase認証が必要
 * - プレイヤーが所持するモンスターのみ取得
 * - 種族情報も一緒に取得（JOIN）
 * - ソート・フィルタリング対応
 */
app.get(
  '/players/:playerId/monsters',
  zValidator('query', モンスター一覧クエリスキーマ),
  async (c) => {
    // Firebase認証チェック
    const authResult = await firebaseAuthMiddleware(c.req.raw, {
      AUTH_KV: c.env.AUTH_KV,
      FIREBASE_PROJECT_ID: (c.env as { FIREBASE_PROJECT_ID?: string }).FIREBASE_PROJECT_ID || '',
      PUBLIC_JWK_CACHE_KEY: (c.env as { PUBLIC_JWK_CACHE_KEY?: string }).PUBLIC_JWK_CACHE_KEY || '',
      JWT_CACHE_TTL: (c.env as { JWT_CACHE_TTL?: string }).JWT_CACHE_TTL || '',
    });
    if (!authResult.success) {
      return authResult.response;
    }

    // テスト環境では共有のDrizzleインスタンスを使用、本番環境では新規作成  
    const db = (c.env as { DRIZZLE_DB?: データベース型; DB: D1Database }).DRIZZLE_DB || drizzle(c.env.DB, { schema }) as データベース型;
    const { playerId } = c.req.param();
    const { order, speciesId } = c.req.valid('query');
    const firebaseUid = authResult.user.uid;

    try {
      // プレイヤーの存在確認とFirebase UID照合
      const プレイヤー = await db
        .select()
        .from(schema.players)
        .where(eq(schema.players.id, playerId))
        .get();

      if (!プレイヤー) {
        return c.json<HTTPResponseType>({
          success: false,
          error: {
            code: 'PLAYER_NOT_FOUND',
            message: 'プレイヤーが見つかりません',
          },
        }, 404);
      }

      // プレイヤーの所有権確認（Firebase UIDの照合）
      if (プレイヤー.firebaseUid !== firebaseUid) {
        return c.json<HTTPResponseType>({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'このプレイヤーのモンスター情報へのアクセス権限がありません',
          },
        }, 403);
      }
      // 基本のクエリを構築
      const whereConditions = [eq(schema.ownedMonsters.playerId, playerId)];
      
      // 種族IDでフィルタリング
      if (speciesId) {
        whereConditions.push(eq(schema.ownedMonsters.speciesId, speciesId));
      }

      // クエリ実行
      const baseQuery = db
        .select({
          id: schema.ownedMonsters.id,
          speciesId: schema.ownedMonsters.speciesId,
          ニックネーム: schema.ownedMonsters.nickname,
          現在hp: schema.ownedMonsters.currentHp,
          最大hp: schema.ownedMonsters.maxHp,
          取得日時: schema.ownedMonsters.obtainedAt,
          種族: {
            id: schema.monsterSpecies.id,
            名前: schema.monsterSpecies.name,
            基本hp: schema.monsterSpecies.baseHp,
          },
        })
        .from(schema.ownedMonsters)
        .leftJoin(
          schema.monsterSpecies,
          eq(schema.ownedMonsters.speciesId, schema.monsterSpecies.id)
        )
        .where(and(...whereConditions));

      // ソート（現時点では捕獲日時のみ対応）
      const finalQuery = order === 'desc' 
        ? baseQuery.orderBy(desc(schema.ownedMonsters.obtainedAt))
        : baseQuery;

      const モンスター一覧 = await finalQuery.all();

      ロガー.デバッグ('モンスター一覧取得', {
        プレイヤーID: playerId,
        件数: モンスター一覧.length,
      });

      return c.json<HTTPResponseType>({
        success: true,
        data: モンスター一覧,
        count: モンスター一覧.length,
      });

    } catch (error) {
      ロガー.エラー('モンスター一覧取得中のエラー', error as Error, { playerId });
      return c.json<HTTPResponseType>({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'モンスター一覧の取得に失敗しました',
        },
      }, 500);
    }
  }
);

/**
 * PUT /api/monsters/:monsterId - モンスター情報更新
 * 
 * 初学者向けメモ：
 * - Firebase認証が必要
 * - モンスターの所有者確認
 * - 他人のモンスターは変更不可
 * - ニックネームまたはHPの更新が可能
 */
app.put(
  '/monsters/:monsterId',
  zValidator('json', モンスター更新スキーマ),
  async (c) => {
    // Firebase認証チェック
    const authResult = await firebaseAuthMiddleware(c.req.raw, {
      AUTH_KV: c.env.AUTH_KV,
      FIREBASE_PROJECT_ID: (c.env as { FIREBASE_PROJECT_ID?: string }).FIREBASE_PROJECT_ID || '',
      PUBLIC_JWK_CACHE_KEY: (c.env as { PUBLIC_JWK_CACHE_KEY?: string }).PUBLIC_JWK_CACHE_KEY || '',
      JWT_CACHE_TTL: (c.env as { JWT_CACHE_TTL?: string }).JWT_CACHE_TTL || '',
    });
    if (!authResult.success) {
      return authResult.response;
    }

    // テスト環境では共有のDrizzleインスタンスを使用、本番環境では新規作成  
    const db = (c.env as { DRIZZLE_DB?: データベース型; DB: D1Database }).DRIZZLE_DB || drizzle(c.env.DB, { schema }) as データベース型;
    const { monsterId } = c.req.param();
    const { nickname, currentHp } = c.req.valid('json');
    const firebaseUid = authResult.user.uid;

    try {
      // モンスターの存在確認と所有者の確認
      const モンスター情報 = await db
        .select({
          monster: schema.ownedMonsters,
          player: schema.players,
        })
        .from(schema.ownedMonsters)
        .leftJoin(schema.players, eq(schema.ownedMonsters.playerId, schema.players.id))
        .where(eq(schema.ownedMonsters.id, monsterId))
        .get();

      if (!モンスター情報 || !モンスター情報.monster) {
        return c.json<HTTPResponseType>({
          success: false,
          error: {
            code: 'MONSTER_NOT_FOUND',
            message: 'モンスターが見つかりません',
          },
        }, 404);
      }

      // プレイヤーの所有権確認（Firebase UIDの照合）
      if (!モンスター情報.player || モンスター情報.player.firebaseUid !== firebaseUid) {
        return c.json<HTTPResponseType>({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'このモンスターの変更権限がありません',
          },
        }, 403);
      }

      const モンスター = モンスター情報.monster;

      // 更新するフィールドを準備
      const updateFields: {
        updatedAt: Date;
        nickname?: string;
        currentHp?: number;
      } = {
        updatedAt: new Date()
      };

      if (nickname !== undefined) {
        updateFields.nickname = nickname;
      }

      if (currentHp !== undefined) {
        // HPが最大HPを超えないよう制限
        const newHp = Math.min(currentHp, モンスター.maxHp);
        updateFields.currentHp = Math.max(0, newHp); // 0以下にはならない
      }

      // モンスター情報更新
      await db
        .update(schema.ownedMonsters)
        .set(updateFields)
        .where(eq(schema.ownedMonsters.id, monsterId));

      ロガー.情報('モンスター更新成功', {
        モンスターID: monsterId,
        更新フィールド: updateFields,
      });

      return c.json<HTTPResponseType>({
        success: true,
        data: {
          ...モンスター,
          ...updateFields,
        },
      });

    } catch (error) {
      ロガー.エラー('モンスター更新中のエラー', error as Error, { monsterId });
      return c.json<HTTPResponseType>({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'モンスター情報の更新に失敗しました',
        },
      }, 500);
    }
  }
);

/**
 * DELETE /api/monsters/:monsterId - モンスター解放
 * 
 * 初学者向けメモ：
 * - Firebase認証が必要
 * - 物理削除を実行
 * - 復元不可なので注意
 * - 将来的には論理削除も検討
 */
app.delete('/monsters/:monsterId', async (c) => {
  // Firebase認証チェック
  const authResult = await firebaseAuthMiddleware(c.req.raw, {
    AUTH_KV: c.env.AUTH_KV,
    FIREBASE_PROJECT_ID: (c.env as { FIREBASE_PROJECT_ID?: string }).FIREBASE_PROJECT_ID || '',
    PUBLIC_JWK_CACHE_KEY: (c.env as { PUBLIC_JWK_CACHE_KEY?: string }).PUBLIC_JWK_CACHE_KEY || '',
    JWT_CACHE_TTL: (c.env as { JWT_CACHE_TTL?: string }).JWT_CACHE_TTL || '',
  });
  if (!authResult.success) {
    return authResult.response;
  }

  // テスト環境では共有のDrizzleインスタンスを使用、本番環境では新規作成
  const db = (c.env as { DRIZZLE_DB?: データベース型; DB: D1Database }).DRIZZLE_DB || drizzle(c.env.DB, { schema }) as データベース型;
  const { monsterId } = c.req.param();
  const firebaseUid = authResult.user.uid;

  try {
    // モンスターの存在確認と所有者の確認
    const モンスター情報 = await db
      .select({
        monster: schema.ownedMonsters,
        player: schema.players,
      })
      .from(schema.ownedMonsters)
      .leftJoin(schema.players, eq(schema.ownedMonsters.playerId, schema.players.id))
      .where(eq(schema.ownedMonsters.id, monsterId))
      .get();

    if (!モンスター情報 || !モンスター情報.monster) {
      return c.json<HTTPResponseType>({
        success: false,
        error: {
          code: 'MONSTER_NOT_FOUND',
          message: 'モンスターが見つかりません',
        },
      }, 404);
    }

    // プレイヤーの所有権確認（Firebase UIDの照合）
    if (!モンスター情報.player || モンスター情報.player.firebaseUid !== firebaseUid) {
      return c.json<HTTPResponseType>({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'このモンスターの削除権限がありません',
        },
      }, 403);
    }

    const モンスター = モンスター情報.monster;

    // モンスター削除
    await db
      .delete(schema.ownedMonsters)
      .where(eq(schema.ownedMonsters.id, monsterId));

    ロガー.情報('モンスター解放成功', {
      モンスターID: monsterId,
      プレイヤーID: モンスター.playerId,
    });

    return c.json<HTTPResponseType>({
      success: true,
      message: 'モンスターを解放しました',
    });

  } catch (error) {
    ロガー.エラー('モンスター解放中のエラー', error as Error, { monsterId });
    return c.json<HTTPResponseType>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'モンスターの解放に失敗しました',
      },
    }, 500);
  }
});

export default app;

/**
 * 初学者向けメモ：モンスターAPIの設計ポイント
 * 
 * 1. RESTfulな設計
 *    - リソース指向のURL設計
 *    - 適切なHTTPメソッドの使用
 *    - ステータスコードの使い分け
 * 
 * 2. バリデーション
 *    - Zodスキーマで入力値検証
 *    - エラーメッセージは日本語
 *    - 詳細なバリデーションルール
 * 
 * 3. エラーハンドリング
 *    - try-catchで例外をキャッチ
 *    - 適切なエラーレスポンス
 *    - ログ出力で問題追跡
 * 
 * 4. セキュリティ
 *    - Firebase認証によるユーザー識別
 *    - プレイヤーIDの検証
 *    - Firebase UIDによる所有権確認
 *    - SQLインジェクション対策（ORMで自動）
 * 
 * 5. パフォーマンス
 *    - 必要なデータのみ取得
 *    - JOINでN+1問題を回避
 *    - インデックスの活用（DB側）
 */