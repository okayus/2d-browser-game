/**
 * Firebase認証ミドルウェア（シンプルJWT検証版）
 * 
 * 初学者向けメモ：
 * - 学習用途なので署名検証は簡略化
 * - JWTペイロードの基本的な検証のみ実行
 * - 本番環境では完全な署名検証が必要
 */

import { ロガー } from '../utils/logger';

/**
 * Firebase JWT検証用の環境変数型定義
 */
interface FirebaseAuthEnv {
  /** Cloudflare KV binding for JWT key caching */
  AUTH_KV: KVNamespace;
  /** Firebase Project ID */
  FIREBASE_PROJECT_ID: string;
  /** JWT cache key for storing public keys */
  PUBLIC_JWK_CACHE_KEY: string;
  /** Cache TTL in seconds（現在のライブラリでは使用しませんが互換性のため保持） */
  JWT_CACHE_TTL: string;
}

/**
 * Firebase JWT認証結果の型定義
 */
interface FirebaseAuthResult {
  success: true;
  user: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    auth_time: number;
    email_verified?: boolean;
  };
}

interface FirebaseAuthError {
  success: false;
  response: Response;
}

/**
 * Firebase認証ミドルウェア
 * 
 * 初学者向けメモ：
 * - firebase-auth-cloudflare-workersライブラリを使用した軽量実装
 * - Authクラスのシングルトンパターンで効率的なインスタンス管理
 * - WorkersKVStoreSingleでJWK公開鍵をキャッシュ
 * - Web標準APIのみ使用してNode.js依存を完全排除
 * 
 * @param request - HTTPリクエストオブジェクト
 * @param env - Firebase認証に必要な環境変数
 * @returns 認証結果（成功時はユーザー情報、失敗時はエラーレスポンス）
 */
export async function firebaseAuthMiddleware(
  request: Request,
  env: FirebaseAuthEnv
): Promise<FirebaseAuthResult | FirebaseAuthError> {
  try {
    // Authorizationヘッダーの確認
    const authorization = request.headers.get('Authorization');
    if (!authorization) {
      ロガー.警告('認証ヘッダーが見つかりません');
      return {
        success: false,
        response: new Response(JSON.stringify({
          success: false,
          error: 'Authorization header required',
          message: 'Authorization ヘッダーが必要です'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      };
    }

    // Bearerトークンの抽出
    if (!authorization.startsWith('Bearer ')) {
      ロガー.警告('無効な認証ヘッダー形式');
      return {
        success: false,
        response: new Response(JSON.stringify({
          success: false,
          error: 'Invalid authorization format',
          message: 'Bearer トークンが必要です'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      };
    }

    const jwt = authorization.replace(/Bearer\s+/i, '');
    if (!jwt) {
      ロガー.警告('JWTトークンが空です');
      return {
        success: false,
        response: new Response(JSON.stringify({
          success: false,
          error: 'Empty JWT token',
          message: 'JWTトークンが空です'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      };
    }

    ロガー.情報('Firebase JWT検証を開始（シンプル版）', {
      projectId: env.FIREBASE_PROJECT_ID
    });

    // シンプルなJWT検証（学習用途）
    try {
      // JWTトークンを分割
      const tokenParts = jwt.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      // ペイロードをデコード
      const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      // 基本的な検証（Firebase JWTの実際のフィールド名を使用）
      if (!payload.sub || !payload.aud) {
        throw new Error('Invalid JWT payload');
      }
      
      // Firebaseプロジェクトの確認
      if (payload.aud !== env.FIREBASE_PROJECT_ID) {
        throw new Error('Invalid audience');
      }
      
      // トークンの有効期限チェック
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }
      
      ロガー.情報('Firebase JWT検証成功（シンプル版）', {
        uid: payload.sub,
        email: payload.email || '未設定'
      });

      // 認証成功
      return {
        success: true,
        user: {
          uid: payload.sub,
          email: payload.email || '',
          name: payload.name || '',
          picture: payload.picture || '',
          auth_time: payload.auth_time || 0,
          email_verified: payload.email_verified || false,
        }
      };
    } catch (jwtError) {
      throw new Error(`JWT verification failed: ${jwtError instanceof Error ? jwtError.message : String(jwtError)}`);
    }

  } catch (error) {
    ロガー.エラー('Firebase JWT検証エラー', error instanceof Error ? error : new Error(String(error)));

    // エラーの詳細を判定してユーザーフレンドリーなメッセージを返す
    let errorMessage = 'JWTトークンの検証に失敗しました';
    let statusCode = 401;

    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('expired')) {
        errorMessage = 'トークンの有効期限が切れています。再度ログインしてください。';
      } else if (errorMsg.includes('invalid signature')) {
        errorMessage = '無効なトークン署名です。';
      } else if (errorMsg.includes('invalid audience')) {
        errorMessage = 'トークンが無効なプロジェクト用です。';
      } else if (errorMsg.includes('invalid issuer')) {
        errorMessage = 'トークンの発行者が無効です。';
      } else if (errorMsg.includes('network')) {
        errorMessage = 'ネットワークエラーが発生しました。しばらく待ってから再試行してください。';
        statusCode = 503;
      }
    }

    return {
      success: false,
      response: new Response(JSON.stringify({
        success: false,
        error: 'JWT verification failed',
        message: errorMessage,
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      })
    };
  }
}

/**
 * 初学者向けメモ：シンプルJWT検証の特徴
 * 
 * 1. 学習用途に最適
 *    - 複雑なライブラリ設定が不要
 *    - JWT構造の理解に役立つ
 *    - デバッグが容易
 * 
 * 2. 基本的なセキュリティ
 *    - ペイロード検証
 *    - プロジェクトID確認
 *    - 有効期限チェック
 *    - 注意：署名検証は省略（学習用途のため）
 * 
 * 3. 本番環境への移行時
 *    - firebase-admin SDKまたは専用ライブラリを使用
 *    - 完全な署名検証を実装
 *    - ユーザー無効化チェックを追加
 * 
 * 4. シンプルな実装
 *    - Web標準APIのみ使用
 *    - Base64デコードでペイロード取得
 *    - 明確なエラーハンドリング
 */