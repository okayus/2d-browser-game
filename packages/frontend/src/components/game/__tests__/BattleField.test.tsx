/**
 * BattleFieldコンポーネントのユニットテスト
 * モンスター表示とHPバーのテスト
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BattleField } from '../BattleField'
import type { Monster } from '../../../types'

// テスト用モンスターデータ
const mockPlayerMonster: Monster = {
  id: 'player-monster',
  name: 'プレイヤーモンスター',
  type: 'electric',
  level: 10,
  hp: 80,
  maxHp: 100
}

const mockWildMonster: Monster = {
  id: 'wild-monster',
  name: 'フレイムビースト',
  type: 'fire',
  level: 5,
  hp: 75,
  maxHp: 100
}

describe('BattleField', () => {
  it('プレイヤーモンスターが正しく表示される', () => {
    render(
      <BattleField
        playerMonster={mockPlayerMonster}
        wildMonster={mockWildMonster}
        isPlayerTurn={true}
      />
    )
    
    expect(screen.getByText('プレイヤーモンスター')).toBeInTheDocument()
    expect(screen.getByText('Lv.10')).toBeInTheDocument()
  })

  it('野生モンスターが正しく表示される', () => {
    render(
      <BattleField
        playerMonster={mockPlayerMonster}
        wildMonster={mockWildMonster}
        isPlayerTurn={true}
      />
    )
    
    expect(screen.getByText('野生のフレイムビースト')).toBeInTheDocument()
    expect(screen.getByText('Lv.5')).toBeInTheDocument()
  })

  it('HPバーが正しく表示される', () => {
    render(
      <BattleField
        playerMonster={mockPlayerMonster}
        wildMonster={mockWildMonster}
        isPlayerTurn={true}
      />
    )
    
    // HP表示を確認（実際の形式: "75 / 100 HP"）
    expect(screen.getByText('80 / 100 HP')).toBeInTheDocument()
    expect(screen.getByText('75 / 100 HP')).toBeInTheDocument()
  })

  it('ターンインジケーターが正しく表示される - プレイヤーターン', () => {
    render(
      <BattleField
        playerMonster={mockPlayerMonster}
        wildMonster={mockWildMonster}
        isPlayerTurn={true}
      />
    )
    
    // プレイヤーターンの表示を確認
    expect(screen.getByText('あなたのターン')).toBeInTheDocument()
    expect(screen.getByText('あなたのターン')).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('ターンインジケーターが正しく表示される - 敵ターン', () => {
    render(
      <BattleField
        playerMonster={mockPlayerMonster}
        wildMonster={mockWildMonster}
        isPlayerTurn={false}
      />
    )
    
    // 敵ターンの表示を確認
    expect(screen.getByText('相手のターン')).toBeInTheDocument()
    expect(screen.getByText('相手のターン')).toHaveClass('bg-red-100', 'text-red-700')
  })

  it('HPバーの色が正しく表示される - 緑色（HP50%以上）', () => {
    render(
      <BattleField
        playerMonster={mockPlayerMonster}
        wildMonster={mockWildMonster}
        isPlayerTurn={true}
      />
    )
    
    // HP80%のプレイヤーモンスターは緑色
    const hpBars = screen.getAllByTestId('hp-bar')
    expect(hpBars[1]).toHaveClass('bg-green-500') // プレイヤーは2番目
  })

  it('HPバーの色が正しく表示される - 黄色（HP30-50%）', () => {
    const lowHpMonster = { ...mockPlayerMonster, hp: 40, maxHp: 100 }
    
    render(
      <BattleField
        playerMonster={lowHpMonster}
        wildMonster={mockWildMonster}
        isPlayerTurn={true}
      />
    )
    
    // HP40%のプレイヤーモンスターは黄色
    const hpBars = screen.getAllByTestId('hp-bar')
    expect(hpBars[1]).toHaveClass('bg-yellow-500')
  })

  it('HPバーの色が正しく表示される - 赤色（HP30%未満）', () => {
    const criticalHpMonster = { ...mockPlayerMonster, hp: 20, maxHp: 100 }
    
    render(
      <BattleField
        playerMonster={criticalHpMonster}
        wildMonster={mockWildMonster}
        isPlayerTurn={true}
      />
    )
    
    // HP20%のプレイヤーモンスターは赤色
    const hpBars = screen.getAllByTestId('hp-bar')
    expect(hpBars[1]).toHaveClass('bg-red-500')
  })

  it('HPバーの幅が正しく計算される', () => {
    render(
      <BattleField
        playerMonster={mockPlayerMonster}
        wildMonster={mockWildMonster}
        isPlayerTurn={true}
      />
    )
    
    // HP75/100 = 75%の幅（野生モンスター）
    const hpBars = screen.getAllByTestId('hp-bar')
    expect(hpBars[0]).toHaveStyle('width: 75%')
    
    // HP80/100 = 80%の幅（プレイヤーモンスター）
    expect(hpBars[1]).toHaveStyle('width: 80%')
  })

  it('HP0の場合の表示', () => {
    const faintedMonster = { ...mockPlayerMonster, hp: 0, maxHp: 100 }
    
    render(
      <BattleField
        playerMonster={faintedMonster}
        wildMonster={mockWildMonster}
        isPlayerTurn={true}
      />
    )
    
    // HP0/100の表示
    expect(screen.getByText('0 / 100 HP')).toBeInTheDocument()
    
    // HPバーの幅が0%
    const hpBars = screen.getAllByTestId('hp-bar')
    expect(hpBars[1]).toHaveStyle('width: 0%')
    expect(hpBars[1]).toHaveClass('bg-red-500')
  })

  it('レベルが表示されない場合の処理', () => {
    const noLevelMonster = { ...mockPlayerMonster, level: undefined }
    
    render(
      <BattleField
        playerMonster={noLevelMonster}
        wildMonster={mockWildMonster}
        isPlayerTurn={true}
      />
    )
    
    // レベルが表示されないことを確認
    expect(screen.queryByText('Lv.undefined')).not.toBeInTheDocument()
  })
})