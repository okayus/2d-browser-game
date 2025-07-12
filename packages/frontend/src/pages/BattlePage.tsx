/**
 * バトル画面ページコンポーネント
 * 野生のモンスターとのバトルを管理
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BattleScreen } from '../components/game/BattleScreen'
import { usePlayer } from '../hooks/usePlayer'
import { Button } from '../components/ui/Button'
import type { Monster } from '../types'

/**
 * バトルページコンポーネント
 * バトルシステムの親コンポーネント
 */
export function BattlePage() {
  const navigate = useNavigate()
  const { player } = usePlayer()

  // プレイヤーが存在しない場合はスタート画面へ
  if (!player) {
    return (
      <div className="min-h-screen prototype-background">
        <div className="prototype-card max-w-md mx-auto mt-8">
          <h2 className="text-xl font-bold mb-4">プレイヤー情報が見つかりません</h2>
          <p className="text-gray-600 mb-4">
            バトルを開始するにはプレイヤーを作成してください。
          </p>
          <Button onClick={() => navigate('/')}>
            スタート画面へ
          </Button>
        </div>
      </div>
    )
  }

  // モンスターを持っていない場合
  if (!player.monsters || player.monsters.length === 0) {
    return (
      <div className="min-h-screen prototype-background">
        <div className="prototype-card max-w-md mx-auto mt-8">
          <h2 className="text-xl font-bold mb-4">モンスターがいません</h2>
          <p className="text-gray-600 mb-4">
            バトルに参加するモンスターがいません。
          </p>
          <Button onClick={() => navigate('/player-creation')}>
            モンスターを選ぶ
          </Button>
        </div>
      </div>
    )
  }

  // プレイヤーのモンスターをMonster型に変換
  const playerMonster: Monster = {
    id: player.monsters[0].id,
    name: player.monsters[0].nickname || '相棒モンスター',
    type: 'fire', // デフォルト値、実際は種族データから取得
    level: 5,
    hp: player.monsters[0].currentHp,
    maxHp: player.monsters[0].maxHp,
    imageUrl: '/images/monsters/default.png'
  }

  return (
    <div className="min-h-screen prototype-background">
      <BattleScreen 
        playerMonster={playerMonster}
        onBattleEnd={() => navigate('/map')}
      />
    </div>
  )
}