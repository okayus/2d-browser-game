/**
 * モンスター選択セクションコンポーネント
 * 
 * 初学者向けメモ:
 * - スターターモンスター選択UI
 * - モンスターカードの一覧表示
 * - 選択ガイドとヘルプ表示
 * - レスポンシブデザイン対応
 */

import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { ゲームカード } from './ゲームカード';
import { モンスターカード } from './モンスターカード';
import { useモンスター選択 } from '../hooks/useモンスター選択';
import { スターターモンスター一覧, モンスター選択ガイド } from '../data/スターターモンスター';

export interface モンスター選択セクションProps {
  /** 選択変更時のコールバック */
  on選択変更?: (モンスター: any) => void;
  /** 表示モード */
  表示モード?: 'full' | 'compact';
}

/**
 * メインのモンスター選択セクションコンポーネント
 */
export const モンスター選択セクション: React.FC<モンスター選択セクションProps> = ({
  on選択変更,
  表示モード = 'full'
}) => {
  const { 選択モンスター, モンスター選択, 選択クリア, is選択中 } = useモンスター選択();

  // モンスター選択時の処理
  const handleモンスター選択 = (モンスター: any) => {
    モンスター選択(モンスター);
    on選択変更?.(モンスター);
  };

  return (
    <div className="space-y-6">
      {/* セクションヘッダー */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">{モンスター選択ガイド.タイトル}</h2>
          <Sparkles className="h-6 w-6 text-purple-600" />
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {モンスター選択ガイド.説明}
        </p>
      </div>

      {/* 選択ガイド */}
      {表示モード === 'full' && (
        <ゲームカード variant="outlined" padding="lg" className="bg-blue-50">
          <ゲームカード.Header>
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">選択のヒント</h3>
            </div>
          </ゲームカード.Header>
          <ゲームカード.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">戦略のコツ</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  {モンスター選択ガイド.選択のコツ.map((コツ, index) => (
                    <li key={index}>{コツ}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">注意事項</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  {モンスター選択ガイド.注意事項.map((注意, index) => (
                    <li key={index}>{注意}</li>
                  ))}
                </ul>
              </div>
            </div>
          </ゲームカード.Content>
        </ゲームカード>
      )}

      {/* モンスター一覧 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          パートナーを選んでください
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {スターターモンスター一覧.map((モンスター) => (
            <モンスターカード
              key={モンスター.id}
              モンスター={モンスター}
              選択中={is選択中(モンスター.id)}
              onClick={handleモンスター選択}
              サイズ={表示モード === 'compact' ? 'sm' : 'md'}
              詳細表示={表示モード === 'full'}
            />
          ))}
        </div>
      </div>

      {/* 選択状態の表示 */}
      {選択モンスター && (
        <ゲームカード variant="elevated" padding="lg" className="bg-green-50">
          <ゲームカード.Header>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <h3 className="font-semibold text-green-900">選択完了</h3>
              </div>
              <button
                onClick={選択クリア}
                className="text-sm text-green-600 hover:text-green-800 underline"
              >
                選択を変更
              </button>
            </div>
          </ゲームカード.Header>
          <ゲームカード.Content>
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{選択モンスター.アイコン}</span>
              <div>
                <p className="text-green-800 font-medium">
                  パートナーに「{選択モンスター.名前}」を選択しました
                </p>
                <p className="text-sm text-green-600">
                  {選択モンスター.種類}属性 • {選択モンスター.レアリティ}
                </p>
              </div>
            </div>
          </ゲームカード.Content>
        </ゲームカード>
      )}
    </div>
  );
};