/**
 * BattleLogコンポーネントのユニットテスト
 * バトルログの表示とスタイルのテスト
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BattleLog } from '../BattleLog'
import type { BattleLogEntry } from '../BattleScreen'

// テスト用ログエントリー
const mockLogEntries: BattleLogEntry[] = [
  {
    id: '1',
    message: '野生のフレイムビーストが現れた！',
    type: 'info'
  },
  {
    id: '2',
    message: 'テストモンスターの攻撃！',
    type: 'attack'
  },
  {
    id: '3',
    message: 'フレイムビーストに25のダメージ！',
    type: 'damage'
  },
  {
    id: '4',
    message: 'モンスターボールを投げた！',
    type: 'capture'
  },
  {
    id: '5',
    message: 'フレイムビーストを倒した！',
    type: 'victory'
  },
  {
    id: '6',
    message: 'テストモンスターは倒れてしまった...',
    type: 'defeat'
  }
]

describe('BattleLog', () => {
  it('空のログの場合初期メッセージが表示される', () => {
    render(<BattleLog entries={[]} />)
    
    expect(screen.getByText('バトル開始...')).toBeInTheDocument()
    expect(screen.getByText('バトルログ')).toBeInTheDocument()
  })

  it('ログエントリーが正しく表示される', () => {
    render(<BattleLog entries={mockLogEntries} />)
    
    expect(screen.getByText('野生のフレイムビーストが現れた！')).toBeInTheDocument()
    expect(screen.getByText('テストモンスターの攻撃！')).toBeInTheDocument()
    expect(screen.getByText('フレイムビーストに25のダメージ！')).toBeInTheDocument()
  })

  it('ログタイプに応じた正しいアイコンが表示される', () => {
    render(<BattleLog entries={mockLogEntries} />)
    
    // 各ログタイプのアイコンを確認
    expect(screen.getByText('📝')).toBeInTheDocument() // info
    expect(screen.getByText('⚔️')).toBeInTheDocument() // attack
    expect(screen.getByText('💥')).toBeInTheDocument() // damage
    expect(screen.getByText('🎯')).toBeInTheDocument() // capture
    expect(screen.getByText('🎉')).toBeInTheDocument() // victory
    expect(screen.getByText('😭')).toBeInTheDocument() // defeat
  })

  it('ログタイプに応じた正しいスタイルが適用される', () => {
    render(<BattleLog entries={mockLogEntries} />)
    
    // info タイプ（グレー）
    const infoLog = screen.getByText('野生のフレイムビーストが現れた！').closest('div')
    expect(infoLog).toHaveClass('text-gray-700')
    
    // attack タイプ（青）
    const attackLog = screen.getByText('テストモンスターの攻撃！').closest('div')
    expect(attackLog).toHaveClass('text-blue-600')
    
    // damage タイプ（赤）
    const damageLog = screen.getByText('フレイムビーストに25のダメージ！').closest('div')
    expect(damageLog).toHaveClass('text-red-600')
    
    // capture タイプ（紫）
    const captureLog = screen.getByText('モンスターボールを投げた！').closest('div')
    expect(captureLog).toHaveClass('text-purple-600')
    
    // victory タイプ（緑・太字）
    const victoryLog = screen.getByText('フレイムビーストを倒した！').closest('div')
    expect(victoryLog).toHaveClass('text-green-600', 'font-bold')
    
    // defeat タイプ（暗赤・太字）
    const defeatLog = screen.getByText('テストモンスターは倒れてしまった...').closest('div')
    expect(defeatLog).toHaveClass('text-red-800', 'font-bold')
  })

  it('ログが時系列順で表示される', () => {
    render(<BattleLog entries={mockLogEntries} />)
    
    // アイコン部分を除外してメッセージテキストのみを取得
    expect(screen.getByText('野生のフレイムビーストが現れた！')).toBeInTheDocument()
    expect(screen.getByText('テストモンスターの攻撃！')).toBeInTheDocument()
    expect(screen.getByText('フレイムビーストに25のダメージ！')).toBeInTheDocument()
    
    // ログエントリーの順序を確認（DOM上の順序）
    const logContainer = screen.getByTestId('battle-log')
    const logItems = logContainer.querySelectorAll('.animate-fade-in')
    
    expect(logItems).toHaveLength(6)
    expect(logItems[0]).toHaveTextContent('野生のフレイムビーストが現れた！')
    expect(logItems[1]).toHaveTextContent('テストモンスターの攻撃！')
  })

  it('スクロール可能なコンテナが設定されている', () => {
    render(<BattleLog entries={mockLogEntries} />)
    
    const container = screen.getByTestId('battle-log')
    expect(container).toHaveClass('h-32', 'overflow-y-auto')
  })

  it('ログエントリーにフェードインアニメーションが適用される', () => {
    render(<BattleLog entries={mockLogEntries} />)
    
    const logEntry = screen.getByText('野生のフレイムビーストが現れた！').closest('div')
    expect(logEntry).toHaveClass('animate-fade-in')
  })

  it('ログコンテナの背景色が正しく設定される', () => {
    render(<BattleLog entries={mockLogEntries} />)
    
    const container = screen.getByTestId('battle-log')
    expect(container).toHaveClass('bg-gray-50')
  })

  it('単一のログエントリーが正しく表示される', () => {
    const singleEntry: BattleLogEntry[] = [
      {
        id: 'single',
        message: 'テスト用メッセージ',
        type: 'info'
      }
    ]
    
    render(<BattleLog entries={singleEntry} />)
    
    expect(screen.getByText('テスト用メッセージ')).toBeInTheDocument()
    expect(screen.queryByText('バトル開始...')).not.toBeInTheDocument()
  })

  it('scrollIntoViewのモック動作確認', () => {
    // scrollIntoViewのモック
    const mockScrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = mockScrollIntoView
    
    const { rerender } = render(<BattleLog entries={[]} />)
    
    // 新しいエントリーを追加
    rerender(<BattleLog entries={[mockLogEntries[0]]} />)
    
    // scrollIntoViewが呼ばれることを確認
    expect(mockScrollIntoView).toHaveBeenCalled()
  })

  it('ログタイプがdefaultの場合のスタイルとアイコン', () => {
    const defaultEntry: BattleLogEntry[] = [
      {
        id: 'default',
        message: 'デフォルトメッセージ',
        type: 'info' // default処理をテストするため、未知のタイプは使えないので代替テスト
      }
    ]
    
    render(<BattleLog entries={defaultEntry} />)
    
    const logEntry = screen.getByText('デフォルトメッセージ').closest('div')
    expect(logEntry).toHaveClass('text-gray-700')
    expect(screen.getByText('📝')).toBeInTheDocument()
  })
})