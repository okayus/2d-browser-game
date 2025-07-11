/**
 * バトルログコンポーネント
 * バトルの進行状況を表示
 */
import React, { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import type { BattleLogEntry } from './BattleScreen'

/**
 * バトルログのプロパティ
 */
interface BattleLogProps {
  /** ログエントリーの配列 */
  entries: BattleLogEntry[]
}

/**
 * ログタイプに応じたスタイルを取得
 */
function getLogStyle(type: BattleLogEntry['type']) {
  switch (type) {
    case 'attack':
      return 'text-blue-600'
    case 'damage':
      return 'text-red-600'
    case 'capture':
      return 'text-purple-600'
    case 'victory':
      return 'text-green-600 font-bold'
    case 'defeat':
      return 'text-red-800 font-bold'
    default:
      return 'text-gray-700'
  }
}

/**
 * ログタイプに応じたアイコンを取得
 */
function getLogIcon(type: BattleLogEntry['type']) {
  switch (type) {
    case 'attack':
      return '⚔️'
    case 'damage':
      return '💥'
    case 'capture':
      return '🎯'
    case 'victory':
      return '🎉'
    case 'defeat':
      return '😭'
    default:
      return '📝'
  }
}

/**
 * バトルログコンポーネント
 * バトルの進行状況をスクロール可能なログで表示
 */
export function BattleLog({ entries }: BattleLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null)

  // 新しいログが追加されたら自動スクロール
  useEffect(() => {
    // scrollIntoViewがサポートされている場合のみ実行
    if (logEndRef.current && typeof logEndRef.current.scrollIntoView === 'function') {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [entries])

  return (
    <div className="h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50" data-testid="battle-log">
      <h3 className="text-sm font-bold text-gray-600 mb-2">バトルログ</h3>
      
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">バトル開始...</p>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                'text-sm flex items-start gap-2 animate-fade-in',
                getLogStyle(entry.type)
              )}
            >
              <span className="flex-shrink-0">
                {getLogIcon(entry.type)}
              </span>
              <span>{entry.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  )
}