/**
 * プレイヤー関連API
 * 
 * 初学者向けメモ：
 * - RESTful APIの設計に基づいて実装
 * - Honoフレームワークを使用してルーティングを定義
 * - Zodを使用してリクエストデータの検証を行う
 * - Drizzle ORMを使用してデータベース操作を行う
 */

import { Hono } from 'hono';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { players, monsterSpecies, ownedMonsters } from '../db/schema';
// CI環境対応のため、nanoidではなくuuid生成()を使用
// nanoid 5.0.0はNode.js環境でCrypto APIを要求するが、CI環境では利用できない場合がある
// import { nanoid } from 'nanoid'; // 一意IDの生成用
import type { データベース型 } from '../db/types';
import { ロガー } from '../utils/logger';
import { uuid生成 } from '../utils/uuid';
import { firebaseAuthMiddleware } from '../middleware/firebase-auth-new';
// import type { プレイヤー応答, プレイヤー一覧応答, エラー応答 } from '@monster-game/shared'; // 将来の実装で使用

/**
 * Firebase認証環境変数型定義
 */
interface AuthEnv {
  AUTH_KV: KVNamespace;
  FIREBASE_PROJECT_ID: string;
  PUBLIC_JWK_CACHE_KEY: string;
  JWT_CACHE_TTL: string;
}

// プレイヤー作成リクエストの検証スキーマ（Player creation request validation schema）
const playerCreationSchema = z.object({
  /** プレイヤー名（Player name） */
  name: z.string().min(1, '名前は必須です').max(20, '名前は20文字以内で入力してください'),
  // Firebase UIDは認証ミドルウェアから取得するため、リクエストボディからは削除
});

// プレイヤー取得のパスパラメータ検証スキーマ（Player ID path parameter validation schema）
const playerIdSchema = z.object({
  id: z.string().min(1, 'プレイヤーIDは必須です'),
});

/**
 * プレイヤー関連のルーターを作成（Create player-related router）
 * 
 * 初学者向けメモ：（For beginners:）
 * - データベース型を明示的に指定することで型安全性を確保
 *   （Ensure type safety by explicitly specifying database types）
 * - この関数内でのデータベース操作はすべて型チェックされる
 *   （All database operations within this function are type-checked）
 * - IDEでオートコンプリートが効くようになる
 *   （Enable auto-completion in IDE）
 * - Firebase認証ミドルウェアを統合
 * 
 * @param db - 型安全なデータベース接続インスタンス（Type-safe database connection instance）
 * @param authEnv - Firebase認証に必要な環境変数
 * @returns Honoルーターインスタンス（Hono router instance）
 */
export function playerRouter(db: データベース型, authEnv: AuthEnv) {
  const app = new Hono();

  /**
   * プレイヤー作成API（Player creation API）
   * POST /api/players
   * 
   * 初学者向けメモ：（For beginners:）
   * - 新しいプレイヤーアカウントを作成（Create new player account）
   * - Firebase UIDと連携してアカウント管理（Link with Firebase UID for account management）
   * - 作成成功時はプレイヤー情報を返す（Return player information on successful creation）
   * - 作成後に初期モンスターを1体付与（Grant one initial monster after creation）
   */
  app.post('/', zValidator('json', playerCreationSchema), async (c) => {
    try {
      // Firebase認証チェック
      const authResult = await firebaseAuthMiddleware(c.req.raw, authEnv);
      if (!authResult.success) {
        return authResult.response;
      }

      const { name } = c.req.valid('json');
      const firebaseUid = authResult.user.uid; // 認証済みユーザーのUIDを使用
      
      // 一意IDを生成（Generate unique ID for CI environment compatibility）
      // nanoidはCI環境でCrypto APIエラーを起こすため、環境対応済みのuuid生成()を使用
      // （nanoid causes Crypto API errors in CI environment, so use environment-compatible uuid生成()）
      const playerId = uuid生成();
      const currentTime = new Date();
      
      // Firebase UIDの重複チェック（Check for Firebase UID duplication）
      const existingPlayer = await db
        .select()
        .from(players)
        .where(eq(players.firebaseUid, firebaseUid))
        .get();
      
      if (existingPlayer) {
        return c.json({
          success: false,
          message: 'このFirebase UIDは既に使用されています',
          error: 'FIREBASE_UID_ALREADY_EXISTS',
        }, 409);
      }
      
      // データベースに新しいプレイヤーを登録（Register new player in database）
      const creationResult = await db
        .insert(players)
        .values({
          id: playerId,
          name,
          firebaseUid,
          createdAt: currentTime,
          updatedAt: currentTime,
        })
        .returning();
      
      // 初学者向けメモ：配列の分割代入で undefined になる可能性をチェック
      // （For beginners: Check for undefined possibility with array destructuring）
      const newPlayer = creationResult[0];
      if (!newPlayer) {
        throw new Error('プレイヤーの作成に失敗しました');
      }
      
      // 初期モンスターを付与（Grant initial monster）
      const initialMonster = await grantInitialMonster(db, playerId);
      
      // 成功レスポンス（Success response）
      return c.json({
        success: true,
        message: 'プレイヤーが作成されました',
        data: {
          id: newPlayer.id,
          name: newPlayer.name,
          firebaseUid: newPlayer.firebaseUid,
          createdAt: newPlayer.createdAt,
          initialMonster: initialMonster ? {
            id: initialMonster.id,
            speciesName: initialMonster.speciesName,
            nickname: initialMonster.nickname,
            currentHp: initialMonster.currentHp,
            maxHp: initialMonster.maxHp,
          } : null,
        },
      }, 201);
      
    } catch (error) {
      ロガー.エラー('プレイヤー作成エラー', error instanceof Error ? error : new Error(String(error)));
      
      return c.json({
        success: false,
        message: 'プレイヤーの作成に失敗しました',
        error: error instanceof Error ? error.message : '不明なエラー',
      }, 500);
    }
  });

  /**
   * プレイヤー取得API（Player retrieval API）
   * GET /api/players/:id
   * 
   * 初学者向けメモ：（For beginners:）
   * - 指定されたIDのプレイヤー情報を取得（Retrieve player information for specified ID）
   * - 存在しない場合は404エラーを返す（Return 404 error if not found）
   */
  app.get('/:id', zValidator('param', playerIdSchema), async (c) => {
    try {
      // Firebase認証チェック
      const authResult = await firebaseAuthMiddleware(c.req.raw, authEnv);
      if (!authResult.success) {
        return authResult.response;
      }

      const { id } = c.req.valid('param');
      
      // データベースからプレイヤーを検索（Search for player in database）
      const [playerInfo] = await db
        .select()
        .from(players)
        .where(eq(players.id, id))
        .limit(1);
      
      // プレイヤーが見つからない場合（If player is not found）
      if (!playerInfo) {
        return c.json({
          success: false,
          message: '指定されたプレイヤーが見つかりません',
        }, 404);
      }
      
      // 成功レスポンス（Success response）
      return c.json({
        success: true,
        data: {
          id: playerInfo.id,
          name: playerInfo.name,
          firebaseUid: playerInfo.firebaseUid,
          createdAt: playerInfo.createdAt,
        },
      });
      
    } catch (error) {
      ロガー.エラー('プレイヤー取得エラー', error instanceof Error ? error : new Error(String(error)));
      
      return c.json({
        success: false,
        message: 'プレイヤーの取得に失敗しました',
        error: error instanceof Error ? error.message : '不明なエラー',
      }, 500);
    }
  });

  /**
   * プレイヤー一覧取得API（Player list retrieval API）
   * GET /api/players
   * 
   * 初学者向けメモ：（For beginners:）
   * - 全プレイヤーの一覧を取得（開発・テスト用）（Retrieve all players list for development/testing）
   * - 本番環境では認証やページネーションが必要（Authentication and pagination needed in production）
   */
  app.get('/', async (c) => {
    try {
      // Firebase認証チェック
      const authResult = await firebaseAuthMiddleware(c.req.raw, authEnv);
      if (!authResult.success) {
        return authResult.response;
      }

      // 全プレイヤーを取得（作成日時の降順）（Retrieve all players in descending order of creation time）
      const playerList = await db
        .select({
          id: players.id,
          name: players.name,
          firebaseUid: players.firebaseUid,
          createdAt: players.createdAt,
        })
        .from(players)
        .orderBy(players.createdAt);
      
      return c.json({
        success: true,
        data: playerList,
        count: playerList.length,
      });
      
    } catch (error) {
      ロガー.エラー('プレイヤー一覧取得エラー', error instanceof Error ? error : new Error(String(error)));
      
      return c.json({
        success: false,
        message: 'プレイヤー一覧の取得に失敗しました',
        error: error instanceof Error ? error.message : '不明なエラー',
      }, 500);
    }
  });

  return app;
}

/**
 * 初期モンスター付与関数（Initial monster granting function）
 * 
 * 初学者向けメモ：（For beginners:）
 * - 新規プレイヤーにスターターモンスターを1体付与（Grant one starter monster to new player）
 * - でんきネズミ、ほのおトカゲ、くさモグラの3種類からランダム選択（Random selection from 3 types: Electric Mouse, Fire Lizard, Grass Mole）
 * - 選択されたモンスターを所持モンスターテーブルに追加（Add selected monster to owned monsters table）
 * 
 * @param db - データベース接続インスタンス（Database connection instance）
 * @param playerId - 対象プレイヤーのID（Target player ID）
 * @returns 付与されたモンスターの情報、失敗時はnull（Granted monster information, null on failure）
 */
async function grantInitialMonster(db: データベース型, playerId: string) {
  try {
    // スターターモンスターの種族名を定義（Define starter monster species names）
    const starterSpeciesNames = ['でんきネズミ', 'ほのおトカゲ', 'くさモグラ'];
    
    // データベースからスターター種族を取得（Retrieve starter species from database）
    const starterSpeciesList = await db
      .select()
      .from(monsterSpecies)
      .where(inArray(monsterSpecies.name, starterSpeciesNames));
    
    if (starterSpeciesList.length === 0) {
      ロガー.警告('スターターモンスターが見つかりません', { starterSpeciesNames });
      return null;
    }
    
    // ランダムに1体選択（Randomly select one）
    const randomIndex = Math.floor(Math.random() * starterSpeciesList.length);
    const selectedSpecies = starterSpeciesList[randomIndex];
    
    if (!selectedSpecies) {
      ロガー.エラー('スターターモンスターの選択に失敗しました', new Error('選択された種族がundefinedです'));
      return null;
    }
    
    // 新しいモンスターを作成（Create new monster）
    const newMonster = {
      id: uuid生成(),
      playerId,
      speciesId: selectedSpecies.id,
      nickname: selectedSpecies.name, // デフォルトは種族名（Default is species name）
      currentHp: selectedSpecies.baseHp,
      maxHp: selectedSpecies.baseHp,
      obtainedAt: new Date(),
      updatedAt: new Date(),
    };
    
    // データベースに挿入（Insert into database）
    await db.insert(ownedMonsters).values(newMonster);
    
    ロガー.情報('初期モンスター付与成功', {
      playerId: playerId,
      monsterId: newMonster.id,
      speciesName: selectedSpecies.name,
    });
    
    // 付与されたモンスターの情報を返す（Return granted monster information）
    return {
      id: newMonster.id,
      speciesName: selectedSpecies.name,
      nickname: newMonster.nickname,
      currentHp: newMonster.currentHp,
      maxHp: newMonster.maxHp,
      obtainedAt: newMonster.obtainedAt,
    };
    
  } catch (error) {
    ロガー.エラー('初期モンスター付与中のエラー', error instanceof Error ? error : new Error(String(error)), {
      playerId: playerId,
    });
    return null;
  }
}

// 後方互換性のためのエイリアス（Backward compatibility aliases）
// 初学者向け：既存コードとの互換性を保ちながら段階的に移行するためのエイリアス
// （For beginners: Aliases for gradual migration while maintaining compatibility with existing code）

/** @deprecated Use playerRouter instead. プレイヤールーター → playerRouter への移行用エイリアス */
export const プレイヤールーター = playerRouter;

/** @deprecated Use grantInitialMonster instead. 初期モンスター付与 → grantInitialMonster への移行用エイリアス */
export const 初期モンスター付与 = grantInitialMonster;

/**
 * 初学者向けメモ：API設計のポイント（API design points for beginners）
 * 
 * 1. HTTPステータスコードの適切な使用（Proper use of HTTP status codes）
 *    - 201: 作成成功（Creation success）
 *    - 404: リソースが見つからない（Resource not found）
 *    - 409: 競合エラー（Conflict error）
 *    - 500: サーバーエラー（Server error）
 * 
 * 2. 一貫性のあるレスポンス形式（Consistent response format）
 *    - success フラグ、message、data を統一（Unify success flag, message, data）
 *    - エラー情報も含める（Include error information）
 * 
 * 3. バリデーション（Validation）
 *    - 入力データの検証は必須（Input data validation is essential）
 *    - 適切なエラーメッセージを返す（Return appropriate error messages）
 * 
 * 4. エラーハンドリング（Error handling）
 *    - try-catch で例外を捕捉（Catch exceptions with try-catch）
 *    - ログを出力してデバッグしやすくする（Output logs for easier debugging）
 * 
 * 5. Firebase認証統合（Firebase authentication integration）
 *    - Firebase UIDでユーザー識別（Identify users with Firebase UID）
 *    - UIDの重複チェック（Check for UID duplication）
 *    - 認証状態の検証（Verify authentication state）
 */