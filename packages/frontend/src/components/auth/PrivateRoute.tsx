/**
 * 認証が必要なルートを保護するコンポーネント
 * 
 * 初学者向けメモ：
 * - ログインしていないユーザーをリダイレクト
 * - ローディング中は適切な表示を行う
 * - 認証済みユーザーのみコンテンツを表示
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * PrivateRouteのプロパティ型
 */
interface PrivateRouteProps {
  children: ReactNode; // 保護対象のコンポーネント
  redirectTo?: string; // リダイレクト先のパス
  fallback?: ReactNode; // ローディング中に表示するコンポーネント
}

/**
 * 認証保護されたルートコンポーネント
 * 
 * 初学者向けメモ：
 * - 認証状態をチェックしてアクセス制御
 * - 未認証の場合はログインページにリダイレクト
 * - 元のページに戻れるようにリダイレクト後のパスを保存
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  redirectTo = '/login',
  fallback 
}) => {
  // 認証状態を取得
  const { currentUser, loading } = useAuth();
  
  // 現在のページ情報を取得（リダイレクト後に戻るため）
  const location = useLocation();

  /**
   * ローディング中の表示
   * 
   * 初学者向けメモ：
   * - Firebase Authの初期化中は loading が true になる
   * - この間にコンテンツを表示すると認証状態が不正確になる可能性
   */
  if (loading) {
    // カスタムのローディングコンポーネントがあれば使用
    if (fallback) {
      return <>{fallback}</>;
    }

    // デフォルトのローディング表示
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  /**
   * 認証状態のチェック
   * 
   * 初学者向けメモ：
   * - currentUser が null の場合は未認証
   * - Navigate コンポーネントでリダイレクト実行
   * - state に現在のパスを保存（ログイン後に元のページに戻るため）
   */
  if (!currentUser) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // 認証済みの場合はコンテンツを表示
  return <>{children}</>;
};

/**
 * より柔軟な認証チェック用のフック
 * 
 * 初学者向けメモ：
 * - コンポーネント内で認証状態を簡単にチェック
 * - useAuthのラッパーとして使用可能
 */
export const useRequireAuth = (): {
  currentUser: import('firebase/auth').User | null;
  loading: boolean;
  isAuthenticated: boolean;
} => {
  const { currentUser, loading } = useAuth();
  
  return {
    currentUser,
    loading,
    isAuthenticated: !loading && !!currentUser,
  };
};

/**
 * 認証が必要な操作をチェックするヘルパー関数
 * 
 * 初学者向けメモ：
 * - API呼び出し前の認証チェックに使用
 * - ユーザーフレンドリーなエラーメッセージを表示
 */
export const checkAuthBeforeAction = (
  currentUser: import('firebase/auth').User | null,
  actionName: string = '操作'
): boolean => {
  if (!currentUser) {
    alert(`${actionName}を行うにはログインが必要です`);
    return false;
  }
  return true;
};

/**
 * 管理者権限チェック用のPrivateRoute（将来の拡張用）
 * 
 * 初学者向けメモ：
 * - 現在は未実装だが、将来的に管理者機能を追加する際に使用
 * - Firebase AuthのカスタムクレームやFirestoreでの権限管理が必要
 */
interface AdminRouteProps extends PrivateRouteProps {
  requiredRole?: string;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // 認証チェック
  if (loading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // TODO: 管理者権限のチェック
  // 現在は全ての認証済みユーザーを許可
  // 将来的にFirebase AuthのカスタムクレームやFirestoreでの権限管理を実装
  
  return <>{children}</>;
};

// 初学者向けメモ：PrivateRouteの使用例については別途ドキュメントを参照してください