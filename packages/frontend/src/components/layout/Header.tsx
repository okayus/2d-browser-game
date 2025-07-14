/**
 * ヘッダーコンポーネント
 * 
 * 初学者向けメモ：
 * - グローバルナビゲーション
 * - ユーザー情報表示
 * - ログアウト機能
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ヘッダーのメインコンポーネント
 * 
 * 初学者向けメモ：
 * - 認証状態に応じたナビゲーション表示
 * - レスポンシブデザイン対応
 * - アクティブリンクのハイライト
 */
export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    try {
      await logout();
      // ログアウト後はホーム画面へ
      navigate('/');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  /**
   * メニューの開閉トグル
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * 現在のパスがアクティブかチェック
   */
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // 認証関連のページではヘッダーを表示しない
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <header className="bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・ブランド */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-3 text-white hover:text-blue-300 transition-colors"
            >
              <span className="text-2xl">🎮</span>
              <span className="font-bold text-lg">モンスター収集ゲーム</span>
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            {currentUser ? (
              <>
                {/* 認証済みユーザー向けリンク */}
                <Link
                  to="/map"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/map')
                      ? 'text-blue-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  マップ
                </Link>
                <Link
                  to="/monsters"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/monsters')
                      ? 'text-blue-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  モンスター
                </Link>
                
                {/* ユーザー情報 */}
                <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-700">
                  <span className="text-sm text-gray-300">
                    {currentUser.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 未認証ユーザー向けリンク */}
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  新規登録
                </Link>
              </>
            )}
          </nav>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <nav className="space-y-2">
              {currentUser ? (
                <>
                  <Link
                    to="/map"
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/map')
                        ? 'text-blue-400 bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    マップ
                  </Link>
                  <Link
                    to="/monsters"
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/monsters')
                        ? 'text-blue-400 bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    モンスター
                  </Link>
                  
                  <div className="pt-2 mt-2 border-t border-gray-700">
                    <div className="px-3 py-2 text-sm text-gray-400">
                      {currentUser.email}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-md transition-colors"
                    >
                      ログアウト
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    新規登録
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * 初学者向けメモ：Headerコンポーネントの設計
 * 
 * 1. 条件付きレンダリング
 *    - 認証ページでは非表示
 *    - 認証状態に応じたメニュー切り替え
 * 
 * 2. レスポンシブデザイン
 *    - デスクトップ：横並びメニュー
 *    - モバイル：ハンバーガーメニュー
 * 
 * 3. アクセシビリティ
 *    - キーボードナビゲーション対応
 *    - フォーカスリングの表示
 *    - 適切なaria属性（必要に応じて追加）
 * 
 * 4. パフォーマンス
 *    - 不要なre-renderを避ける
 *    - メニュー状態の効率的な管理
 */