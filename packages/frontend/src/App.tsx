/**
 * メインアプリケーションコンポーネント
 * 
 * 初学者向けメモ：
 * - React Router を使用したSPA（Single Page Application）
 * - ルーティング機能でページ遷移を管理
 * - 全体のアプリケーション構造を定義
 */

import { Router } from './ルーター';

/**
 * アプリケーションのメインコンポーネント
 * 
 * 初学者向けメモ：
 * - Routerコンポーネントでアプリケーション全体のルーティングを管理
 * - シンプルな構造でReact Routerに処理を委譲
 */
export function App() {
  return <Router />;
}