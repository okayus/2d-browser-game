/**
 * モンスターカードコンポーネント
 * 
 * 初学者向けメモ:
 * - モンスター情報を視覚的に表示
 * - 選択可能なインタラクティブカード
 * - レアリティと種類に応じた色分け
 * - ステータス情報の分かりやすい表示
 */

import React from 'react';
import { Star, Zap, Shield, Heart, Wind } from 'lucide-react';
import { ゲームカード } from './ゲームカード';
import { スターターモンスター, レアリティ色設定, モンスター種類色設定 } from '../types/モンスター';

export interface モンスターカードProps {
  /** 表示するモンスター情報 */
  モンスター: スターターモンスター;
  /** 選択状態 */
  選択中?: boolean;
  /** クリック時の処理 */
  onClick?: (モンスター: スターターモンスター) => void;
  /** カードサイズ */
  サイズ?: 'sm' | 'md' | 'lg';
  /** 詳細表示モード */
  詳細表示?: boolean;
}

/**
 * ステータスアイコン取得
 */
const getステータスアイコン = (ステータス名: string) => {
  const アイコンマップ = {
    'HP': Heart,
    '攻撃力': Zap,
    '防御力': Shield,
    '素早さ': Wind
  };
  return アイコンマップ[ステータス名 as keyof typeof アイコンマップ] || Star;
};

/**
 * レアリティスター表示
 */
const レアリティスター: React.FC<{ レアリティ: string }> = ({ レアリティ }) => {
  const スター数 = {
    'コモン': 1,
    'アンコモン': 2,
    'レア': 3,
    'エピック': 4,
    'レジェンド': 5
  }[レアリティ] || 1;

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: スター数 }, (_, i) => (
        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
};

/**
 * メインのモンスターカードコンポーネント
 */
export const モンスターカード: React.FC<モンスターカードProps> = ({
  モンスター,
  選択中 = false,
  onClick,
  サイズ = 'md',
  詳細表示 = true
}) => {
  const レアリティ色 = レアリティ色設定[モンスター.レアリティ as keyof typeof レアリティ色設定];
  const 種類色 = モンスター種類色設定[モンスター.種類];

  // サイズに応じたクラス
  const サイズクラス = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }[サイズ];

  return (
    <ゲームカード
      variant={onClick ? "interactive" : "elevated"}
      padding="lg"
      selected={選択中}
      onClick={onClick ? () => onClick(モンスター) : undefined}
      className={`${サイズクラス} transition-all duration-200 ${
        選択中 ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''
      } ${onClick ? 'cursor-pointer hover:scale-102' : ''}`}
    >
      {/* カードヘッダー */}
      <ゲームカード.Header>
        <div className="flex items-center justify-between">
          {/* モンスター基本情報 */}
          <div className="flex items-center space-x-3">
            <div className={`
              text-4xl p-3 rounded-full ${種類色.背景色}
              ${選択中 ? 'animate-pulse' : ''}
            `}>
              {モンスター.アイコン}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 flex items-center space-x-2">
                <span>{モンスター.名前}</span>
                {選択中&& <span className="text-blue-500">✓</span>}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${種類色.背景色} ${種類色.アイコン色}
                `}>
                  {モンスター.種類}
                </span>
                <レアリティスター レアリティ={モンスター.レアリティ} />
              </div>
            </div>
          </div>

          {/* レアリティバッジ */}
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${レアリティ色.背景色} ${レアリティ色.文字色} ${レアリティ色.境界色} border
          `}>
            {モンスター.レアリティ}
          </div>
        </div>
      </ゲームカード.Header>

      {/* カードコンテンツ */}
      <ゲームカード.Content>
        <div className="space-y-4">
          {/* モンスター説明 */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {モンスター.説明}
          </p>

          {/* ステータス表示 */}
          {詳細表示 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm">ステータス</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(モンスター.ステータス).map(([ステータス名, 値]) => {
                  const IconComponent = getステータスアイコン(ステータス名);
                  const 最大値 = 100; // ステータスの最大値
                  const パーセンテージ = Math.min((値 / 最大値) * 100, 100);
                  
                  return (
                    <div key={ステータス名} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <IconComponent className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{ステータス名}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-900">{値}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            パーセンテージ >= 80 ? 'bg-green-500' :
                            パーセンテージ >= 60 ? 'bg-blue-500' :
                            パーセンテージ >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${パーセンテージ}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* スターター専用情報 */}
          <div className="space-y-2">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h5 className="font-medium text-blue-900 text-sm mb-1">推奨理由</h5>
              <p className="text-blue-700 text-xs">{モンスター.推奨理由}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <h5 className="font-medium text-green-900 text-sm mb-1">初心者アドバイス</h5>
              <p className="text-green-700 text-xs">{モンスター.アドバイス}</p>
            </div>
          </div>
        </div>
      </ゲームカード.Content>

      {/* 選択状態の表示 */}
      {選択中 && (
        <ゲームカード.Actions>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              <span>選択中</span>
              <span className="animate-bounce">✓</span>
            </div>
          </div>
        </ゲームカード.Actions>
      )}
    </ゲームカード>
  );
};