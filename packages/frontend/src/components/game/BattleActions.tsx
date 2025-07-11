/**
 * バトルアクションコンポーネント
 * バトル中のアクションボタン群
 */
import React from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

/**
 * バトルアクションのプロパティ
 */
interface BattleActionsProps {
  /** 攻撃時のコールバック */
  onAttack: () => void
  /** 捕獲時のコールバック */
  onCapture: () => void
  /** 逃走時のコールバック */
  onRun: () => void
  /** ボタンの無効化状態 */
  disabled: boolean
  /** 捕獲可能かどうか */
  captureEnabled?: boolean
}

/**
 * バトルアクションコンポーネント
 * プレイヤーが選択できるアクションを表示
 */
export function BattleActions({
  onAttack,
  onCapture,
  onRun,
  disabled,
  captureEnabled = false
}: BattleActionsProps) {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* たたかうボタン */}
        <Button
          onClick={onAttack}
          disabled={disabled}
          size="lg"
          className="w-full"
          variant="default"
          data-testid="attack-button"
        >
          <span className="text-lg">⚔️</span>
          <span className="ml-2">たたかう</span>
        </Button>

        {/* つかまえるボタン */}
        <div className="relative">
          <Button
            onClick={onCapture}
            disabled={disabled}
            size="lg"
            className="w-full"
            variant={captureEnabled ? "secondary" : "outline"}
            data-testid="capture-button"
          >
            <span className="text-lg">🎯</span>
            <span className="ml-2">つかまえる</span>
          </Button>
          {captureEnabled && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs px-2 py-1 rounded-full font-bold animate-pulse">
              チャンス！
            </span>
          )}
        </div>

        {/* にげるボタン */}
        <Button
          onClick={onRun}
          disabled={disabled}
          size="lg"
          className="w-full"
          variant="outline"
          data-testid="run-button"
        >
          <span className="text-lg">🏃</span>
          <span className="ml-2">にげる</span>
        </Button>
      </div>

      {/* ヒント表示 */}
      <div className="mt-3 text-center text-sm text-gray-600">
        {disabled && "相手のターンです..."}
        {!disabled && captureEnabled && (
          <p className="text-yellow-600 font-medium">
            相手のHPが低い！捕獲のチャンス！
          </p>
        )}
        {!disabled && !captureEnabled && (
          <p>相手のHPを減らすと捕獲しやすくなります</p>
        )}
      </div>
    </Card>
  )
}