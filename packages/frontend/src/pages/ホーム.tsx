/**
 * ホームページ
 * 
 * 初学者向けメモ：
 * - アプリケーションのメインページ
 * - プレイヤー作成やモンスター管理へのナビゲーション
 * - ゲームの概要説明
 */

import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Gamepad2, ArrowRight } from 'lucide-react';
import { ゲームボタン } from '../components/ゲームボタン';
import { ゲームカード } from '../components/ゲームカード';
import { プレイヤー名入力 } from '../components/プレイヤー名入力';

/**
 * ホームページコンポーネント
 * 
 * 初学者向けメモ：
 * - ウェルカムメッセージとゲームの説明
 * - 主要な機能へのクイックアクセス
 * - 視覚的に魅力的なレイアウト
 */
export function ホーム() {
  const navigate = useNavigate();

  // ゲーム開始処理
  const handleゲーム開始 = (プレイヤー名: string) => {
    // プレイヤー名をローカルストレージに保存（既にhookで保存済み）
    console.log(`ゲーム開始: プレイヤー名 = ${プレイヤー名}`);
    
    // プレイヤー作成画面に遷移
    navigate('/players/new', { 
      state: { プレイヤー名 } 
    });
  };

  return (
    <div className="space-y-8">
      {/* ヒーローセクション */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          モンスター収集ゲームへようこそ！
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          プログラミング学習用のゲームプロジェクトです。
          TypeScript、React、Hono、Cloudflareを使用して開発されています。
        </p>
      </div>

      {/* プレイヤー名入力セクション */}
      <div className="max-w-md mx-auto">
        <プレイヤー名入力 onゲーム開始={handleゲーム開始} />
      </div>

      {/* アクションカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* プレイヤー作成カード */}
        <ゲームカード variant="interactive" padding="lg">
          <ゲームカード.Header>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                新しいプレイヤー
              </h3>
            </div>
          </ゲームカード.Header>
          <ゲームカード.Content>
            <p className="text-gray-600 mb-4">
              ゲームを始めるために、新しいプレイヤーアカウントを作成します。
            </p>
          </ゲームカード.Content>
          <ゲームカード.Actions>
            <Link to="/players/new">
              <ゲームボタン variant="primary" className="w-full">
                <span>プレイヤー作成</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </ゲームボタン>
            </Link>
          </ゲームカード.Actions>
        </ゲームカード>

        {/* プレイヤー管理カード */}
        <ゲームカード variant="interactive" padding="lg">
          <ゲームカード.Header>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                プレイヤー管理
              </h3>
            </div>
          </ゲームカード.Header>
          <ゲームカード.Content>
            <p className="text-gray-600 mb-4">
              既存のプレイヤーアカウントを確認・管理します。
            </p>
          </ゲームカード.Content>
          <ゲームカード.Actions>
            <Link to="/players">
              <ゲームボタン variant="success" className="w-full">
                <span>プレイヤー一覧</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </ゲームボタン>
            </Link>
          </ゲームカード.Actions>
        </ゲームカード>

        {/* モンスター管理カード */}
        <ゲームカード variant="interactive" padding="lg">
          <ゲームカード.Header>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Gamepad2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                モンスター管理
              </h3>
            </div>
          </ゲームカード.Header>
          <ゲームカード.Content>
            <p className="text-gray-600 mb-4">
              捕獲したモンスターの一覧を確認・管理します。
            </p>
          </ゲームカード.Content>
          <ゲームカード.Actions>
            <Link to="/monsters">
              <ゲームボタン variant="warning" className="w-full">
                <span>モンスター一覧</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </ゲームボタン>
            </Link>
          </ゲームカード.Actions>
        </ゲームカード>
      </div>

      {/* ゲーム機能の説明 */}
      <ゲームカード variant="elevated" padding="lg">
        <ゲームカード.Header>
          <h2 className="text-2xl font-bold text-gray-900">
            現在利用可能な機能
          </h2>
        </ゲームカード.Header>
        <ゲームカード.Content>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-full mt-1">
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">プレイヤー作成 (Create)</h3>
                <p className="text-gray-600">
                  新しいプレイヤーアカウントを作成できます。
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-full mt-1">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">プレイヤー確認 (Read)</h3>
                <p className="text-gray-600">
                  作成したプレイヤーの情報を確認できます。
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-full mt-1">
                <Gamepad2 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">モンスター管理 (CRUD)</h3>
                <p className="text-gray-600">
                  今後の開発で、モンスターの捕獲・管理・育成機能を追加予定です。
                </p>
              </div>
            </div>
          </div>
        </ゲームカード.Content>
      </ゲームカード>

      {/* 学習ポイント */}
      <ゲームカード variant="outlined" padding="lg" className="bg-gray-50">
        <ゲームカード.Header>
          <h2 className="text-2xl font-bold text-gray-900">
            学習ポイント
          </h2>
        </ゲームカード.Header>
        <ゲームカード.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">フロントエンド</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• React + TypeScript</li>
                <li>• React Router (SPA)</li>
                <li>• Tailwind CSS</li>
                <li>• 型安全なAPI通信</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">バックエンド</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Hono (Web Framework)</li>
                <li>• Cloudflare Workers</li>
                <li>• D1 Database (SQLite)</li>
                <li>• Drizzle ORM</li>
              </ul>
            </div>
          </div>
        </ゲームカード.Content>
      </ゲームカード>
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