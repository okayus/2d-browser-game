/**
 * メインアプリケーションコンポーネント
 * 初学者向け: Reactの基本的なコンポーネント構造
 */

import React from 'react';

/**
 * アプリケーションのメインコンポーネント
 * 全体のレイアウトとルーティングを管理
 */
export function App(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">
          🎮 モンスター収集ゲーム
        </h1>
        <p className="mt-1 text-blue-100">
          プログラミング学習用プロジェクト
        </p>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            開発中...
          </h2>
          <p className="text-gray-600">
            MVP実装: モンスターCRUD機能
          </p>
        </div>
      </main>
    </div>
  );
}