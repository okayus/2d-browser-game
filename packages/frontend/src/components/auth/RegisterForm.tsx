/**
 * 新規登録フォームコンポーネント
 * 
 * 初学者向けメモ：
 * - メールアドレス・パスワードでの新規登録
 * - Googleアカウントでの登録
 * - パスワード確認機能
 * - 入力値のバリデーション
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * 新規登録フォームのプロパティ型
 */
interface RegisterFormProps {
  onSuccess?: () => void; // 登録成功時のコールバック
  showLoginLink?: boolean; // ログインリンクを表示するか
}

/**
 * 新規登録フォームコンポーネント
 * 
 * 初学者向けメモ：
 * - パスワード確認入力を含む
 * - 強力なバリデーション機能
 * - AuthContextから認証機能を取得
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSuccess, 
  showLoginLink = true 
}) => {
  // 認証機能を取得
  const { register, loginWithGoogle, error, loading, clearError } = useAuth();

  // フォーム入力値の状態管理
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // バリデーションエラーの状態管理
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');

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
   * - 最小文字数（6文字以上）をチェック
   * - 文字種類の組み合わせチェック（英数字）
   * - より強力なパスワードを推奨
   */
  const validatePassword = (password: string): string => {
    if (!password.trim()) {
      return 'パスワードを入力してください';
    }
    if (password.length < 6) {
      return 'パスワードは6文字以上で入力してください';
    }
    if (password.length < 8) {
      return 'セキュリティのため8文字以上のパスワードを推奨します';
    }
    
    // 英字と数字の組み合わせを推奨
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
      return '英字と数字を組み合わせたパスワードを推奨します';
    }
    
    return '';
  };

  /**
   * パスワード確認のバリデーション
   * 
   * 初学者向けメモ：
   * - 元のパスワードと一致するかチェック
   * - ユーザーの入力ミスを防ぐ
   */
  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (!confirmPassword.trim()) {
      return 'パスワード確認を入力してください';
    }
    if (password !== confirmPassword) {
      return 'パスワードが一致しません';
    }
    return '';
  };

  /**
   * メールアドレス・パスワードでの新規登録処理
   * 
   * 初学者向けメモ：
   * - 全ての入力値をバリデーション
   * - Firebaseにユーザーを作成
   * - 登録成功後は自動的にログイン状態になる
   */
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // エラーメッセージをクリア
    clearError();
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // バリデーション実行
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);
    const confirmPasswordValidationError = validateConfirmPassword(password, confirmPassword);

    if (emailValidationError) {
      setEmailError(emailValidationError);
    }
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
    }
    if (confirmPasswordValidationError) {
      setConfirmPasswordError(confirmPasswordValidationError);
    }

    // バリデーションエラーがある場合は処理を中断
    if (emailValidationError || passwordValidationError || confirmPasswordValidationError) {
      return;
    }

    try {
      await register(email, password);
      console.log('新規登録成功');
      
      // 登録成功時のコールバックを実行
      onSuccess?.();
    } catch (error) {
      console.error('新規登録失敗:', error);
      // エラーはAuthContextで管理されているため、ここでは何もしない
    }
  };

  /**
   * Googleアカウントでの新規登録処理
   * 
   * 初学者向けメモ：
   * - OAuth認証のため特別なバリデーションは不要
   * - 既存のGoogleアカウントがある場合は自動ログイン
   */
  const handleGoogleRegister = async () => {
    clearError();
    
    try {
      await loginWithGoogle();
      console.log('Google新規登録成功');
      
      // 登録成功時のコールバックを実行
      onSuccess?.();
    } catch (error) {
      console.error('Google新規登録失敗:', error);
      // エラーはAuthContextで管理されているため、ここでは何もしない
    }
  };

  /**
   * 入力値変更時のハンドラー
   * 
   * 初学者向けメモ：
   * - 入力時にエラーメッセージをクリア
   * - リアルタイムなユーザー体験を提供
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
    clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) {
      setPasswordError('');
    }
    // パスワードが変更された場合、確認パスワードのエラーもクリア
    if (confirmPasswordError && confirmPassword) {
      setConfirmPasswordError('');
    }
    clearError();
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
    clearError();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        新規登録
      </h2>

      {/* Firebase認証エラー表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* メールアドレス・パスワード新規登録フォーム */}
      <form onSubmit={handleEmailRegister} className="space-y-4">
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
              placeholder="8文字以上のパスワード"
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
          {/* パスワード強度のヒント */}
          <p className="mt-1 text-xs text-gray-500">
            8文字以上で英数字を組み合わせることを推奨します
          </p>
        </div>

        {/* パスワード確認入力 */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード確認
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                confirmPasswordError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="パスワードを再入力"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              disabled={loading}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {confirmPasswordError && (
            <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
          )}
        </div>

        {/* 新規登録ボタン */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '登録中...' : '新規登録'}
        </button>
      </form>

      {/* 区切り線 */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-sm text-gray-500">または</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Googleアカウント新規登録ボタン */}
      <button
        onClick={handleGoogleRegister}
        disabled={loading}
        className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? '登録中...' : 'Googleで新規登録'}
      </button>

      {/* ログインリンク */}
      {showLoginLink && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            既にアカウントをお持ちの方は{' '}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              ログイン
            </a>
          </p>
        </div>
      )}

      {/* 利用規約・プライバシーポリシー */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          登録することで、
          <a href="/terms" className="text-blue-600 hover:text-blue-500">
            利用規約
          </a>
          と
          <a href="/privacy" className="text-blue-600 hover:text-blue-500">
            プライバシーポリシー
          </a>
          に同意したものとみなします
        </p>
      </div>
    </div>
  );
};

/**
 * 初学者向けメモ：RegisterFormコンポーネントの使用例
 * 
 * 1. 基本的な使用方法
 * ```typescript
 * function RegisterPage() {
 *   return (
 *     <div className="min-h-screen flex items-center justify-center bg-gray-50">
 *       <RegisterForm />
 *     </div>
 *   );
 * }
 * ```
 * 
 * 2. 登録成功時の処理を追加
 * ```typescript
 * function RegisterPage() {
 *   const navigate = useNavigate();
 *   
 *   const handleRegisterSuccess = () => {
 *     navigate('/welcome');
 *   };
 *   
 *   return (
 *     <RegisterForm onSuccess={handleRegisterSuccess} />
 *   );
 * }
 * ```
 * 
 * 3. モーダル内での使用
 * ```typescript
 * function RegisterModal({ isOpen, onClose }) {
 *   return (
 *     <Modal isOpen={isOpen} onClose={onClose}>
 *       <RegisterForm 
 *         onSuccess={onClose} 
 *         showLoginLink={false}
 *       />
 *     </Modal>
 *   );
 * }
 * ```
 */