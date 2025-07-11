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
import { データベース初期化 } from './db/migration';
import { ロガー } from './utils/logger';
import { プレイヤールーター } from './api/player';
import モンスターAPI from './api/monster';

// Cloudflare Workers の環境変数型定義
type Bindings = {
  DB: D1Database; // D1データベース
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
  return c.json({
    ステータス: 'OK',
    タイムスタンプ: new Date().toISOString(),
    メッセージ: 'モンスター収集ゲームAPIが正常に動作しています',
  });
});

/**
 * APIルートの設定
 * 
 * 初学者向けメモ：
 * - 各APIルーターをマウント
 * - データベース初期化も含む
 */
app.use('/api/*', async (c, next) => {
  // データベース初期化
  await データベース初期化(c.env.DB);
  await next();
});

// プレイヤーAPIのマウント
app.route('/api/players', (() => {
  const プレイヤーApp = new Hono<{ Bindings: Bindings }>();
  
  // 全てのプレイヤーエンドポイント
  プレイヤーApp.all('/*', async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const router = プレイヤールーター(db);
    return router.fetch(c.req.raw, c.env);
  });
  
  return プレイヤーApp;
})());

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