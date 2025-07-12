/**
 * プレイヤー情報パネルコンポーネント
 * プレイヤーの基本情報と選択モンスターを表示
 */
import React from 'react'
import { Card, CardHeader, CardContent } from '../ui'
import { type MonsterType } from '../../lib/utils'

/**
 * プレイヤー情報の型定義
 */
interface PlayerInfo {
  name: string
  selectedMonster?: MonsterType | {
    id: string
    name: string
    type: string
    imageUrl: string
    description: string
    baseStats: { hp: number; attack: number; defense: number }
  }
  position: { x: number; y: number }
}

/**
 * PlayerPanelコンポーネントのプロパティ
 */
interface PlayerPanelProps {
  /** プレイヤー情報 */
  player: PlayerInfo
  /** パネルの表示サイズ */
  size?: 'compact' | 'full'
}

/**
 * プレイヤー情報パネルコンポーネント
 * プロトタイプのプレイヤー情報表示をReactで再実装
 */
export function PlayerPanel({ player, size = 'full' }: PlayerPanelProps) {
  const isCompact = size === 'compact'

  return (
    <Card data-testid="player-panel">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="character w-10 h-10 flex items-center justify-center text-lg">
            🧙‍♂️
          </div>
          <div>
            <h3 className={`font-bold text-gray-900 ${isCompact ? 'text-lg' : 'text-xl'}`} data-testid="player-name">
              {player.name}
            </h3>
            <p className="text-sm text-gray-600">プレイヤー</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 現在位置 */}
        <div data-testid="player-position">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">📍 現在位置</h4>
          <p className="text-sm text-gray-600">
            座標: ({player.position.x}, {player.position.y})
          </p>
        </div>

        {/* パートナーモンスター */}
        {player.selectedMonster && (
          <div data-testid="partner-monster">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">⚡ パートナー</h4>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{'icon' in player.selectedMonster ? player.selectedMonster.icon : '🎮'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-blue-900 truncate" data-testid="partner-name">
                    {player.selectedMonster.name}
                  </p>
                  {!isCompact && (
                    <>
                      <p className="text-xs text-blue-700 mt-1">
                        {player.selectedMonster.description}
                      </p>
                      <div className="flex justify-between text-xs text-blue-600 mt-2">
                        <span>HP: {'baseHp' in player.selectedMonster ? player.selectedMonster.baseHp : player.selectedMonster.baseStats.hp}</span>
                        <span className={`font-medium ${
                          'rarity' in player.selectedMonster && player.selectedMonster.rarity === 'rare' ? 'text-purple-600' : 'text-blue-600'
                        }`}>
                          {'rarity' in player.selectedMonster && player.selectedMonster.rarity === 'rare' ? 'レア' : '一般'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* パートナーが選択されていない場合 */}
        {!player.selectedMonster && (
          <div data-testid="no-partner">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">⚡ パートナー</h4>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">❓</div>
              <p className="text-xs text-gray-500">
                パートナーが選択されていません
              </p>
            </div>
          </div>
        )}

        {/* ゲーム進行情報（フルサイズ時のみ） */}
        {!isCompact && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">📊 進行状況</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>発見したモンスター:</span>
                <span className="font-medium">0種類</span>
              </div>
              <div className="flex justify-between">
                <span>移動距離:</span>
                <span className="font-medium">-歩</span>
              </div>
              <div className="flex justify-between">
                <span>プレイ時間:</span>
                <span className="font-medium">-分</span>
              </div>
            </div>
          </div>
        )}

        {/* アクションボタン（フルサイズ時のみ） */}
        {!isCompact && (
          <div className="pt-2 border-t border-gray-200">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200" data-testid="monster-list-button">
              🎒 モンスター一覧
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}