/**
 * バトルフィールドコンポーネント
 * バトル中のモンスター表示エリア
 */
import React from 'react'
import { Card } from '../ui/Card'
import type { Monster } from '../../types'
import { cn } from '../../lib/utils'

/**
 * バトルフィールドのプロパティ
 */
interface BattleFieldProps {
  /** 野生のモンスター */
  wildMonster: Monster
  /** プレイヤーのモンスター */
  playerMonster: Monster
  /** プレイヤーのターンかどうか */
  isPlayerTurn: boolean
}

/**
 * HPバーコンポーネント
 */
function HPBar({ current, max, label }: { current: number; max: number; label: string }) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))
  
  // HP割合による色分け
  const barColor = percentage > 50 ? 'bg-green-500' : 
                   percentage > 30 ? 'bg-yellow-500' : 
                   'bg-red-500'

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">
          {current} / {max} HP
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          data-testid="hp-bar"
          className={cn(
            'h-full transition-all duration-500 ease-out',
            barColor
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-500 mt-1">
        {percentage.toFixed(0)}%
      </div>
    </div>
  )
}

/**
 * モンスターカード
 */
function MonsterCard({ 
  monster, 
  isWild, 
  isActive 
}: { 
  monster: Monster
  isWild: boolean
  isActive: boolean 
}) {
  return (
    <Card className={cn(
      "p-4 transition-all duration-300",
      isActive && "ring-2 ring-yellow-400 shadow-lg",
      !isActive && "opacity-75"
    )}>
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg">
          {isWild && "野生の"}{monster.name}
        </h3>
        <span className="text-sm text-gray-600">
          Lv.{monster.level || 5}
        </span>
      </div>

      {/* モンスター画像 */}
      <div className="relative h-32 mb-4 flex items-center justify-center">
        <div className="text-6xl animate-pulse">
          {isWild ? "🔥" : "⚡"}
        </div>
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
              待機中
            </span>
          </div>
        )}
      </div>

      {/* HPバー */}
      <HPBar 
        current={monster.hp} 
        max={monster.maxHp} 
        label="HP"
      />

      {/* タイプ表示 */}
      <div className="mt-3 text-center">
        <div className="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
          {monster.type}タイプ
        </div>
      </div>
    </Card>
  )
}

/**
 * バトルフィールドコンポーネント
 * 対戦中のモンスターを左右に配置
 */
export function BattleField({ wildMonster, playerMonster, isPlayerTurn }: BattleFieldProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 野生のモンスター（左側） */}
        <div data-testid="wild-monster">
          <MonsterCard 
            monster={wildMonster} 
            isWild={true}
            isActive={!isPlayerTurn}
          />
        </div>

        {/* VSテキスト（中央） */}
        <div className="flex items-center justify-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
          <span className="text-2xl font-bold text-gray-400 md:bg-white md:px-4 md:py-2 md:rounded-full md:shadow-lg">
            VS
          </span>
        </div>

        {/* プレイヤーのモンスター（右側） */}
        <div data-testid="player-monster">
          <MonsterCard 
            monster={playerMonster} 
            isWild={false}
            isActive={isPlayerTurn}
          />
        </div>
      </div>

      {/* ターン表示 */}
      <div className="text-center mt-4">
        <span className={cn(
          "inline-block px-4 py-2 rounded-full text-sm font-medium",
          isPlayerTurn 
            ? "bg-blue-100 text-blue-700" 
            : "bg-red-100 text-red-700"
        )}>
          {isPlayerTurn ? "あなたのターン" : "相手のターン"}
        </span>
      </div>
    </div>
  )
}