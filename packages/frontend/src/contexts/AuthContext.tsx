/**
 * Firebase認証状態管理のContext
 * 
 * 初学者向けメモ：
 * - React Contextを使用してアプリ全体で認証状態を共有
 * - Firebase Authの状態変化を監視してローカル状態を更新
 * - ログイン、ログアウト、ユーザー情報取得の機能を提供
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

/**
 * 認証状態の型定義
 * 
 * 初学者向けメモ：
 * - currentUser: 現在ログイン中のFirebaseユーザー（null: ログアウト状態）
 * - loading: 認証状態の読み込み中かどうか（初回読み込み時など）
 * - error: 認証エラーメッセージ（ログイン失敗時など）
 */
interface AuthState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * 認証機能の型定義
 * 
 * 初学者向けメモ：
 * - 各関数はPromiseを返し、成功/失敗の処理が可能
 * - エラーハンドリングは各関数内で実装
 */
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

/**
 * AuthContext作成
 * 
 * 初学者向けメモ：
 * - Contextの初期値はundefined（Providerで包まれていない場合はエラー）
 * - 型安全性のためにundefinedを許可して後でチェック
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthContext使用のためのカスタムフック
 * 
 * 初学者向けメモ：
 * - Contextが正しく設定されているかチェック
 * - Providerで包まれていない場合はエラーを投げる
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Propsの型定義
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Firebase認証プロバイダーコンポーネント
 * 
 * 初学者向けメモ：
 * - アプリ全体を包んで認証機能を提供
 * - Firebase Authの状態変化を監視
 * - 認証関連の処理を一元管理
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 認証状態の管理
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * エラーメッセージをクリア
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Firebaseエラーメッセージを日本語に変換
   * 
   * 初学者向けメモ：
   * - Firebase Authのエラーコードを日本語メッセージに変換
   * - ユーザーフレンドリーなエラー表示のため
   */
  const getJapaneseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'ユーザーが見つかりません';
      case 'auth/wrong-password':
        return 'パスワードが間違っています';
      case 'auth/email-already-in-use':
        return 'このメールアドレスは既に使用されています';
      case 'auth/weak-password':
        return 'パスワードが弱すぎます（6文字以上にしてください）';
      case 'auth/invalid-email':
        return 'メールアドレスの形式が正しくありません';
      case 'auth/too-many-requests':
        return 'リクエストが多すぎます。しばらく待ってから再試行してください';
      case 'auth/network-request-failed':
        return 'ネットワークエラーが発生しました';
      case 'auth/popup-closed-by-user':
        return 'ログインがキャンセルされました';
      default:
        return '認証エラーが発生しました';
    }
  };

  /**
   * メールアドレスとパスワードでログイン
   * 
   * 初学者向けメモ：
   * - Firebase AuthのsignInWithEmailAndPasswordを使用
   * - エラー発生時は日本語メッセージを設定
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(getJapaneseErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * メールアドレスとパスワードでユーザー登録
   * 
   * 初学者向けメモ：
   * - Firebase AuthのcreateUserWithEmailAndPasswordを使用
   * - 登録と同時に自動ログインされる
   */
  const register = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(getJapaneseErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Googleアカウントでログイン
   * 
   * 初学者向けメモ：
   * - Firebase AuthのGoogle OAuthプロバイダーを使用
   * - ポップアップウィンドウでGoogleログイン画面を表示
   */
  const loginWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      // Googleアカウント選択を強制（毎回アカウント選択画面を表示）
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setError(getJapaneseErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * ログアウト
   * 
   * 初学者向けメモ：
   * - Firebase AuthのsignOutを使用
   * - ログアウト後は自動的にcurrentUserがnullになる
   */
  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error: any) {
      setError(getJapaneseErrorMessage(error.code));
      throw error;
    }
  };

  /**
   * パスワードリセットメール送信
   * 
   * 初学者向けメモ：
   * - Firebase AuthのsendPasswordResetEmailを使用
   * - 指定されたメールアドレスにリセット用リンクを送信
   */
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      setError(getJapaneseErrorMessage(error.code));
      throw error;
    }
  };

  /**
   * Firebase認証状態の監視
   * 
   * 初学者向けメモ：
   * - useEffectでコンポーネントマウント時に認証状態を監視開始
   * - onAuthStateChangedでFirebaseの認証状態変化を監視
   * - cleanupでリスナーを削除（メモリリーク防止）
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // クリーンアップ関数（コンポーネントアンマウント時にリスナー削除）
    return unsubscribe;
  }, []);

  /**
   * Context値を作成
   * 
   * 初学者向けメモ：
   * - 認証状態と認証機能をまとめてContextに提供
   * - 子コンポーネントでuseAuthフックを使用してアクセス可能
   */
  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 初学者向けメモ：AuthContextの使用例
 * 
 * 1. App.tsxでAuthProviderを設定
 * ```typescript
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router>
 *         <Routes>
 *           // ルート設定
 *         </Routes>
 *       </Router>
 *     </AuthProvider>
 *   );
 * }
 * ```
 * 
 * 2. コンポーネントで認証状態を使用
 * ```typescript
 * function SomeComponent() {
 *   const { currentUser, login, logout } = useAuth();
 *   
 *   if (currentUser) {
 *     return <div>ログイン中: {currentUser.email}</div>;
 *   }
 *   
 *   return <LoginForm onLogin={login} />;
 * }
 * ```
 * 
 * 3. エラーハンドリングの例
 * ```typescript
 * const handleLogin = async (email: string, password: string) => {
 *   try {
 *     await login(email, password);
 *     console.log('ログイン成功');
 *   } catch (error) {
 *     console.error('ログイン失敗:', error);
 *   }
 * };
 * ```
 */