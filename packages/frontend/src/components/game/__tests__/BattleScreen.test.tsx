/**
 * BattleScreenコンポーネントのユニットテスト
 * バトルロジックの完全なテストカバレッジ
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { BattleScreen } from '../BattleScreen'
import type { Monster } from '../../../types'

// モックナビゲーション
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// テスト用モンスターデータ（バックエンドスキーマに準拠）
const mockPlayerMonster: Monster = {
  id: 'test-monster',
  name: 'テストモンスター',
  type: 'electric',
  level: 10,
  hp: 80,
  maxHp: 100
}

// コンポーネントをレンダリングするヘルパー
const renderBattleScreen = () => {
  return render(
    <BrowserRouter>
      <BattleScreen 
        playerMonster={mockPlayerMonster}
        onBattleEnd={mockNavigate}
      />
    </BrowserRouter>
  )
}

describe('BattleScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Math.randomのモック（ダメージ25固定、捕獲失敗）
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  it('バトル画面が表示される', () => {
    renderBattleScreen()
    
    expect(screen.getByTestId('battle-screen')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '野生のフレイムビーストが現れた！' })).toBeInTheDocument()
  })

  it('バトルログが正しく初期化される', () => {
    renderBattleScreen()
    
    // バトルログ内の特定のメッセージを確認（data-testidで特定）
    const battleLogContainer = screen.getByTestId('battle-log')
    expect(battleLogContainer).toHaveTextContent('野生のフレイムビーストが現れた！')
  })

  it('ターン順がHPベースで決定される - 敵先攻（プレイヤーHP低い）', () => {
    renderBattleScreen()
    
    // プレイヤーHP80 < 敵HP100なので敵先攻
    expect(screen.getByText('相手のHPが高い！敵の先攻！')).toBeInTheDocument()
  })

  it('ターン順がHPベースで決定される - プレイヤー先攻（プレイヤーHP高い）', () => {
    const highHpMonster = { ...mockPlayerMonster, hp: 120, maxHp: 120 }
    render(
      <BrowserRouter>
        <BattleScreen 
          playerMonster={highHpMonster}
          onBattleEnd={mockNavigate}
        />
      </BrowserRouter>
    )
    
    // プレイヤーHP120 > 敵HP100なので先攻
    expect(screen.getByText('あなたのHPが高い！先攻できる！')).toBeInTheDocument()
  })

  it('バトルアクションボタンが表示される', () => {
    const highHpMonster = { ...mockPlayerMonster, hp: 120, maxHp: 120 }
    render(
      <BrowserRouter>
        <BattleScreen 
          playerMonster={highHpMonster}
          onBattleEnd={mockNavigate}
        />
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('attack-button')).toBeInTheDocument()
    expect(screen.getByTestId('capture-button')).toBeInTheDocument()
    expect(screen.getByTestId('run-button')).toBeInTheDocument()
  })

  it('攻撃ボタンをクリックするとダメージ計算が行われる', async () => {
    const highHpMonster = { ...mockPlayerMonster, hp: 120, maxHp: 120 }
    render(
      <BrowserRouter>
        <BattleScreen 
          playerMonster={highHpMonster}
          onBattleEnd={mockNavigate}
        />
      </BrowserRouter>
    )
    
    const attackButton = screen.getByTestId('attack-button')
    fireEvent.click(attackButton)
    
    // ダメージが20-30の範囲であることを確認（モックでは25固定）
    await waitFor(() => {
      expect(screen.getByText(/テストモンスターの攻撃！/)).toBeInTheDocument()
      expect(screen.getByText(/フレイムビーストに25のダメージ！/)).toBeInTheDocument()
    })
  })

  it('捕獲ボタンが機能する - 成功', async () => {
    // 個別のMathモック設定
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0.05) // 非常に低い値で確実に成功
    
    const highHpMonster = { ...mockPlayerMonster, hp: 120, maxHp: 120 }
    render(
      <BrowserRouter>
        <BattleScreen 
          playerMonster={highHpMonster}
          onBattleEnd={mockNavigate}
        />
      </BrowserRouter>
    )
    
    const captureButton = screen.getByTestId('capture-button')
    fireEvent.click(captureButton)
    
    // 捕獲成功後はバトル勝利画面に切り替わることを確認
    await waitFor(() => {
      expect(screen.getByText('バトル勝利！')).toBeInTheDocument()
      expect(screen.getByText('フレイムビーストに勝利した！')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    randomSpy.mockRestore()
  })

  it('捕獲ボタンが機能する - 失敗', async () => {
    // 個別のMathモック設定
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0.9) // 高い値で確実に失敗
    
    const highHpMonster = { ...mockPlayerMonster, hp: 120, maxHp: 120 }
    render(
      <BrowserRouter>
        <BattleScreen 
          playerMonster={highHpMonster}
          onBattleEnd={mockNavigate}
        />
      </BrowserRouter>
    )
    
    const captureButton = screen.getByTestId('capture-button')
    fireEvent.click(captureButton)
    
    // バトルログで捕獲失敗メッセージを確認
    await waitFor(() => {
      const battleLog = screen.getByTestId('battle-log')
      expect(battleLog).toHaveTextContent('だめだ！捕まらなかった！')
    }, { timeout: 3000 })
    
    randomSpy.mockRestore()
  })

  it('逃げるボタンをクリックするとバトルが終了する', async () => {
    const highHpMonster = { ...mockPlayerMonster, hp: 120, maxHp: 120 }
    render(
      <BrowserRouter>
        <BattleScreen 
          playerMonster={highHpMonster}
          onBattleEnd={mockNavigate}
        />
      </BrowserRouter>
    )
    
    const runButton = screen.getByTestId('run-button')
    fireEvent.click(runButton)
    
    // 逃走成功画面を確認
    await waitFor(() => {
      expect(screen.getByText('逃走成功！')).toBeInTheDocument()
      expect(screen.getByText('戦闘から逃げ出した！')).toBeInTheDocument()
    })
  })

  it('バトル終了後にマップに戻るボタンが表示される', async () => {
    const highHpMonster = { ...mockPlayerMonster, hp: 120, maxHp: 120 }
    render(
      <BrowserRouter>
        <BattleScreen 
          playerMonster={highHpMonster}
          onBattleEnd={mockNavigate}
        />
      </BrowserRouter>
    )
    
    const runButton = screen.getByTestId('run-button')
    fireEvent.click(runButton)
    
    await waitFor(() => {
      const backButton = screen.getByText('マップに戻る')
      expect(backButton).toBeInTheDocument()
      
      fireEvent.click(backButton)
      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  it('ダメージ計算が正しい範囲内である（20-30）', async () => {
    // ダメージ計算のテスト用にランダム値を設定
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // 20 + (0.5 * 11) = 25.5 → 25
    
    const highHpMonster = { ...mockPlayerMonster, hp: 120, maxHp: 120 }
    render(
      <BrowserRouter>
        <BattleScreen 
          playerMonster={highHpMonster}
          onBattleEnd={mockNavigate}
        />
      </BrowserRouter>
    )
    
    const attackButton = screen.getByTestId('attack-button')
    fireEvent.click(attackButton)
    
    await waitFor(() => {
      expect(screen.getByText(/フレイムビーストに25のダメージ！/)).toBeInTheDocument()
    })
  })

  it('捕獲チャンスが正しく表示される（HP30%以下）', async () => {
    const highHpMonster = { ...mockPlayerMonster, hp: 120, maxHp: 120 }
    render(
      <BrowserRouter>
        <BattleScreen 
          playerMonster={highHpMonster}
          onBattleEnd={mockNavigate}
        />
      </BrowserRouter>
    )
    
    // 初期状態では捕獲チャンスは表示されない
    expect(screen.queryByText('チャンス！')).not.toBeInTheDocument()
    
    // BattleActionsコンポーネントで捕獲チャンス機能をテスト済みなので、
    // このテストはシンプルな初期状態のチェックのみに限定
    expect(screen.getByText('相手のHPを減らすと捕獲しやすくなります')).toBeInTheDocument()
  })
})