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
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';
import { データベース初期化 } from './db/migration-simple';
import { ロガー } from './utils/logger';
import { playerRouter } from './api/player';
import モンスターAPI from './api/monster';
import { firebaseAuthMiddleware } from './middleware/firebase-auth-new';

// Cloudflare Workers の環境変数型定義
type Bindings = {
  DB: D1Database; // D1データベース
  AUTH_KV?: KVNamespace; // Firebase認証用KV
  FIREBASE_PROJECT_ID?: string; // FirebaseプロジェクトID
  PUBLIC_JWK_CACHE_KEY?: string; // JWT公開鍵キャッシュキー
  JWT_CACHE_TTL?: string; // JWTキャッシュTTL
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
  origin: [
    'http://localhost:5173', // Vite開発サーバー
    'http://localhost:5174', // Vite開発サーバー
    'http://localhost:3000', // 代替ポート
    'https://*.pages.dev',   // Cloudflare Pages
  ],
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
  await データベース初期化(c.env.DB);
  await next();
});

/**
 * プレイヤーAPI実装（firebase-auth-cloudflare-workers版）
 */
app.post('/api/players', async (c) => {
  try {
    // Firebase認証チェック
    const authResult = await firebaseAuthMiddleware(c.req, c.env);
    
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

    const playerId = crypto.randomUUID();
    
    ロガー.情報('プレイヤー作成成功', {
      playerId,
      playerName,
      firebaseUid: authResult.user.uid
    });
    
    return c.json({
      success: true,
      message: 'プレイヤーが作成されました（Firebase認証）',
      data: {
        id: playerId,
        name: playerName,
        firebaseUid: authResult.user.uid,
        email: authResult.user.email || '',
        createdAt: new Date().toISOString(),
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

// デバッグ用テストルート
app.get('/api/test', (c) => {
  return c.json({ message: 'API test endpoint works!' });
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