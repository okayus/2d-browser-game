/**
 * 認証関連の型定義
 * 
 * 初学者向けメモ：
 * - Firebase認証に関する型定義を集約
 * - フロントエンドとバックエンドで共通の認証型を使用
 */

/**
 * Firebase認証ユーザー情報（Firebase authenticated user）
 * @description Firebase認証から取得されるユーザー情報
 * @example
 * const authUser: AuthUser = {
 *   uid: "firebase-unique-id",
 *   email: "user@example.com",
 *   emailVerified: true,
 *   displayName: "ユーザー名"
 * };
 */
export interface AuthUser {
  /** Firebase UID（一意識別子）（Firebase unique identifier） */
  uid: string;
  /** メールアドレス（Email address） */
  email?: string;
  /** メール確認済みフラグ（Email verification status） */
  emailVerified?: boolean;
  /** 表示名（Display name） */
  displayName?: string;
  /** プロフィール画像URL（Profile picture URL） */
  photoURL?: string;
  /** 電話番号（Phone number） */
  phoneNumber?: string;
}

/**
 * ログインリクエストデータ（Login request data）
 * @description ログインAPI呼び出し時のリクエストデータ
 * @example
 * const loginData: LoginRequest = {
 *   email: "user@example.com",
 *   password: "secure-password"
 * };
 */
export interface LoginRequest {
  /** メールアドレス（Email address） */
  email: string;
  /** パスワード（Password） */
  password: string;
}

/**
 * 認証トークン情報（Auth token information）
 * @description Firebase IDトークンとリフレッシュトークン
 * @example
 * const tokens: AuthTokens = {
 *   idToken: "eyJhbGciOiJSUzI1NiIs...",
 *   refreshToken: "refresh-token-string",
 *   expiresIn: 3600
 * };
 */
export interface AuthTokens {
  /** Firebase IDトークン（Firebase ID token） */
  idToken: string;
  /** リフレッシュトークン（Refresh token） */
  refreshToken?: string;
  /** 有効期限（秒）（Expiry time in seconds） */
  expiresIn?: number;
}

/**
 * 認証状態（Authentication state）
 * @description アプリケーションの認証状態を管理
 * @example
 * const authState: AuthState = {
 *   isAuthenticated: true,
 *   user: { uid: "...", email: "user@example.com" },
 *   loading: false
 * };
 */
export interface AuthState {
  /** 認証済みフラグ（Authentication status） */
  isAuthenticated: boolean;
  /** 認証済みユーザー情報（Authenticated user info） */
  user: AuthUser | null;
  /** ローディング状態（Loading state） */
  loading: boolean;
  /** エラー情報（Error information） */
  error?: string;
}

/**
 * ソーシャルログインプロバイダー（Social login providers）
 * @description 対応しているソーシャルログインプロバイダー
 * @example
 * const provider: SocialProvider = 'google';
 */
export type SocialProvider = 'google' | 'email';

/**
 * 初学者向けメモ：認証フローの実装パターン
 * 
 * 1. ログインフロー
 *    - ユーザーがメール/パスワードまたはGoogleでログイン
 *    - Firebase SDKがIDトークンを発行
 *    - IDトークンをバックエンドAPIに送信
 *    - バックエンドがトークンを検証してセッション作成
 * 
 * 2. 認証状態管理
 *    - AuthStateでアプリ全体の認証状態を管理
 *    - loadingフラグでUI制御
 *    - エラーハンドリングでユーザーフィードバック
 * 
 * 3. トークン管理
 *    - IDトークンは1時間で期限切れ
 *    - リフレッシュトークンで自動更新
 *    - APIリクエスト時にAuthorizationヘッダーに付与
 * 
 * 4. セキュリティベストプラクティス
 *    - パスワードは常にHTTPS通信で送信
 *    - トークンはローカルストレージではなくメモリで管理
 *    - センシティブな情報はフロントエンドに露出しない
 */