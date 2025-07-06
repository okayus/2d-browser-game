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
import { データベース初期化 } from './db/マイグレーション';
import { プレイヤールーター } from './api/プレイヤー';

// Cloudflare Workers の環境変数型定義
interface Env {
  DB: D1Database; // D1データベース
}

// Honoアプリケーションの作成
const app = new Hono<{ Bindings: Env }>();

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
 * - /api/players 以下のルートをプレイヤールーターに委譲
 * - データベース接続をルーターに渡す
 */
app.route('/api/players', async (c, next) => {
  // データベース接続を初期化
  const db = await データベース初期化(c.env.DB);
  
  // プレイヤールーターを呼び出し
  const プレイヤーAPI = プレイヤールーター(db);
  return プレイヤーAPI.fetch(c.req.raw, c.env);
});

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
    メッセージ: '指定されたエンドポイントが見つかりません',
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
  console.error('グローバルエラー:', error);
  
  return c.json({
    成功: false,
    メッセージ: '内部サーバーエラーが発生しました',
    エラー: error.message,
  }, 500);
});

// Cloudflare Workers のエクスポート
export default app;