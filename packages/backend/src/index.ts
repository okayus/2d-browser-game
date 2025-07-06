/**
 * バックエンドAPIのエントリーポイント
 * Hono + Cloudflare Workers による実装
 */

import { Hono } from 'hono';

/**
 * Honoアプリケーションインスタンス
 * 初学者向け解説: APIの基本となるアプリケーションオブジェクト
 */
const アプリ = new Hono();

/**
 * ヘルスチェック用エンドポイント
 * API動作確認用の基本的なエンドポイント
 */
アプリ.get('/health', (c) => {
  return c.json({
    成功: true,
    メッセージ: 'APIが正常に動作しています',
    タイムスタンプ: new Date().toISOString(),
  });
});

/**
 * ルートエンドポイント
 * APIの基本情報を返す
 */
アプリ.get('/', (c) => {
  return c.json({
    名前: 'モンスター収集ゲーム API',
    バージョン: '0.1.0',
    説明: 'プログラミング学習用のゲームAPI',
  });
});

export default アプリ;