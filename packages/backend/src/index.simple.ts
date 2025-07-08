/**
 * シンプルなD1接続テスト用エンドポイント
 * 
 * 初学者向けメモ：
 * - 最小限の構成でD1データベースへの接続をテスト
 * - 基本的なCRUD操作の動作確認
 * - 統合テストの基盤として使用
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from './db/スキーマ';

// 環境変数の型定義
type Bindings = {
  DB: D1Database;
}

// Honoアプリケーションの作成
const app = new Hono<{ Bindings: Bindings }>();

// CORS設定（開発用）
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

/**
 * ヘルスチェック
 * GET /health
 */
app.get('/health', async (c) => {
  try {
    // データベース接続テスト
    const db = drizzle(c.env.DB, { schema });
    const result = await db.select({ count: schema.モンスター種族.id })
      .from(schema.モンスター種族)
      .limit(1);
    
    return c.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * モンスター種族一覧取得
 * GET /monster-species
 */
app.get('/monster-species', async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const species = await db.select().from(schema.モンスター種族);
    
    return c.json({
      success: true,
      data: species,
      count: species.length,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * プレイヤー作成
 * POST /players
 */
app.post('/players', async (c) => {
  try {
    const { name } = await c.req.json<{ name: string }>();
    
    if (!name || name.length < 1 || name.length > 20) {
      return c.json({
        success: false,
        error: 'プレイヤー名は1〜20文字で入力してください',
      }, 400);
    }
    
    const db = drizzle(c.env.DB, { schema });
    
    // プレイヤーIDの生成（簡易版）
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    // プレイヤーの作成
    await db.insert(schema.プレイヤー).values({
      id: playerId,
      名前: name,
      作成日時: now,
      更新日時: now,
    });
    
    // 初期モンスターの付与
    const initialMonsterId = `monster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const electricMouse = await db.select()
      .from(schema.モンスター種族)
      .where(eq(schema.モンスター種族.id, 'electric_mouse'))
      .limit(1);
    
    if (electricMouse.length > 0) {
      await db.insert(schema.所持モンスター).values({
        id: initialMonsterId,
        プレイヤーid: playerId,
        種族id: 'electric_mouse',
        ニックネーム: electricMouse[0].名前,
        現在hp: electricMouse[0].基本hp,
        最大hp: electricMouse[0].基本hp,
        取得日時: now,
        更新日時: now,
      });
    }
    
    return c.json({
      success: true,
      data: {
        id: playerId,
        name: name,
        initialMonsterId: initialMonsterId,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * プレイヤーの所持モンスター一覧取得
 * GET /players/:id/monsters
 */
app.get('/players/:id/monsters', async (c) => {
  try {
    const playerId = c.req.param('id');
    const db = drizzle(c.env.DB, { schema });
    
    // プレイヤーの存在確認
    const player = await db.select()
      .from(schema.プレイヤー)
      .where(eq(schema.プレイヤー.id, playerId))
      .limit(1);
    
    if (player.length === 0) {
      return c.json({
        success: false,
        error: 'プレイヤーが見つかりません',
      }, 404);
    }
    
    // 所持モンスターの取得（種族情報も含む）
    const monsters = await db
      .select({
        id: schema.所持モンスター.id,
        ニックネーム: schema.所持モンスター.ニックネーム,
        現在hp: schema.所持モンスター.現在hp,
        最大hp: schema.所持モンスター.最大hp,
        取得日時: schema.所持モンスター.取得日時,
        種族名: schema.モンスター種族.名前,
        種族説明: schema.モンスター種族.説明,
      })
      .from(schema.所持モンスター)
      .innerJoin(
        schema.モンスター種族,
        eq(schema.所持モンスター.種族id, schema.モンスター種族.id)
      )
      .where(eq(schema.所持モンスター.プレイヤーid, playerId));
    
    return c.json({
      success: true,
      data: {
        player: player[0],
        monsters: monsters,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// エラーハンドリング
app.onError((err, c) => {
  console.error(`Error: ${err}`);
  return c.json({
    success: false,
    error: 'Internal server error',
  }, 500);
});

export default app;

/**
 * 初学者向けメモ：このファイルのポイント
 * 
 * 1. 最小限の構成
 *    - 複雑なミドルウェアやルーティングを排除
 *    - D1データベースとの基本的な接続のみ
 * 
 * 2. エラーハンドリング
 *    - try-catchで全てのエラーを捕捉
 *    - 詳細なエラーメッセージを返す
 * 
 * 3. 基本的なCRUD操作
 *    - Create: プレイヤー作成
 *    - Read: モンスター種族一覧、所持モンスター一覧
 *    - JOINを使った関連データの取得
 * 
 * 4. テストしやすい設計
 *    - 各エンドポイントが独立
 *    - レスポンスが一貫した形式
 */