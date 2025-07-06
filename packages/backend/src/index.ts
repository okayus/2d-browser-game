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
import { ロガー } from './utils/ロガー';
// import { プレイヤールーター } from './api/プレイヤー'; // 一時的にコメントアウト

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
/**
 * 一時的な実装: 直接ルートを定義
 * 
 * 初学者向けメモ：
 * - データベース接続とルーターの統合を簡略化
 * - 今後のリファクタリングで改善予定
 */
app.get('/api/players', async (c) => {
  await データベース初期化(c.env.DB);
  // 一時的に空配列を返す（今後実装）
  return c.json({ 成功: true, データ: [], 件数: 0 });
});

app.post('/api/players', async (c) => {
  await データベース初期化(c.env.DB);
  // 一時的な実装（今後プレイヤールーターに移行）
  return c.json({ 成功: true, メッセージ: 'プレイヤー作成（実装中）' });
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
  ロガー.エラー('グローバルエラー', error);
  
  return c.json({
    成功: false,
    メッセージ: '内部サーバーエラーが発生しました',
    エラー: error.message,
  }, 500);
});

// Cloudflare Workers のエクスポート
export default app;