/**
 * React Router設定
 * 
 * 初学者向けメモ：
 * - React Routerを使用してSPA（Single Page Application）のルーティングを設定
 * - 各ページコンポーネントを対応するパスにマッピング
 * - エラーハンドリングとローディング状態の管理も含む
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { レイアウト } from './components/レイアウト';
import { ホーム } from './pages/ホーム';
import { プレイヤー作成 } from './pages/プレイヤー作成';
import { プレイヤー詳細 } from './pages/プレイヤー詳細';
import { モンスター一覧 } from './pages/モンスター一覧';
import { エラーページ } from './pages/エラーページ';
import { NotFound } from './pages/NotFound';

/**
 * ルーター設定
 * 
 * 初学者向けメモ：
 * - createBrowserRouterを使用してルートを定義
 * - 各ルートにはパス、コンポーネント、エラーハンドリングを設定
 * - ネストしたルートでレイアウトを共有
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <レイアウト />,
    errorElement: <エラーページ />,
    children: [
      {
        index: true,
        element: <ホーム />,
      },
      {
        path: 'players',
        children: [
          {
            path: 'new',
            element: <プレイヤー作成 />,
          },
          {
            path: ':id',
            element: <プレイヤー詳細 />,
          },
        ],
      },
      {
        path: 'monsters',
        element: <モンスター一覧 />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

/**
 * ルーターコンポーネント
 * 
 * 初学者向けメモ：
 * - RouterProviderを使用してアプリケーション全体にルーティング機能を提供
 * - このコンポーネントをApp.tsxで使用
 */
export function Router() {
  return <RouterProvider router={router} />;
}

/**
 * 初学者向けメモ：React Routerのルート構造
 * 
 * /                     - ホームページ
 * /players/new          - プレイヤー作成ページ
 * /players/:id          - プレイヤー詳細ページ（:idは動的パラメータ）
 * /monsters             - モンスター一覧ページ
 * /*                    - 404ページ（存在しないパスの場合）
 * 
 * レイアウトの共有：
 * - 全てのページで共通のレイアウト（ヘッダー、フッター等）を使用
 * - childrenプロパティを使用してページ固有のコンテンツを表示
 * 
 * エラーハンドリング：
 * - errorElementを使用してエラー発生時のコンポーネントを指定
 * - 各ページでエラーが発生した場合、エラーページが表示される
 */