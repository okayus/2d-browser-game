/**
 * 最小限のCloudflare Workers エントリーポイント
 * 動作確認用の最小実装
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Cloudflare Workers の環境変数型定義
type Bindings = {
  DB: D1Database; // D1データベース
}

// Honoアプリケーションの作成
const app = new Hono<{ Bindings: Bindings }>();

// CORS設定
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // フロントエンドのURL
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ヘルスチェックエンドポイント
app.get('/', (c) => {
  return c.json({
    message: 'Monster Game Backend is running!',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'unknown'
  });
});

// プレイヤー作成の最小実装
app.post('/api/players', async (c) => {
  try {
    const body = await c.req.json();
    const playerName = body.name || body.名前;
    
    if (!playerName || typeof playerName !== 'string') {
      return c.json({ 
        success: false, 
        error: 'プレイヤー名が必要です' 
      }, 400);
    }

    if (playerName.length < 1 || playerName.length > 20) {
      return c.json({ 
        success: false, 
        error: 'プレイヤー名は1文字以上20文字以下で入力してください' 
      }, 400);
    }

    // 簡単なUUID生成
    const playerId = crypto.randomUUID();
    const initialMonsterId = crypto.randomUUID(); // 初期モンスターのID
    
    return c.json({
      success: true,
      data: {
        id: playerId,
        name: playerName,
        createdAt: new Date().toISOString(),
        initialMonsterId: initialMonsterId
      }
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'サーバーエラーが発生しました' 
    }, 500);
  }
});

export default app;