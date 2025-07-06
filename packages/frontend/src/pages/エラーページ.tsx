/**
 * エラーページ
 * 
 * 初学者向けメモ：
 * - React Routerのエラーバウンダリー用ページ
 * - アプリケーションで予期しないエラーが発生した時に表示
 * - ユーザーにとって分かりやすいエラー表示
 */

import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

/**
 * エラーページコンポーネント
 * 
 * 初学者向けメモ：
 * - useRouteError でエラー情報を取得
 * - エラーの種類に応じて適切なメッセージを表示
 * - リカバリーアクションを提供
 */
export function エラーページ() {
  const error = useRouteError();

  /**
   * エラー情報を適切な形式で取得
   * 
   * 初学者向けメモ：
   * - React Routerのエラーオブジェクトは複数の形式がある
   * - isRouteErrorResponse でタイプガードを実装
   */
  let エラーメッセージ = '予期しないエラーが発生しました';
  let エラー詳細 = '';
  let ステータスコード = 500;

  if (isRouteErrorResponse(error)) {
    ステータスコード = error.status;
    エラーメッセージ = error.statusText;
    エラー詳細 = error.data?.message || '';
  } else if (error instanceof Error) {
    エラーメッセージ = error.message;
    エラー詳細 = error.stack || '';
  }

  /**
   * ページをリロードする関数
   */
  const ページリロード = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* エラーアイコン */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          {/* エラー情報 */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {ステータスコード === 404 ? 'ページが見つかりません' : 'エラーが発生しました'}
            </h1>
            
            <p className="text-gray-600">
              {ステータスコード === 404 
                ? 'お探しのページは存在しないか、移動された可能性があります。'
                : 'アプリケーションで問題が発生しました。'
              }
            </p>

            {エラーメッセージ && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">エラー詳細:</h3>
                <p className="text-sm text-red-700">{エラーメッセージ}</p>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="mt-8 space-y-3">
            {/* ホームに戻る */}
            <Link
              to="/"
              className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>ホームに戻る</span>
            </Link>

            {/* ページをリロード */}
            <button
              onClick={ページリロード}
              className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>ページを再読み込み</span>
            </button>
          </div>

          {/* 開発環境での詳細情報 */}
          {process.env.NODE_ENV === 'development' && エラー詳細 && (
            <details className="mt-6">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                開発者向け詳細情報（本番環境では非表示）
              </summary>
              <div className="mt-2 bg-gray-100 rounded-md p-3">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-40">
                  {エラー詳細}
                </pre>
              </div>
            </details>
          )}

          {/* サポート情報 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              問題が継続する場合は、ブラウザのキャッシュをクリアするか、
              <br />
              開発者にお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 初学者向けメモ：エラーページの実装ポイント
 * 
 * 1. エラータイプの判定
 *    - React Routerのエラーレスポンス
 *    - JavaScript のError オブジェクト
 *    - 不明なエラー
 * 
 * 2. ユーザーフレンドリーな表示
 *    - 分かりやすいメッセージ
 *    - 視覚的なアイコン
 *    - 次のアクションを明確に示す
 * 
 * 3. リカバリーアクション
 *    - ホームページへの誘導
 *    - ページのリロード
 *    - 戻るボタン（必要に応じて）
 * 
 * 4. 開発者向け情報
 *    - 開発環境でのみ詳細表示
 *    - 本番環境では非表示
 *    - デバッグに役立つ情報
 * 
 * 5. アクセシビリティ
 *    - 適切な見出し構造
 *    - フォーカス管理
 *    - スクリーンリーダー対応
 */