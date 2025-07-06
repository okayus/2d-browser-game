/**
 * ホームページ
 * 
 * 初学者向けメモ：
 * - アプリケーションのメインページ
 * - プレイヤー作成やモンスター管理へのナビゲーション
 * - ゲームの概要説明
 */

import { Link } from 'react-router-dom';
import { Plus, Users, Gamepad2, ArrowRight } from 'lucide-react';

/**
 * ホームページコンポーネント
 * 
 * 初学者向けメモ：
 * - ウェルカムメッセージとゲームの説明
 * - 主要な機能へのクイックアクセス
 * - 視覚的に魅力的なレイアウト
 */
export function ホーム() {
  return (
    <div className=\"space-y-8\">
      {/* ヒーローセクション */}
      <div className=\"text-center space-y-4\">
        <h1 className=\"text-4xl font-bold text-gray-900\">
          モンスター収集ゲームへようこそ！
        </h1>
        <p className=\"text-xl text-gray-600 max-w-2xl mx-auto\">
          プログラミング学習用のゲームプロジェクトです。
          TypeScript、React、Hono、Cloudflareを使用して開発されています。
        </p>
      </div>

      {/* アクションカード */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
        {/* プレイヤー作成カード */}
        <div className=\"bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow\">
          <div className=\"flex items-center space-x-3 mb-4\">
            <div className=\"bg-blue-100 p-3 rounded-full\">
              <Plus className=\"h-6 w-6 text-blue-600\" />
            </div>
            <h3 className=\"text-lg font-semibold text-gray-900\">
              新しいプレイヤー
            </h3>
          </div>
          <p className=\"text-gray-600 mb-4\">
            ゲームを始めるために、新しいプレイヤーアカウントを作成します。
          </p>
          <Link
            to=\"/players/new\"
            className=\"inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors\"
          >
            <span>プレイヤー作成</span>
            <ArrowRight className=\"h-4 w-4\" />
          </Link>
        </div>

        {/* プレイヤー管理カード */}
        <div className=\"bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow\">
          <div className=\"flex items-center space-x-3 mb-4\">
            <div className=\"bg-green-100 p-3 rounded-full\">
              <Users className=\"h-6 w-6 text-green-600\" />
            </div>
            <h3 className=\"text-lg font-semibold text-gray-900\">
              プレイヤー管理
            </h3>
          </div>
          <p className=\"text-gray-600 mb-4\">
            既存のプレイヤーアカウントを確認・管理します。
          </p>
          <Link
            to=\"/players\"
            className=\"inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors\"
          >
            <span>プレイヤー一覧</span>
            <ArrowRight className=\"h-4 w-4\" />
          </Link>
        </div>

        {/* モンスター管理カード */}
        <div className=\"bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow\">
          <div className=\"flex items-center space-x-3 mb-4\">
            <div className=\"bg-purple-100 p-3 rounded-full\">
              <Gamepad2 className=\"h-6 w-6 text-purple-600\" />
            </div>
            <h3 className=\"text-lg font-semibold text-gray-900\">
              モンスター管理
            </h3>
          </div>
          <p className=\"text-gray-600 mb-4\">
            捕獲したモンスターの一覧を確認・管理します。
          </p>
          <Link
            to=\"/monsters\"
            className=\"inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors\"
          >
            <span>モンスター一覧</span>
            <ArrowRight className=\"h-4 w-4\" />
          </Link>
        </div>
      </div>

      {/* ゲーム機能の説明 */}
      <div className=\"bg-white rounded-lg shadow-md p-6\">
        <h2 className=\"text-2xl font-bold text-gray-900 mb-4\">
          現在利用可能な機能
        </h2>
        <div className=\"space-y-4\">
          <div className=\"flex items-start space-x-3\">
            <div className=\"bg-blue-100 p-2 rounded-full mt-1\">
              <Plus className=\"h-4 w-4 text-blue-600\" />
            </div>
            <div>
              <h3 className=\"font-semibold text-gray-900\">プレイヤー作成 (Create)</h3>
              <p className=\"text-gray-600\">
                新しいプレイヤーアカウントを作成できます。
              </p>
            </div>
          </div>
          <div className=\"flex items-start space-x-3\">
            <div className=\"bg-green-100 p-2 rounded-full mt-1\">
              <Users className=\"h-4 w-4 text-green-600\" />
            </div>
            <div>
              <h3 className=\"font-semibold text-gray-900\">プレイヤー確認 (Read)</h3>
              <p className=\"text-gray-600\">
                作成したプレイヤーの情報を確認できます。
              </p>
            </div>
          </div>
          <div className=\"flex items-start space-x-3\">
            <div className=\"bg-purple-100 p-2 rounded-full mt-1\">
              <Gamepad2 className=\"h-4 w-4 text-purple-600\" />
            </div>
            <div>
              <h3 className=\"font-semibold text-gray-900\">モンスター管理 (CRUD)</h3>
              <p className=\"text-gray-600\">
                今後の開発で、モンスターの捕獲・管理・育成機能を追加予定です。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 学習ポイント */}
      <div className=\"bg-gray-100 rounded-lg p-6\">
        <h2 className=\"text-2xl font-bold text-gray-900 mb-4\">
          学習ポイント
        </h2>
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
          <div>
            <h3 className=\"font-semibold text-gray-900 mb-2\">フロントエンド</h3>
            <ul className=\"text-gray-600 space-y-1\">
              <li>• React + TypeScript</li>
              <li>• React Router (SPA)</li>
              <li>• Tailwind CSS</li>
              <li>• 型安全なAPI通信</li>
            </ul>
          </div>
          <div>
            <h3 className=\"font-semibold text-gray-900 mb-2\">バックエンド</h3>
            <ul className=\"text-gray-600 space-y-1\">
              <li>• Hono (Web Framework)</li>
              <li>• Cloudflare Workers</li>
              <li>• D1 Database (SQLite)</li>
              <li>• Drizzle ORM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 初学者向けメモ：ホームページの構成
 * 
 * 1. ヒーローセクション
 *    - 大きなタイトルと説明
 *    - ユーザーの注意を引く
 * 
 * 2. アクションカード
 *    - 主要な機能へのクイックアクセス
 *    - 視覚的に分かりやすいアイコン
 *    - ホバー効果で相互作用を示す
 * 
 * 3. 機能説明
 *    - 現在利用可能な機能の一覧
 *    - 各機能の説明
 * 
 * 4. 学習ポイント
 *    - 使用している技術の紹介
 *    - 学習者のモチベーション向上
 * 
 * 5. デザインパターン
 *    - カードレイアウト
 *    - グリッドシステム
 *    - 一貫性のあるスタイリング
 */