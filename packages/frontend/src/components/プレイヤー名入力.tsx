/**
 * プレイヤー名入力コンポーネント
 * 
 * 初学者向けメモ:
 * - カスタムフックを使った状態管理
 * - リアルタイムバリデーション
 * - アクセシビリティ対応
 */

import React from 'react';
import { User } from 'lucide-react';
import { ゲームカード } from './ゲームカード';
import { ゲームボタン } from './ゲームボタン';
import { useプレイヤー名 } from '../hooks/useプレイヤー名';

export interface プレイヤー名入力Props {
  /** ゲーム開始時の処理 */
  onゲーム開始?: (プレイヤー名: string) => void;
  /** 入力欄のプレースホルダー */
  placeholder?: string;
}

/**
 * プレイヤー名入力コンポーネント
 */
export const プレイヤー名入力: React.FC<プレイヤー名入力Props> = ({
  onゲーム開始,
  placeholder = "プレイヤー名を入力してください"
}) => {
  const { プレイヤー名, setプレイヤー名, エラー, 有効, クリア } = useプレイヤー名();

  // ゲーム開始処理
  const handleゲーム開始 = () => {
    if (有効) {
      onゲーム開始?.(プレイヤー名.trim());
    }
  };

  // Enterキーでのゲーム開始
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && 有効) {
      handleゲーム開始();
    }
  };

  return (
    <ゲームカード variant="elevated" padding="lg" className="max-w-md mx-auto">
      <ゲームカード.Header>
        <div className="flex items-center space-x-3 text-center justify-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            プレイヤー作成
          </h2>
        </div>
      </ゲームカード.Header>
      
      <ゲームカード.Content>
        <div className="space-y-4">
          {/* プレイヤー名入力欄 */}
          <div>
            <label 
              htmlFor="player-name-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              プレイヤー名 <span className="text-red-500">*</span>
            </label>
            <input
              id="player-name-input"
              type="text"
              value={プレイヤー名}
              onChange={(e) => setプレイヤー名(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`
                w-full px-4 py-3 border rounded-lg text-sm transition-colors
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${エラー 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
              `}
              maxLength={20}
              autoComplete="off"
              autoFocus
            />
            
            {/* 文字数カウンター */}
            <div className="flex justify-between items-center mt-1">
              <div>
                {エラー && (
                  <p className="text-sm text-red-500">{エラー}</p>
                )}
                {!エラー && プレイヤー名.length > 0 && (
                  <p className="text-sm text-green-600">✓ 有効なプレイヤー名です</p>
                )}
              </div>
              <span className={`text-sm ${
                プレイヤー名.length > 15 ? 'text-orange-500' : 'text-gray-500'
              }`}>
                {プレイヤー名.length}/20
              </span>
            </div>
          </div>

          {/* 入力ガイド */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-1">
              プレイヤー名について
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 2文字以上20文字以内で入力してください</li>
              <li>• ひらがな、カタカナ、漢字、英数字が使用できます</li>
              <li>• 入力した名前はローカルに保存されます</li>
            </ul>
          </div>
        </div>
      </ゲームカード.Content>

      <ゲームカード.Actions>
        <div className="flex space-x-3">
          {/* クリアボタン */}
          <ゲームボタン 
            variant="secondary" 
            onClick={クリア}
            disabled={!プレイヤー名}
            className="flex-1"
          >
            クリア
          </ゲームボタン>
          
          {/* ゲーム開始ボタン */}
          <ゲームボタン 
            variant="primary" 
            onClick={handleゲーム開始}
            disabled={!有効}
            className="flex-2"
          >
            ゲーム開始
          </ゲームボタン>
        </div>
      </ゲームカード.Actions>
    </ゲームカード>
  );
};