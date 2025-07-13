/**
 * Firebase設定とAuth初期化
 * 
 * 初学者向けメモ：
 * - Firebase SDKの初期化設定
 * - 環境変数でのconfig管理
 * - Auth機能のエクスポート
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

/**
 * Firebase設定
 * 
 * 初学者向けメモ：
 * - これらの値は実際のFirebaseプロジェクト作成後に更新が必要
 * - 環境変数で管理することでセキュリティを向上
 * - Viteでは VITE_ プレフィックスが必要
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

/**
 * Firebase アプリケーション初期化
 * 
 * 初学者向けメモ：
 * - Firebaseプロジェクトとの接続を確立
 * - 設定情報を元にアプリケーションを初期化
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Authentication初期化
 * 
 * 初学者向けメモ：
 * - 認証機能を利用するためのAuth インスタンス
 * - ログイン、ログアウト、ユーザー状態管理に使用
 */
export const auth = getAuth(app);

/**
 * 開発環境でのAuth エミュレーター接続
 * 
 * 初学者向けメモ：
 * - ローカル開発時はFirebaseエミュレーターを使用可能
 * - 本番データに影響せずテストが可能
 * - 現在は無効化（必要に応じて有効化）
 */
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('🔥 Firebase Auth エミュレーターに接続しました');
  } catch (error) {
    console.warn('Firebase Auth エミュレーターへの接続に失敗:', error);
  }
}

/**
 * Firebase アプリケーション インスタンス
 * 
 * 初学者向けメモ：
 * - 他のFirebaseサービス（Firestore等）を使用する際に必要
 * - 現在は認証のみ使用
 */
export default app;

/**
 * 初学者向けメモ：Firebase設定のセキュリティ
 * 
 * 1. API Key等の情報について
 *    - これらの値は公開されても問題ない（フロントエンド用）
 *    - セキュリティは Firebase Security Rules で制御
 *    - ただし環境変数管理は良いプラクティス
 * 
 * 2. 環境変数での管理
 *    - 本番/開発環境で異なる設定を使い分け可能
 *    - .env.local ファイルで値を設定
 *    - Viteでは VITE_ プレフィックスが必須
 * 
 * 3. エミュレーター使用
 *    - 開発中は本番Firebaseではなくローカルエミュレーター使用推奨
 *    - テストデータが本番に影響しない
 *    - オフライン開発が可能
 */