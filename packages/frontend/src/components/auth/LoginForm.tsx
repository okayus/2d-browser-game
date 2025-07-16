/**
 * ログインフォームコンポーネント
 * 
 * 初学者向けメモ：
 * - メールアドレス・パスワードログイン
 * - Googleアカウントログイン
 * - フォームバリデーション機能
 * - エラー表示機能
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ログインフォームのプロパティ型
 */
interface LoginFormProps {
  onSuccess?: () => void; // ログイン成功時のコールバック
  showRegisterLink?: boolean; // 新規登録リンクを表示するか
}

/**
 * ログインフォームコンポーネント
 * 
 * 初学者向けメモ：
 * - 入力値の状態管理にuseStateを使用
 * - AuthContextから認証機能を取得
 * - エラーハンドリングを実装
 */
export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  showRegisterLink = true 
}) => {
  // ログイン認証機能を取得
  const { login, loginWithGoogle, error, loading, clearError } = useAuth();

  // フォーム入力値の状態管理
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // バリデーションエラーの状態管理
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  /**
   * メールアドレスのバリデーション
   * 
   * 初学者向けメモ：
   * - 正規表現でメールアドレス形式をチェック
   * - 空文字チェックも実装
   */
  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return 'メールアドレスを入力してください';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'メールアドレスの形式が正しくありません';
    }
    return '';
  };

  /**
   * パスワードのバリデーション
   * 
   * 初学者向けメモ：
   * - 最小文字数をチェック
   * - Firebaseの要求に合わせて6文字以上
   */
  const validatePassword = (password: string): string => {
    if (!password.trim()) {
      return 'パスワードを入力してください';
    }
    if (password.length < 6) {
      return 'パスワードは6文字以上で入力してください';
    }
    return '';
  };

  /**
   * メールアドレス・パスワードでのログイン処理
   * 
   * 初学者向けメモ：
   * - バリデーションを先に実行
   * - 認証エラーはAuthContextで処理される
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // エラーメッセージをクリア
    clearError();
    setEmailError('');
    setPasswordError('');

    // バリデーション実行
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    if (emailValidationError) {
      setEmailError(emailValidationError);
    }
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
    }

    // バリデーションエラーがある場合は処理を中断
    if (emailValidationError || passwordValidationError) {
      return;
    }

    try {
      await login(email, password);
      console.log('ログイン成功');
      
      // ログイン成功時のコールバックを実行
      onSuccess?.();
    } catch (error) {
      console.error('ログイン失敗:', error);
      // エラーはAuthContextで管理されているため、ここでは何もしない
    }
  };

  /**
   * Googleアカウントでのログイン処理
   * 
   * 初学者向けメモ：
   * - OAuth認証のため特別なバリデーションは不要
   * - ポップアップがブロックされる可能性があることをユーザーに伝える
   */
  const handleGoogleLogin = async () => {
    clearError();
    
    try {
      await loginWithGoogle();
      console.log('Googleログイン成功');
      
      // ログイン成功時のコールバックを実行
      onSuccess?.();
    } catch (error) {
      console.error('Googleログイン失敗:', error);
      // エラーはAuthContextで管理されているため、ここでは何もしない
    }
  };

  /**
   * 入力値変更時のハンドラー
   * 
   * 初学者向けメモ：
   * - 入力時にエラーメッセージをクリア
   * - リアルタイムなバリデーション体験を提供
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // 入力中はエラーメッセージをクリア
    if (emailError) {
      setEmailError('');
    }
    clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // 入力中はエラーメッセージをクリア
    if (passwordError) {
      setPasswordError('');
    }
    clearError();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        ログイン
      </h2>

      {/* Firebase認証エラー表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* メールアドレス・パスワードログインフォーム */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        {/* メールアドレス入力 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              emailError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="example@email.com"
            disabled={loading}
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          )}
        </div>

        {/* パスワード入力 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="パスワードを入力"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              disabled={loading}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {passwordError && (
            <p className="mt-1 text-sm text-red-600">{passwordError}</p>
          )}
        </div>

        {/* ログインボタン */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      {/* 区切り線 */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-sm text-gray-500">または</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Googleログインボタン */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? 'ログイン中...' : 'Googleでログイン'}
      </button>

      {/* 新規登録リンク */}
      {showRegisterLink && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は{' '}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              新規登録
            </a>
          </p>
        </div>
      )}

      {/* パスワードリセットリンク */}
      <div className="mt-4 text-center">
        <a
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          パスワードを忘れた方はこちら
        </a>
      </div>

      {/* 開発環境用テストユーザーログイン */}
      {!import.meta.env.PROD && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2 text-center">開発環境用テスト機能</p>
          <button
            onClick={async () => {
              clearError();
              setEmail('test@example.com');
              setPassword('testpass123');
              try {
                await login('test@example.com', 'testpass123');
                onSuccess?.();
              } catch (error) {
                console.error('テストユーザーログインエラー:', error);
              }
            }}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            テストユーザーでログイン
          </button>
          <p className="text-xs text-gray-400 mt-1 text-center">
            test@example.com / testpass123
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * 初学者向けメモ：LoginFormコンポーネントの使用例
 * 
 * 1. 基本的な使用方法
 * ```typescript
 * function LoginPage() {
 *   return (
 *     <div className="min-h-screen flex items-center justify-center bg-gray-50">
 *       <LoginForm />
 *     </div>
 *   );
 * }
 * ```
 * 
 * 2. ログイン成功時の処理を追加
 * ```typescript
 * function LoginPage() {
 *   const navigate = useNavigate();
 *   
 *   const handleLoginSuccess = () => {
 *     navigate('/dashboard');
 *   };
 *   
 *   return (
 *     <LoginForm onSuccess={handleLoginSuccess} />
 *   );
 * }
 * ```
 * 
 * 3. モーダル内での使用
 * ```typescript
 * function LoginModal({ isOpen, onClose }) {
 *   return (
 *     <Modal isOpen={isOpen} onClose={onClose}>
 *       <LoginForm 
 *         onSuccess={onClose} 
 *         showRegisterLink={false}
 *       />
 *     </Modal>
 *   );
 * }
 * ```
 */