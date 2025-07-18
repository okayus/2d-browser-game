/**
 * Cloudflare Workers エントリーポイント
 * 
 * 初学者向けメモ：
 * - Cloudflare Workersで動作するHonoアプリケーション
 * - D1データベースとの連携
 * - CORSの設定でフロントエンドからのアクセスを許可
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { データベース初期化 } from './db/migration-simple';
import { ロガー } from './utils/logger';
import モンスターAPI from './api/monster';
import { firebaseAuthMiddleware } from './middleware/firebase-auth-new';

// Cloudflare Workers の環境変数型定義
interface Bindings {
  DB: D1Database; // D1データベース
  AUTH_KV?: KVNamespace; // Firebase認証用KV
  FIREBASE_PROJECT_ID?: string; // FirebaseプロジェクトID
  PUBLIC_JWK_CACHE_KEY?: string; // JWT公開鍵キャッシュキー
  JWT_CACHE_TTL?: string; // JWTキャッシュTTL
  [key: string]: unknown; // Honoの型制約に対応
}

// Honoアプリケーションの作成
const app = new Hono<{ Bindings: Bindings }>();

/**
 * CORS設定
 * 
 * 初学者向けメモ：
 * - Cross-Origin Resource Sharing（CORS）の設定
 * - フロントエンドからのAPIアクセスを許可するために必要
 * - 開発環境では localhostからのアクセスを許可
 */
app.use('/*', cors({
  origin: (origin, callback) => {
    // originがない場合（同一オリジンからのリクエスト）は許可
    if (!origin) {
      return callback(null, true);
    }
    
    // 許可するオリジンのパターン
    const allowedOrigins = [
      'http://localhost:5173', // Vite開発サーバー
      'http://localhost:5174', // Vite開発サーバー
      'http://localhost:5175', // Vite開発サーバー
      'http://localhost:3000', // 代替ポート
      'https://monster-game-frontend.pages.dev', // 本番Pages URL
      'https://0fa50877.monster-game-frontend.pages.dev', // プレビューPages URL
      'https://4d0814dc.monster-game-frontend.pages.dev', // 更新後Pages URL
    ];
    
    // 完全一致するオリジンがあれば許可
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Cloudflare Pagesのパターンマッチング（*.pages.dev）
    if (origin.match(/^https:\/\/[a-zA-Z0-9-]+\.pages\.dev$/)) {
      return callback(null, true);
    }
    
    // その他のオリジンは拒否
    callback(new Error('Not allowed by CORS'));
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

/**
 * ヘルスチェック用エンドポイント
 * GET /health
 * 
 * 初学者向けメモ：
 * - APIが正常に動作しているかを確認するエンドポイント
 * - 監視やデバッグで使用
 */
app.get('/health', (c) => {
  try {
    return c.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Monster Game API is running',
    });
  } catch (error) {
    console.error('Health check error:', error);
    return c.text('Health check failed', 500);
  }
});

/**
 * データベース初期化ミドルウェア
 */
app.use('/api/*', async (c, next) => {
  // テスト環境でDBが未定義の場合はスキップ
  if (c.env?.DB) {
    await データベース初期化(c.env.DB as D1Database);
  }
  await next();
});

/**
 * プレイヤーAPI実装（firebase-auth-cloudflare-workers版）
 */
app.post('/api/players', async (c) => {
  try {
    // Firebase認証チェック
    const authResult = await firebaseAuthMiddleware(c.req.raw, {
      AUTH_KV: c.env.AUTH_KV,
      FIREBASE_PROJECT_ID: c.env.FIREBASE_PROJECT_ID || '',
      PUBLIC_JWK_CACHE_KEY: c.env.PUBLIC_JWK_CACHE_KEY || '',
      JWT_CACHE_TTL: c.env.JWT_CACHE_TTL || '',
    });
    
    if (!authResult.success) {
      return authResult.response;
    }
    
    // 認証成功：プレイヤー作成処理
    const body = await c.req.json();
    const playerName = body.name;
    
    if (!playerName || typeof playerName !== 'string') {
      return c.json({ 
        success: false, 
        error: 'プレイヤー名が必要です' 
      }, 400);
    }

    // データベース接続の準備
    const { drizzle } = await import('drizzle-orm/d1');
    const { eq } = await import('drizzle-orm');
    const schema = await import('./db/schema');
    const { uuid生成 } = await import('./utils/uuid');
    
    const db = drizzle(c.env.DB as D1Database, { schema });
    const firebaseUid = authResult.user.uid;

    // Firebase UIDの重複チェック
    const existingPlayer = await db
      .select()
      .from(schema.players)
      .where(eq(schema.players.firebaseUid, firebaseUid))
      .get();
    
    if (existingPlayer) {
      return c.json({
        success: false,
        error: 'このFirebase UIDは既に使用されています'
      }, 409);
    }

    const playerId = uuid生成();
    const currentTime = new Date();
    
    // データベースに新しいプレイヤーを登録
    const newPlayer = await db
      .insert(schema.players)
      .values({
        id: playerId,
        name: playerName,
        firebaseUid: firebaseUid,
        createdAt: currentTime,
        updatedAt: currentTime,
      })
      .returning()
      .get();

    if (!newPlayer) {
      throw new Error('プレイヤーの作成に失敗しました');
    }

    // 初期モンスターを付与
    const initialMonster = await grantInitialMonster(db, playerId);
    
    ロガー.情報('プレイヤー作成成功', {
      playerId,
      playerName,
      firebaseUid: authResult.user.uid,
      initialMonsterId: initialMonster?.id
    });
    
    return c.json({
      success: true,
      message: 'プレイヤーが作成されました（Firebase認証）',
      data: {
        id: newPlayer.id,
        name: newPlayer.name,
        firebaseUid: newPlayer.firebaseUid,
        createdAt: newPlayer.createdAt.toISOString(),
        initialMonster: initialMonster ? {
          id: initialMonster.id,
          speciesName: initialMonster.speciesName,
          nickname: initialMonster.nickname,
          currentHp: initialMonster.currentHp,
          maxHp: initialMonster.maxHp,
        } : null,
      }
    }, 201);
    
  } catch (error) {
    ロガー.エラー('プレイヤー作成エラー', error instanceof Error ? error : new Error(String(error)));
    return c.json({ 
      success: false, 
      error: 'サーバーエラーが発生しました' 
    }, 500);
  }
});

/**
 * 初期モンスター付与関数（Initial monster granting function）
 * @param db - データベース接続インスタンス
 * @param playerId - 対象プレイヤーのID
 * @returns 付与されたモンスターの情報、失敗時はnull
 */
async function grantInitialMonster(db: any, playerId: string) {
  try {
    const { inArray } = await import('drizzle-orm');
    const schema = await import('./db/schema');
    const { uuid生成 } = await import('./utils/uuid');
    
    // スターターモンスターの種族名を定義
    const starterSpeciesNames = ['でんきネズミ', 'ほのおトカゲ', 'くさモグラ'];
    
    // データベースからスターター種族を取得
    const starterSpeciesList = await db
      .select()
      .from(schema.monsterSpecies)
      .where(inArray(schema.monsterSpecies.name, starterSpeciesNames));
    
    if (starterSpeciesList.length === 0) {
      ロガー.警告('スターターモンスターが見つかりません', { starterSpeciesNames });
      return null;
    }
    
    // ランダムに1体選択
    const randomIndex = Math.floor(Math.random() * starterSpeciesList.length);
    const selectedSpecies = starterSpeciesList[randomIndex];
    
    if (!selectedSpecies) {
      ロガー.エラー('スターターモンスターの選択に失敗しました', new Error('選択された種族がundefinedです'));
      return null;
    }
    
    // 新しいモンスターを作成
    const newMonster = {
      id: uuid生成(),
      playerId,
      speciesId: selectedSpecies.id,
      nickname: selectedSpecies.name, // デフォルトは種族名
      currentHp: selectedSpecies.baseHp,
      maxHp: selectedSpecies.baseHp,
      obtainedAt: new Date(),
      updatedAt: new Date(),
    };
    
    // データベースに挿入
    await db.insert(schema.ownedMonsters).values(newMonster);
    
    ロガー.情報('初期モンスター付与成功', {
      playerId: playerId,
      monsterId: newMonster.id,
      speciesName: selectedSpecies.name,
    });
    
    // 付与されたモンスターの情報を返す
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

// デバッグ用テストルート
app.get('/api/test', (c) => {
  return c.json({ message: 'API test endpoint works!' });
});

/**
 * 現在のFirebase UIDに紐づくプレイヤーを取得
 * GET /api/players/me
 * 
 * TDD実装：テストファースト開発で作成
 */
app.get('/api/players/me', async (c) => {
  try {
    // テスト環境でFirebase設定が不足している場合は401エラーを返す
    if (!c.env?.AUTH_KV || !c.env?.FIREBASE_PROJECT_ID) {
      return c.json({ error: '認証が必要です' }, 401);
    }
    
    // Firebase認証チェック
    const authResult = await firebaseAuthMiddleware(c.req.raw, {
      AUTH_KV: c.env.AUTH_KV,
      FIREBASE_PROJECT_ID: c.env.FIREBASE_PROJECT_ID || '',
      PUBLIC_JWK_CACHE_KEY: c.env.PUBLIC_JWK_CACHE_KEY || '',
      JWT_CACHE_TTL: c.env.JWT_CACHE_TTL || '',
    });
    
    if (!authResult.success) {
      return authResult.response;
    }

    // データベース接続の準備
    const { drizzle } = await import('drizzle-orm/d1');
    const { eq } = await import('drizzle-orm');
    const schema = await import('./db/schema');
    
    const db = drizzle(c.env.DB as D1Database, { schema });
    const firebaseUid = authResult.user.uid;

    // Firebase UIDでプレイヤーを検索
    const player = await db
      .select()
      .from(schema.players)
      .where(eq(schema.players.firebaseUid, firebaseUid))
      .get();
    
    if (!player) {
      return c.json({
        success: false,
        error: {
          code: 'PLAYER_NOT_FOUND',
          message: 'プレイヤーが見つかりません',
        },
      }, 404);
    }

    // プレイヤー情報を返す
    return c.json({
      success: true,
      data: {
        id: player.id,
        name: player.name,
        firebaseUid: player.firebaseUid,
        createdAt: player.createdAt.toISOString(),
      },
    });
    
  } catch (error) {
    ロガー.エラー('プレイヤー取得エラー', error instanceof Error ? error : new Error(String(error)));
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'サーバーエラーが発生しました',
      },
    }, 500);
  }
});

// テスト用：認証なしでモンスター一覧を取得（開発環境のみ）
app.get('/api/test/players/:playerId/monsters', async (c) => {
  if (c.env['ENVIRONMENT'] !== 'development') {
    return c.json({ error: 'This endpoint is only available in development mode' }, 403);
  }

  const { drizzle } = await import('drizzle-orm/d1');
  const { eq } = await import('drizzle-orm');
  const schema = await import('./db/schema');
  
  const db = drizzle(c.env.DB as D1Database, { schema });
  const { playerId } = c.req.param();

  try {
    const monsters = await db
      .select({
        id: schema.ownedMonsters.id,
        speciesId: schema.ownedMonsters.speciesId,
        ニックネーム: schema.ownedMonsters.nickname,
        現在hp: schema.ownedMonsters.currentHp,
        最大hp: schema.ownedMonsters.maxHp,
        種族: {
          id: schema.monsterSpecies.id,
          名前: schema.monsterSpecies.name,
        },
      })
      .from(schema.ownedMonsters)
      .leftJoin(
        schema.monsterSpecies,
        eq(schema.ownedMonsters.speciesId, schema.monsterSpecies.id)
      )
      .where(eq(schema.ownedMonsters.playerId, playerId))
      .all();

    return c.json({
      success: true,
      data: monsters,
      count: monsters.length,
    });
  } catch (error) {
    console.error('Test monsters fetch error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// テスト用：認証なしでモンスターHP更新（開発環境のみ）
app.put('/api/test/monsters/:monsterId', async (c) => {
  if (c.env['ENVIRONMENT'] !== 'development') {
    return c.json({ error: 'This endpoint is only available in development mode' }, 403);
  }

  const { drizzle } = await import('drizzle-orm/d1');
  const { eq } = await import('drizzle-orm');
  const schema = await import('./db/schema');
  const { ロガー } = await import('./utils/logger');
  
  const db = drizzle(c.env.DB as D1Database, { schema });
  const { monsterId } = c.req.param();

  try {
    // リクエストボディを解析
    const body = await c.req.json();
    const { currentHp } = body;

    // バリデーション
    if (typeof currentHp !== 'number' || currentHp < 0) {
      return c.json({ 
        success: false, 
        error: '無効なHP値です' 
      }, 400);
    }

    // モンスターの存在確認
    const existingMonster = await db
      .select()
      .from(schema.ownedMonsters)
      .where(eq(schema.ownedMonsters.id, monsterId))
      .get();

    if (!existingMonster) {
      return c.json({
        success: false,
        error: 'モンスターが見つかりません'
      }, 404);
    }

    // HPが最大HPを超えないようにチェック
    const finalHp = Math.min(currentHp, existingMonster.maxHp);

    // HPを更新
    const updatedMonster = await db
      .update(schema.ownedMonsters)
      .set({ 
        currentHp: finalHp,
        updatedAt: new Date()
      })
      .where(eq(schema.ownedMonsters.id, monsterId))
      .returning()
      .get();

    if (!updatedMonster) {
      throw new Error('モンスターの更新に失敗しました');
    }

    ロガー.情報('テスト環境：モンスターHP更新成功', {
      monsterId,
      previousHp: existingMonster.currentHp,
      newHp: finalHp,
      maxHp: existingMonster.maxHp
    });

    return c.json({
      success: true,
      message: 'モンスターのHPを更新しました',
      data: {
        id: updatedMonster.id,
        currentHp: updatedMonster.currentHp,
        maxHp: updatedMonster.maxHp
      }
    });

  } catch (error) {
    ロガー.エラー('テスト環境：モンスターHP更新エラー', error instanceof Error ? error : new Error(String(error)));
    return c.json({ 
      success: false, 
      error: 'モンスターの更新に失敗しました' 
    }, 500);
  }
});

// テスト用：認証なしでモンスターを追加（開発環境のみ）
app.post('/api/test/players/:playerId/monsters', async (c) => {
  if (c.env['ENVIRONMENT'] !== 'development') {
    return c.json({ error: 'This endpoint is only available in development mode' }, 403);
  }
  
  const { drizzle } = await import('drizzle-orm/d1');
  const { eq } = await import('drizzle-orm');
  const schema = await import('./db/schema');
  const { ロガー } = await import('./utils/logger');
  
  const db = drizzle(c.env.DB as D1Database, { schema });
  const { playerId } = c.req.param();
  
  try {
    const body = await c.req.json();
    const { speciesId, speciesName } = body;
    
    if (!speciesId && !speciesName) {
      return c.json({ success: false, error: 'speciesId or speciesName is required' }, 400);
    }
    
    // 種族データを取得してモンスターの基本情報を取得
    let species;
    
    // speciesIdが提供されている場合は、まずIDで検索
    if (speciesId) {
      species = await db
        .select()
        .from(schema.monsterSpecies)
        .where(eq(schema.monsterSpecies.id, speciesId))
        .get();
    }
    
    // speciesIdで見つからない場合、またはspeciesNameが提供されている場合は名前で検索
    if (!species) {
      // フロントエンドのIDからデータベースの名前へのマッピング
      const idToNameMap: Record<string, string> = {
        'electric_mouse': 'でんきネズミ',
        'fire_lizard': 'ほのおトカゲ',
        'water_turtle': 'みずガメ',
        'grass_seed': 'くさモグラ',
        'rock_snake': 'いわゴーレム'
      };
      
      const searchName = speciesName || idToNameMap[speciesId] || speciesId;
      species = await db
        .select()
        .from(schema.monsterSpecies)
        .where(eq(schema.monsterSpecies.name, searchName))
        .get();
    }
    
    if (!species) {
      ロガー.警告('テスト環境：種族が見つかりません', { speciesId, speciesName });
      return c.json({ success: false, error: 'Species not found' }, 404);
    }
    
    // 新しいモンスターを追加
    const { uuid生成 } = await import('./utils/uuid');
    const newMonster = await db
      .insert(schema.ownedMonsters)
      .values({
        id: uuid生成(),
        playerId,
        speciesId: species.id,
        nickname: species.name, // デフォルトのニックネームは種族名
        currentHp: species.baseHp,
        maxHp: species.baseHp,
        obtainedAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();
    
    ロガー.情報('テスト環境：モンスター追加成功', { playerId, speciesId, monsterId: newMonster.id });
    
    return c.json({
      success: true,
      message: 'モンスターが追加されました',
      data: newMonster,
    });
    
  } catch (error) {
    ロガー.エラー('テスト環境：モンスター追加エラー', error instanceof Error ? error : new Error(String(error)));
    return c.json({ success: false, error: 'モンスターの追加に失敗しました' }, 500);
  }
});

// テスト用：認証なしでモンスターニックネーム更新（開発環境のみ）
app.put('/api/test/monsters/:monsterId/nickname', async (c) => {
  if (c.env['ENVIRONMENT'] !== 'development') {
    return c.json({ error: 'This endpoint is only available in development mode' }, 403);
  }

  const { drizzle } = await import('drizzle-orm/d1');
  const { eq } = await import('drizzle-orm');
  const schema = await import('./db/schema');
  const { ロガー } = await import('./utils/logger');
  
  const db = drizzle(c.env.DB as D1Database, { schema });
  const { monsterId } = c.req.param();

  try {
    // リクエストボディを解析
    const body = await c.req.json();
    const { ニックネーム } = body;

    // バリデーション
    if (!ニックネーム || typeof ニックネーム !== 'string' || ニックネーム.trim() === '') {
      return c.json({ 
        success: false, 
        error: '無効なニックネーム値です' 
      }, 400);
    }

    // ニックネームの長さチェック
    if (ニックネーム.length > 20) {
      return c.json({ 
        success: false, 
        error: 'ニックネームは20文字以内にしてください' 
      }, 400);
    }

    // モンスターの存在確認
    const existingMonster = await db
      .select()
      .from(schema.ownedMonsters)
      .where(eq(schema.ownedMonsters.id, monsterId))
      .get();

    if (!existingMonster) {
      return c.json({
        success: false,
        error: 'モンスターが見つかりません'
      }, 404);
    }

    // ニックネームを更新
    const updatedMonster = await db
      .update(schema.ownedMonsters)
      .set({ 
        nickname: ニックネーム.trim(),
        updatedAt: new Date()
      })
      .where(eq(schema.ownedMonsters.id, monsterId))
      .returning()
      .get();

    if (!updatedMonster) {
      throw new Error('モンスターのニックネーム更新に失敗しました');
    }

    ロガー.情報('テスト環境：モンスターニックネーム更新成功', {
      monsterId,
      previousNickname: existingMonster.nickname,
      newNickname: ニックネーム.trim()
    });

    return c.json({
      success: true,
      message: 'ニックネームを更新しました',
      data: {
        id: updatedMonster.id,
        ニックネーム: updatedMonster.nickname
      }
    });

  } catch (error) {
    ロガー.エラー('テスト環境：モンスターニックネーム更新エラー', error instanceof Error ? error : new Error(String(error)));
    return c.json({ 
      success: false, 
      error: 'ニックネームの更新に失敗しました' 
    }, 500);
  }
});

// テスト用：認証なしでモンスター解放（開発環境のみ）
app.delete('/api/test/monsters/:monsterId', async (c) => {
  if (c.env['ENVIRONMENT'] !== 'development') {
    return c.json({ error: 'This endpoint is only available in development mode' }, 403);
  }

  const { drizzle } = await import('drizzle-orm/d1');
  const { eq } = await import('drizzle-orm');
  const schema = await import('./db/schema');
  const { ロガー } = await import('./utils/logger');
  
  const db = drizzle(c.env.DB as D1Database, { schema });
  const { monsterId } = c.req.param();

  try {
    // モンスターの存在確認
    const existingMonster = await db
      .select()
      .from(schema.ownedMonsters)
      .where(eq(schema.ownedMonsters.id, monsterId))
      .get();

    if (!existingMonster) {
      return c.json({
        success: false,
        error: 'モンスターが見つかりません'
      }, 404);
    }

    // モンスターを削除
    const deletedMonster = await db
      .delete(schema.ownedMonsters)
      .where(eq(schema.ownedMonsters.id, monsterId))
      .returning()
      .get();

    if (!deletedMonster) {
      throw new Error('モンスターの削除に失敗しました');
    }

    ロガー.情報('テスト環境：モンスター解放成功', {
      monsterId,
      nickname: existingMonster.nickname,
      playerId: existingMonster.playerId
    });

    return c.json({
      success: true,
      message: 'モンスターを解放しました',
      data: {
        id: deletedMonster.id,
        message: `${existingMonster.nickname || 'モンスター'}を解放しました`
      }
    });

  } catch (error) {
    ロガー.エラー('テスト環境：モンスター解放エラー', error instanceof Error ? error : new Error(String(error)));
    return c.json({ 
      success: false, 
      error: 'モンスターの解放に失敗しました' 
    }, 500);
  }
});

// モンスターAPIのマウント
app.route('/api', モンスターAPI);

/**
 * 404エラーハンドリング
 * 
 * 初学者向けメモ：
 * - 存在しないエンドポイントにアクセスした場合の処理
 * - 統一されたエラーレスポンスを返す
 */
app.notFound((c) => {
  return c.json({
    成功: false,
    エラー: {
      コード: 'NOT_FOUND',
      メッセージ: '指定されたエンドポイントが見つかりません',
    },
    リクエストURL: c.req.url,
  }, 404);
});

/**
 * グローバルエラーハンドリング
 * 
 * 初学者向けメモ：
 * - 未処理のエラーを捕捉
 * - 本番環境では詳細なエラー情報を非表示にする
 */
app.onError((error, c) => {
  ロガー.エラー('グローバルエラー', error);
  
  return c.json({
    成功: false,
    エラー: {
      コード: 'INTERNAL_ERROR',
      メッセージ: '内部サーバーエラーが発生しました',
    },
  }, 500);
});

// Cloudflare Workers のエクスポート
export default app;

/**
 * 初学者向けメモ：エントリーポイントの設計
 * 
 * 1. ミドルウェアの順序
 *    - CORS設定は最初に実行
 *    - データベース初期化は各APIアクセス前
 *    - エラーハンドリングは最後
 * 
 * 2. ルーティング設計
 *    - /health: ヘルスチェック
 *    - /api/players: プレイヤー関連
 *    - /api/monsters: モンスター関連
 * 
 * 3. エラーハンドリング
 *    - 404: ルートが見つからない
 *    - 500: サーバーエラー
 *    - 個別のAPIエラーは各ルーターで処理
 */