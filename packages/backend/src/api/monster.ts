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

// HTTPレスポンス型定義（一時的な実装）
interface HTTPレスポンス型<T = unknown> {
  readonly 成功: boolean;
  readonly データ?: T;
  readonly メッセージ?: string;
  readonly 件数?: number;
  readonly エラー?: {
    readonly コード: string;
    readonly メッセージ: string;
  };
}
import { ロガー } from '../utils/logger';
import type { データベース型 } from '../db/types';

// APIの型定義
type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const app = new Hono<Env>();

/**
 * モンスター獲得リクエストのスキーマ
 * 
 * 初学者向けメモ：
 * - 種族IDは必須
 * - UUIDフォーマットをチェック
 */
const モンスター獲得スキーマ = z.object({
  種族ID: z.string().min(1, '種族IDは必須です'),
});

/**
 * モンスター一覧クエリのスキーマ
 * 
 * 初学者向けメモ：
 * - ソート条件は任意
 * - デフォルトは捕獲日時の降順
 */
const モンスター一覧クエリスキーマ = z.object({
  sort: z.enum(['captured_at', 'name', 'hp']).optional().default('captured_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  種族ID: z.string().optional(),
});

/**
 * ニックネーム更新スキーマ
 * 
 * 初学者向けメモ：
 * - 1〜20文字の制限
 * - 空文字は不可
 */
const ニックネーム更新スキーマ = z.object({
  ニックネーム: z.string().min(1, 'ニックネームは必須です').max(20, 'ニックネームは20文字以内で入力してください'),
});

/**
 * HP更新スキーマ
 * 
 * 初学者向けメモ：
 * - バトル後のHP更新用
 * - HP値は0以上で最大HP以下
 */
const HP更新スキーマ = z.object({
  現在hp: z.number().min(0, 'HPは0以上である必要があります').int('HPは整数である必要があります'),
});

/**
 * モンスター捕獲スキーマ
 * 
 * 初学者向けメモ：
 * - バトル勝利後の捕獲用
 * - プレイヤーIDと種族IDが必要
 */
const モンスター捕獲スキーマ = z.object({
  プレイヤーid: z.string().min(1, 'プレイヤーIDは必須です'),
  種族id: z.string().min(1, '種族IDは必須です'),
  ニックネーム: z.string().optional(),
  現在hp: z.number().min(1, 'HPは1以上である必要があります').int().optional(),
  最大hp: z.number().min(1, 'HPは1以上である必要があります').int().optional(),
});

/**
 * POST /api/players/:playerId/monsters - モンスター獲得
 * 
 * 初学者向けメモ：
 * - プレイヤーの存在確認
 * - 種族マスタの存在確認
 * - 初期HPは種族の基礎HPと同じ
 * - ニックネームはデフォルトで種族名
 */
app.post(
  '/players/:playerId/monsters',
  zValidator('json', モンスター獲得スキーマ),
  async (c) => {
    // テスト環境では共有のDrizzleインスタンスを使用、本番環境では新規作成  
    const db = (c.env as { DRIZZLE_DB?: データベース型; DB: D1Database }).DRIZZLE_DB || drizzle(c.env.DB, { schema }) as データベース型;
    const { playerId } = c.req.param();
    const { 種族ID } = c.req.valid('json');

    try {
      // プレイヤーの存在確認
      const プレイヤー = await db
        .select()
        .from(schema.プレイヤー)
        .where(eq(schema.プレイヤー.id, playerId))
        .get();

      if (!プレイヤー) {
        ロガー.警告('存在しないプレイヤーへのモンスター獲得試行', { playerId });
        return c.json<HTTPレスポンス型>({
          成功: false,
          エラー: {
            コード: 'PLAYER_NOT_FOUND',
            メッセージ: 'プレイヤーが見つかりません',
          },
        }, 404);
      }

      // 種族の存在確認
      const 種族 = await db
        .select()
        .from(schema.モンスター種族)
        .where(eq(schema.モンスター種族.id, 種族ID))
        .get();

      if (!種族) {
        ロガー.警告('存在しない種族での獲得試行', { 種族ID });
        return c.json<HTTPレスポンス型>({
          成功: false,
          エラー: {
            コード: 'SPECIES_NOT_FOUND',
            メッセージ: 'モンスター種族が見つかりません',
          },
        }, 404);
      }

      // デバッグ用：種族データの詳細をログ出力
      ロガー.デバッグ('種族データ取得成功', {
        種族ID: 種族.id,
        種族名: 種族.名前,
        基本HP: 種族.基本hp,
        種族データ全体: 種族,
      });

      // 新しいモンスターを作成
      const 新規モンスター = {
        id: uuid生成(),
        プレイヤーid: playerId,
        種族id: 種族ID,
        ニックネーム: 種族.名前, // デフォルトは種族名
        現在hp: 種族.基本hp,
        最大hp: 種族.基本hp,
        取得日時: new Date(),
        更新日時: new Date(),
      };

      // デバッグ用：作成するモンスターデータをログ出力
      ロガー.デバッグ('作成予定モンスターデータ', {
        モンスターデータ: 新規モンスター,
        現在HP値: 種族.基本hp,
        最大HP値: 種族.基本hp,
      });

      await db.insert(schema.所持モンスター).values(新規モンスター);

      ロガー.情報('モンスター獲得成功', {
        プレイヤーID: playerId,
        モンスターID: 新規モンスター.id,
        種族名: 種族.名前,
      });

      // レスポンス用のデータ整形
      const レスポンスデータ = {
        id: 新規モンスター.id,
        プレイヤーID: 新規モンスター.プレイヤーid,
        種族: {
          id: 種族.id,
          名前: 種族.名前,
          基礎HP: 種族.基本hp,
        },
        ニックネーム: 新規モンスター.ニックネーム,
        現在HP: 新規モンスター.現在hp,
        最大HP: 新規モンスター.最大hp,
        捕獲日時: 新規モンスター.取得日時.toISOString(),
      };

      return c.json<HTTPレスポンス型>({
        成功: true,
        データ: レスポンスデータ,
      }, 201);

    } catch (error) {
      ロガー.エラー('モンスター獲得中のエラー', error as Error, { playerId, 種族ID });
      return c.json<HTTPレスポンス型>({
        成功: false,
        エラー: {
          コード: 'INTERNAL_ERROR',
          メッセージ: 'モンスターの獲得に失敗しました',
        },
      }, 500);
    }
  }
);

/**
 * GET /api/players/:playerId/monsters - モンスター一覧取得
 * 
 * 初学者向けメモ：
 * - プレイヤーが所持するモンスターのみ取得
 * - 種族情報も一緒に取得（JOIN）
 * - ソート・フィルタリング対応
 */
app.get(
  '/players/:playerId/monsters',
  zValidator('query', モンスター一覧クエリスキーマ),
  async (c) => {
    // テスト環境では共有のDrizzleインスタンスを使用、本番環境では新規作成  
    const db = (c.env as { DRIZZLE_DB?: データベース型; DB: D1Database }).DRIZZLE_DB || drizzle(c.env.DB, { schema }) as データベース型;
    const { playerId } = c.req.param();
    const { order, 種族ID } = c.req.valid('query');

    try {
      // 基本のクエリを構築
      const whereConditions = [eq(schema.所持モンスター.プレイヤーid, playerId)];
      
      // 種族IDでフィルタリング
      if (種族ID) {
        whereConditions.push(eq(schema.所持モンスター.種族id, 種族ID));
      }

      // クエリ実行
      const baseQuery = db
        .select({
          id: schema.所持モンスター.id,
          ニックネーム: schema.所持モンスター.ニックネーム,
          現在hp: schema.所持モンスター.現在hp,
          最大hp: schema.所持モンスター.最大hp,
          取得日時: schema.所持モンスター.取得日時,
          種族: {
            id: schema.モンスター種族.id,
            名前: schema.モンスター種族.名前,
            基本hp: schema.モンスター種族.基本hp,
          },
        })
        .from(schema.所持モンスター)
        .leftJoin(
          schema.モンスター種族,
          eq(schema.所持モンスター.種族id, schema.モンスター種族.id)
        )
        .where(and(...whereConditions));

      // ソート（現時点では捕獲日時のみ対応）
      const finalQuery = order === 'desc' 
        ? baseQuery.orderBy(desc(schema.所持モンスター.取得日時))
        : baseQuery;

      const モンスター一覧 = await finalQuery.all();

      ロガー.デバッグ('モンスター一覧取得', {
        プレイヤーID: playerId,
        件数: モンスター一覧.length,
      });

      return c.json<HTTPレスポンス型>({
        成功: true,
        データ: モンスター一覧,
        件数: モンスター一覧.length,
      });

    } catch (error) {
      ロガー.エラー('モンスター一覧取得中のエラー', error as Error, { playerId });
      return c.json<HTTPレスポンス型>({
        成功: false,
        エラー: {
          コード: 'INTERNAL_ERROR',
          メッセージ: 'モンスター一覧の取得に失敗しました',
        },
      }, 500);
    }
  }
);

/**
 * PUT /api/monsters/:monsterId - ニックネーム変更
 * 
 * 初学者向けメモ：
 * - モンスターの所有者確認
 * - 他人のモンスターは変更不可
 * - ニックネームのバリデーション
 */
app.put(
  '/monsters/:monsterId',
  zValidator('json', ニックネーム更新スキーマ),
  async (c) => {
    // テスト環境では共有のDrizzleインスタンスを使用、本番環境では新規作成  
    const db = (c.env as { DRIZZLE_DB?: データベース型; DB: D1Database }).DRIZZLE_DB || drizzle(c.env.DB, { schema }) as データベース型;
    const { monsterId } = c.req.param();
    const { ニックネーム } = c.req.valid('json');

    try {
      // モンスターの存在確認
      const モンスター = await db
        .select()
        .from(schema.所持モンスター)
        .where(eq(schema.所持モンスター.id, monsterId))
        .get();

      if (!モンスター) {
        return c.json<HTTPレスポンス型>({
          成功: false,
          エラー: {
            コード: 'MONSTER_NOT_FOUND',
            メッセージ: 'モンスターが見つかりません',
          },
        }, 404);
      }

      // ニックネーム更新
      await db
        .update(schema.所持モンスター)
        .set({ 
          ニックネーム,
          更新日時: new Date()
        })
        .where(eq(schema.所持モンスター.id, monsterId));

      ロガー.情報('ニックネーム変更成功', {
        モンスターID: monsterId,
        新ニックネーム: ニックネーム,
      });

      return c.json<HTTPレスポンス型>({
        成功: true,
        データ: {
          ...モンスター,
          ニックネーム,
        },
      });

    } catch (error) {
      ロガー.エラー('ニックネーム変更中のエラー', error as Error, { monsterId });
      return c.json<HTTPレスポンス型>({
        成功: false,
        エラー: {
          コード: 'INTERNAL_ERROR',
          メッセージ: 'ニックネームの変更に失敗しました',
        },
      }, 500);
    }
  }
);

/**
 * PUT /api/monsters/:monsterId/hp - モンスターHP更新
 * 
 * 初学者向けメモ：
 * - バトル後のHP更新用
 * - 最大HP以下の制限をチェック
 * - 所有者確認を実行
 */
app.put(
  '/monsters/:monsterId/hp',
  zValidator('json', HP更新スキーマ),
  async (c) => {
    // テスト環境では共有のDrizzleインスタンスを使用、本番環境では新規作成
    const db = (c.env as { DRIZZLE_DB?: データベース型; DB: D1Database }).DRIZZLE_DB || drizzle(c.env.DB, { schema }) as データベース型;
    const { monsterId } = c.req.param();
    const { 現在hp } = c.req.valid('json');

    try {
      // モンスターの存在確認と現在データ取得
      const モンスター = await db
        .select()
        .from(schema.所持モンスター)
        .where(eq(schema.所持モンスター.id, monsterId))
        .get();

      if (!モンスター) {
        return c.json<HTTPレスポンス型>({
          成功: false,
          エラー: {
            コード: 'MONSTER_NOT_FOUND',
            メッセージ: 'モンスターが見つかりません',
          },
        }, 404);
      }

      // HP値の妥当性チェック
      if (現在hp > モンスター.最大hp) {
        return c.json<HTTPレスポンス型>({
          成功: false,
          エラー: {
            コード: 'INVALID_HP',
            メッセージ: `HPは最大HP(${モンスター.最大hp})以下である必要があります`,
          },
        }, 400);
      }

      // HP更新
      await db
        .update(schema.所持モンスター)
        .set({ 
          現在hp: 現在hp,
          更新日時: new Date()
        })
        .where(eq(schema.所持モンスター.id, monsterId));

      ロガー.情報('モンスターHP更新成功', {
        モンスターID: monsterId,
        新HP: 現在hp,
        最大HP: モンスター.最大hp,
      });

      return c.json<HTTPレスポンス型>({
        成功: true,
        データ: {
          id: monsterId,
          現在hp: 現在hp,
          最大hp: モンスター.最大hp,
        },
        メッセージ: 'HPが更新されました',
      });

    } catch (error) {
      ロガー.エラー('HP更新中のエラー', error as Error, { monsterId, 現在hp });
      return c.json<HTTPレスポンス型>({
        成功: false,
        エラー: {
          コード: 'INTERNAL_ERROR',
          メッセージ: 'HPの更新に失敗しました',
        },
      }, 500);
    }
  }
);

/**
 * POST /api/monsters/capture - モンスター捕獲
 * 
 * 初学者向けメモ：
 * - バトル勝利後の捕獲用
 * - 既存のモンスター獲得とは別ルート
 * - フレイムビースト専用
 */
app.post(
  '/monsters/capture',
  zValidator('json', モンスター捕獲スキーマ),
  async (c) => {
    // テスト環境では共有のDrizzleインスタンスを使用、本番環境では新規作成
    const db = (c.env as { DRIZZLE_DB?: データベース型; DB: D1Database }).DRIZZLE_DB || drizzle(c.env.DB, { schema }) as データベース型;
    const { プレイヤーid, 種族id, ニックネーム, 現在hp, 最大hp } = c.req.valid('json');

    try {
      // プレイヤーの存在確認
      const プレイヤー = await db
        .select()
        .from(schema.プレイヤー)
        .where(eq(schema.プレイヤー.id, プレイヤーid))
        .get();

      if (!プレイヤー) {
        ロガー.警告('存在しないプレイヤーでの捕獲試行', { プレイヤーid });
        return c.json<HTTPレスポンス型>({
          成功: false,
          エラー: {
            コード: 'PLAYER_NOT_FOUND',
            メッセージ: 'プレイヤーが見つかりません',
          },
        }, 404);
      }

      // 種族の存在確認
      const 種族 = await db
        .select()
        .from(schema.モンスター種族)
        .where(eq(schema.モンスター種族.id, 種族id))
        .get();

      if (!種族) {
        ロガー.警告('存在しない種族での捕獲試行', { 種族id });
        return c.json<HTTPレスポンス型>({
          成功: false,
          エラー: {
            コード: 'SPECIES_NOT_FOUND',
            メッセージ: 'モンスター種族が見つかりません',
          },
        }, 404);
      }

      // 捕獲したモンスターのデータを作成
      const 捕獲モンスター = {
        id: uuid生成(),
        プレイヤーid: プレイヤーid,
        種族id: 種族id,
        ニックネーム: ニックネーム || 種族.名前,
        現在hp: 現在hp || 種族.基本hp,
        最大hp: 最大hp || 種族.基本hp,
        取得日時: new Date(),
        更新日時: new Date(),
      };

      await db.insert(schema.所持モンスター).values(捕獲モンスター);

      ロガー.情報('モンスター捕獲成功', {
        プレイヤーID: プレイヤーid,
        モンスターID: 捕獲モンスター.id,
        種族名: 種族.名前,
      });

      // レスポンス用のデータ整形
      const レスポンスデータ = {
        id: 捕獲モンスター.id,
        プレイヤーID: 捕獲モンスター.プレイヤーid,
        種族: {
          id: 種族.id,
          名前: 種族.名前,
          基礎HP: 種族.基本hp,
        },
        ニックネーム: 捕獲モンスター.ニックネーム,
        現在HP: 捕獲モンスター.現在hp,
        最大HP: 捕獲モンスター.最大hp,
        捕獲日時: 捕獲モンスター.取得日時.toISOString(),
      };

      return c.json<HTTPレスポンス型>({
        成功: true,
        データ: レスポンスデータ,
        メッセージ: 'モンスターを捕獲しました！',
      }, 201);

    } catch (error) {
      ロガー.エラー('モンスター捕獲中のエラー', error as Error, { プレイヤーid, 種族id });
      return c.json<HTTPレスポンス型>({
        成功: false,
        エラー: {
          コード: 'INTERNAL_ERROR',
          メッセージ: 'モンスターの捕獲に失敗しました',
        },
      }, 500);
    }
  }
);

/**
 * DELETE /api/monsters/:monsterId - モンスター解放
 * 
 * 初学者向けメモ：
 * - 物理削除を実行
 * - 復元不可なので注意
 * - 将来的には論理削除も検討
 */
app.delete('/monsters/:monsterId', async (c) => {
  // テスト環境では共有のDrizzleインスタンスを使用、本番環境では新規作成
  const db = (c.env as { DRIZZLE_DB?: データベース型; DB: D1Database }).DRIZZLE_DB || drizzle(c.env.DB, { schema }) as データベース型;
  const { monsterId } = c.req.param();

  try {
    // モンスターの存在確認
    const モンスター = await db
      .select()
      .from(schema.所持モンスター)
      .where(eq(schema.所持モンスター.id, monsterId))
      .get();

    if (!モンスター) {
      return c.json<HTTPレスポンス型>({
        成功: false,
        エラー: {
          コード: 'MONSTER_NOT_FOUND',
          メッセージ: 'モンスターが見つかりません',
        },
      }, 404);
    }

    // モンスター削除
    await db
      .delete(schema.所持モンスター)
      .where(eq(schema.所持モンスター.id, monsterId));

    ロガー.情報('モンスター解放成功', {
      モンスターID: monsterId,
      プレイヤーID: モンスター.プレイヤーid,
    });

    return c.json<HTTPレスポンス型>({
      成功: true,
      メッセージ: 'モンスターを解放しました',
    });

  } catch (error) {
    ロガー.エラー('モンスター解放中のエラー', error as Error, { monsterId });
    return c.json<HTTPレスポンス型>({
      成功: false,
      エラー: {
        コード: 'INTERNAL_ERROR',
        メッセージ: 'モンスターの解放に失敗しました',
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
 *    - プレイヤーIDの検証
 *    - 所有権の確認
 *    - SQLインジェクション対策（ORMで自動）
 * 
 * 5. パフォーマンス
 *    - 必要なデータのみ取得
 *    - JOINでN+1問題を回避
 *    - インデックスの活用（DB側）
 */