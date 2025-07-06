/**
 * モンスター一覧ページ
 * 
 * 初学者向けメモ：
 * - プレイヤーが所持するモンスターの一覧を表示
 * - 今後の開発で実装予定の機能のプレースホルダー
 * - UI/UXの設計例として参考になる
 */

import { useState } from 'react';
import { Plus, Search, Filter, Gamepad2, Heart, Star } from 'lucide-react';

/**
 * モンスター一覧ページコンポーネント
 * 
 * 初学者向けメモ：
 * - 将来の機能拡張を想定したレイアウト
 * - 検索・フィルタリング機能のUI
 * - 今後の開発で実装予定の機能を示す
 */
export function モンスター一覧() {
  const [検索クエリ, set検索クエリ] = useState('');
  const [フィルター, setフィルター] = useState('全て');

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">モンスター一覧</h1>
          <p className="text-gray-600 mt-1">あなたが捕獲したモンスターを管理します</p>
        </div>
        <button
          disabled
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          <span>モンスター捕獲</span>
        </button>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* 検索バー */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="モンスター名で検索..."
              value={検索クエリ}
              onChange={(e) => set検索クエリ(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled
            />
          </div>

          {/* フィルター */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={フィルター}
              onChange={(e) => setフィルター(e.target.value)}
              className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              disabled
            >
              <option value="全て">全てのモンスター</option>
              <option value="火">火属性</option>
              <option value="水">水属性</option>
              <option value="草">草属性</option>
            </select>
          </div>
        </div>
      </div>

      {/* モンスター一覧 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* 空の状態 */}
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 p-6 rounded-full">
              <Gamepad2 className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            まだモンスターを捕獲していません
          </h3>
          <p className="text-gray-600 mb-6">
            モンスター捕獲機能は今後のアップデートで実装予定です
          </p>
          <button
            disabled
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>最初のモンスターを捕獲</span>
          </button>
        </div>
      </div>

      {/* 今後の機能説明 */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4">
          今後実装予定の機能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-800">モンスター管理機能</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• モンスターの捕獲システム</li>
              <li>• ニックネーム設定・変更</li>
              <li>• モンスターの詳細情報表示</li>
              <li>• モンスターの放生（削除）</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-800">検索・フィルタリング</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• 名前での検索機能</li>
              <li>• 属性でのフィルタリング</li>
              <li>• HPやレベルでのソート</li>
              <li>• お気に入りモンスターの管理</li>
            </ul>
          </div>
        </div>
      </div>

      {/* サンプルモンスターカード（デザイン参考用） */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          モンスターカードのデザイン例
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* サンプルカード1 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 opacity-60">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Gamepad2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">火竜</h4>
                <p className="text-sm text-gray-600">ニックネーム: フレイム</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>HP:</span>
                <span>85/100</span>
              </div>
              <div className="flex justify-between">
                <span>属性:</span>
                <span className="text-red-600">火</span>
              </div>
              <div className="flex justify-between items-center">
                <span>お気に入り:</span>
                <Heart className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* サンプルカード2 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 opacity-60">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Gamepad2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">水亀</h4>
                <p className="text-sm text-gray-600">ニックネーム: アクア</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>HP:</span>
                <span>70/80</span>
              </div>
              <div className="flex justify-between">
                <span>属性:</span>
                <span className="text-blue-600">水</span>
              </div>
              <div className="flex justify-between items-center">
                <span>お気に入り:</span>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
              </div>
            </div>
          </div>

          {/* サンプルカード3 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 opacity-60">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Gamepad2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">草妖精</h4>
                <p className="text-sm text-gray-600">ニックネーム: リーフ</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>HP:</span>
                <span>60/60</span>
              </div>
              <div className="flex justify-between">
                <span>属性:</span>
                <span className="text-green-600">草</span>
              </div>
              <div className="flex justify-between items-center">
                <span>お気に入り:</span>
                <Heart className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          ※ これらは実装予定の機能のデザイン例です（実際のデータではありません）
        </p>
      </div>
    </div>
  );
}

/**
 * 初学者向けメモ：モンスター一覧ページの設計ポイント
 * 
 * 1. 将来の機能拡張を考慮
 *    - UI/UXの設計を先行して実装
 *    - プレースホルダー要素で機能を示唆
 * 
 * 2. 検索・フィルタリング
 *    - ユーザビリティの向上
 *    - 大量のデータを扱う際の準備
 * 
 * 3. 空の状態（Empty State）
 *    - 初回ユーザー向けのガイダンス
 *    - 行動を促すメッセージ
 * 
 * 4. カードレイアウト
 *    - 情報の整理
 *    - 視覚的な分かりやすさ
 *    - レスポンシブデザイン
 * 
 * 5. 段階的な機能追加
 *    - MVPから機能を段階的に追加
 *    - ユーザーの期待値を適切に設定
 */