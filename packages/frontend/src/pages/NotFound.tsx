/**
 * 404 Not Foundページ
 * 
 * 初学者向けメモ：
 * - 存在しないページにアクセスした時に表示
 * - ユーザーを適切なページに誘導
 * - 分かりやすく親しみやすいデザイン
 */

import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * NotFoundページコンポーネント
 * 
 * 初学者向けメモ：
 * - 404エラーページの専用コンポーネント
 * - ユーザーが迷子にならないようナビゲーションを提供
 * - ゲームらしい親しみやすいデザイン
 */
export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 404イラストレーション */}
          <div className="text-center mb-8">
            <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>

          {/* メッセージ */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              ページが見つかりません
            </h1>
            
            <p className="text-gray-600">
              お探しのページは存在しないか、
              <br />
              移動された可能性があります。
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                🎮 モンスターも迷子になってしまったようです！
                <br />
                一緒にホームに帰りましょう。
              </p>
            </div>
          </div>

          {/* ナビゲーションボタン */}
          <div className="mt-8 space-y-3">
            {/* ホームに戻る */}
            <Link
              to="/"
              className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>ホームに戻る</span>
            </Link>

            {/* 戻る */}
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>前のページに戻る</span>
            </button>
          </div>

          {/* 主要ページへのクイックリンク */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              よく使われるページ
            </h3>
            <div className="space-y-2">
              <Link
                to="/players/new"
                className="block text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                • 新しいプレイヤーを作成
              </Link>
              <Link
                to="/players"
                className="block text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                • プレイヤー一覧
              </Link>
              <Link
                to="/monsters"
                className="block text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                • モンスター一覧
              </Link>
            </div>
          </div>

          {/* ヘルプ情報 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              URLを直接入力した場合は、スペルをご確認ください。
              <br />
              問題が継続する場合は開発者にお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 初学者向けメモ：404ページの設計ポイント
 * 
 * 1. ユーザーフレンドリーなメッセージ
 *    - 親しみやすいトーン
 *    - ゲームのテーマに合わせた表現
 *    - 責任をユーザーに転嫁しない
 * 
 * 2. 明確なナビゲーション
 *    - ホームページへの誘導
 *    - 前のページに戻る機能
 *    - 主要ページへのクイックリンク
 * 
 * 3. 視覚的なデザイン
 *    - 大きな404表示
 *    - アニメーション効果
 *    - 一貫性のあるスタイリング
 * 
 * 4. 検索機能（今後追加可能）
 *    - サイト内検索
 *    - 関連ページの提案
 *    - 人気ページの表示
 * 
 * 5. ユーザビリティ
 *    - 複数の選択肢を提供
 *    - アクセシビリティ配慮
 *    - モバイル対応
 */