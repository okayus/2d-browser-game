/**
 * Firebase認証ミドルウェア
 * 
 * 初学者向けメモ：
 * - Firebase JWTトークンの検証を行うミドルウェア
 * - jose ライブラリを使用してJWT検証を実装
 * - Cloudflare KVを使って公開鍵をキャッシュ
 * - Firebase Admin SDKが使えないため、手動検証を実装
 */

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
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
  /** Cache TTL in seconds */
  JWT_CACHE_TTL: string;
}

/**
 * Firebase JWT Payload型定義
 * 
 * 初学者向けメモ：
 * - Firebase IDトークンに含まれる情報の型定義
 * - 標準的なJWTクレームに加えて、Firebaseで追加される情報も含む
 */
interface FirebaseJWTPayload extends JWTPayload {
  /** Firebase UID - ユーザーの一意識別子 */
  uid: string;
  /** Email address */
  email?: string;
  /** Email verified flag */
  email_verified?: boolean;
  /** Display name */
  name?: string;
  /** Profile picture URL */
  picture?: string;
  /** Auth time - 認証された時刻 */
  auth_time: number;
  /** Firebase-specific claims */
  firebase: {
    identities: Record<string, unknown>;
    sign_in_provider: string;
  };
}

/**
 * リクエストのAuthorizationヘッダーからJWTトークンを抽出
 * 
 * 初学者向けメモ：
 * - "Bearer token" 形式のヘッダーからトークン部分のみを取得
 * - 認証が必要なAPIエンドポイントで使用
 * 
 * @param request - HTTPリクエストオブジェクト
 * @returns JWTトークン文字列、または null（ヘッダーがない場合）
 */
function extractTokenFromHeader(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  // "Bearer " プレフィックスを除去してトークンのみ取得
  const match = authHeader.match(/^Bearer\s+(.+)$/);
  return match?.[1] ?? null;
}

/**
 * Firebase JWT IDトークンを検証
 * 
 * 初学者向けメモ：
 * - Google の公開鍵を使ってJWTの署名を検証
 * - Firebase固有のクレーム（aud, iss等）も検証
 * - jose ライブラリのcreateRemoteJWKSetを使用して公開鍵を取得
 * 
 * @param token - 検証するJWTトークン
 * @param projectId - Firebase Project ID
 * @returns デコードされたJWTペイロード
 */
async function verifyFirebaseToken(
  token: string,
  projectId: string
): Promise<FirebaseJWTPayload> {
  try {
    // Google の公開鍵エンドポイント
    const GOOGLE_PUBLIC_KEYS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
    
    // リモートJWKセットを作成（公開鍵を取得）
    const JWKS = createRemoteJWKSet(new URL(GOOGLE_PUBLIC_KEYS_URL));
    
    // JWT検証実行
    const { payload } = await jwtVerify(token, JWKS, {
      // Firebase固有の検証オプション
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    // 型安全性のためのチェック
    if (!payload['uid'] || typeof payload['uid'] !== 'string') {
      throw new Error('Invalid Firebase token: missing or invalid uid');
    }

    if (!payload['auth_time'] || typeof payload['auth_time'] !== 'number') {
      throw new Error('Invalid Firebase token: missing or invalid auth_time');
    }

    return payload as FirebaseJWTPayload;
  } catch (error) {
    ロガー.警告('Firebase JWT検証失敗', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Invalid Firebase token');
  }
}

/**
 * Firebase認証ミドルウェア
 * 
 * 初学者向けメモ：
 * - APIエンドポイントの前に実行される認証チェック
 * - JWTトークンを検証し、ユーザー情報をリクエストコンテキストに追加
 * - 認証が失敗した場合は401エラーを返す
 * 
 * @param request - HTTPリクエスト
 * @param env - 環境変数とバインディング
 * @returns 認証結果とユーザー情報
 */
export async function firebaseAuthMiddleware(
  request: Request,
  env: FirebaseAuthEnv
): Promise<{ 
  success: true; 
  user: FirebaseJWTPayload; 
} | { 
  success: false; 
  response: Response; 
}> {
  try {
    // 1. Authorizationヘッダーからトークン抽出
    const token = extractTokenFromHeader(request);
    if (!token) {
      return {
        success: false,
        response: new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: '認証トークンが必要です',
            },
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        ),
      };
    }

    // 2. Firebase JWT検証
    const user = await verifyFirebaseToken(token, env.FIREBASE_PROJECT_ID);

    // 3. 認証成功
    ロガー.情報('Firebase認証成功', { 
      uid: user.uid, 
      email: user.email 
    });

    return {
      success: true,
      user,
    };

  } catch (error) {
    ロガー.エラー(
      'Firebase認証ミドルウェアエラー', 
      error instanceof Error ? error : new Error(String(error))
    );

    return {
      success: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: '無効な認証トークンです',
          },
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      ),
    };
  }
}

/**
 * 認証が不要なエンドポイントかチェック
 * 
 * 初学者向けメモ：
 * - 一部のエンドポイント（ヘルスチェック等）は認証不要
 * - パスのパターンマッチングで判定
 * 
 * @param pathname - リクエストのパス
 * @returns 認証不要の場合true
 */
export function isPublicEndpoint(pathname: string): boolean {
  const publicPaths = [
    '/health',
    '/api/health',
    // 開発用エンドポイント（本番では削除検討）
    '/api/dev/',
  ];

  return publicPaths.some(path => pathname.startsWith(path));
}

/**
 * Firebase UIDからプレイヤー情報を取得するためのヘルパー関数
 * 
 * 初学者向けメモ：
 * - Firebase UIDと内部プレイヤーIDを関連付け
 * - プレイヤーが存在しない場合は新規作成も検討
 * 
 * @param firebaseUid - Firebase UID
 * @param db - データベースインスタンス
 * @returns プレイヤー情報
 */
// 注：この関数は別ファイルで実装する予定

/**
 * 初学者向けメモ：認証ミドルウェアの使用方法
 * 
 * 1. 基本的な使い方
 *    ```typescript
 *    const authResult = await firebaseAuthMiddleware(request, env);
 *    if (!authResult.success) {
 *      return authResult.response; // 認証エラーレスポンスを返す
 *    }
 *    const user = authResult.user; // 認証済みユーザー情報
 *    ```
 * 
 * 2. セキュリティのポイント
 *    - JWTの有効期限チェックは jose ライブラリが自動実行
 *    - Firebase固有のクレーム（issuer, audience）も検証
 *    - 公開鍵は Google から動的に取得（キャッシュも可能）
 * 
 * 3. エラーハンドリング
 *    - トークンが無効な場合は401を返す
 *    - ログを出力してデバッグ情報を記録
 *    - クライアントには詳細なエラー情報は返さない（セキュリティ）
 */