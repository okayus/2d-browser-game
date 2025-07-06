/**
 * アプリケーション共通レイアウト
 * 
 * 初学者向けメモ：
 * - 全ページで共通のレイアウト（ヘッダー、ナビゲーション、フッター）を定義
 * - Outlet を使用して各ページのコンテンツを表示
 * - レスポンシブデザインに対応
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Gamepad2 } from 'lucide-react';

/**
 * レイアウトコンポーネント
 * 
 * 初学者向けメモ：
 * - Outlet: 子ルートのコンポーネントが表示される場所
 * - useLocation: 現在のページのパス情報を取得
 * - 条件付きスタイリングでアクティブなナビゲーション項目を強調
 */
export function レイアウト() {
  const location = useLocation();

  /**
   * ナビゲーションアイテムの設定
   * 
   * 初学者向けメモ：
   * - 各ページへのリンクとアイコンを定義
   * - pathプロパティを使用してアクティブ状態を判定
   */
  const ナビゲーションアイテム = [
    {
      name: 'ホーム',
      path: '/',
      icon: Home,
    },
    {
      name: 'プレイヤー',
      path: '/players',
      icon: Users,
    },
    {
      name: 'モンスター',
      path: '/monsters',
      icon: Gamepad2,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ・タイトル */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Gamepad2 className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  モンスター収集ゲーム
                </span>
              </Link>
            </div>

            {/* ナビゲーション */}
            <nav className="hidden md:flex space-x-8">
              {ナビゲーションアイテム.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 モンスター収集ゲーム - プログラミング学習用プロジェクト</p>
          </div>
        </div>
      </footer>

      {/* モバイル用ナビゲーション */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          {ナビゲーションアイテム.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs font-medium transition-colors
                  ${isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-600'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * 初学者向けメモ：レイアウトコンポーネントの構造
 * 
 * 1. ヘッダー
 *    - ロゴ/タイトル
 *    - ナビゲーションメニュー
 *    - レスポンシブ対応（モバイルでは非表示）
 * 
 * 2. メインコンテンツ
 *    - Outletで各ページのコンテンツを表示
 *    - 最大幅とパディングを設定
 * 
 * 3. フッター
 *    - 著作権表示
 *    - 追加情報（必要に応じて）
 * 
 * 4. モバイルナビゲーション
 *    - 画面下部に固定
 *    - タブレット以上のサイズでは非表示
 * 
 * 5. スタイリング
 *    - Tailwind CSSを使用
 *    - アクティブ状態の表示
 *    - ホバー効果
 */