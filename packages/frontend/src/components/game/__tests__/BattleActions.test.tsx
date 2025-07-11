/**
 * BattleActionsコンポーネントのユニットテスト
 * バトルアクションボタンの動作テスト
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BattleActions } from '../BattleActions'

// モック関数
const mockOnAttack = vi.fn()
const mockOnCapture = vi.fn()
const mockOnRun = vi.fn()

// 基本プロパティ
const defaultProps = {
  onAttack: mockOnAttack,
  onCapture: mockOnCapture,
  onRun: mockOnRun,
  disabled: false,
  captureEnabled: false
}

describe('BattleActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('すべてのアクションボタンが表示される', () => {
    render(<BattleActions {...defaultProps} />)
    
    expect(screen.getByTestId('attack-button')).toBeInTheDocument()
    expect(screen.getByTestId('capture-button')).toBeInTheDocument()
    expect(screen.getByTestId('run-button')).toBeInTheDocument()
  })

  it('攻撃ボタンのテキストとアイコンが正しく表示される', () => {
    render(<BattleActions {...defaultProps} />)
    
    const attackButton = screen.getByTestId('attack-button')
    expect(attackButton).toHaveTextContent('⚔️')
    expect(attackButton).toHaveTextContent('たたかう')
  })

  it('捕獲ボタンのテキストとアイコンが正しく表示される', () => {
    render(<BattleActions {...defaultProps} />)
    
    const captureButton = screen.getByTestId('capture-button')
    expect(captureButton).toHaveTextContent('🎯')
    expect(captureButton).toHaveTextContent('つかまえる')
  })

  it('逃走ボタンのテキストとアイコンが正しく表示される', () => {
    render(<BattleActions {...defaultProps} />)
    
    const runButton = screen.getByTestId('run-button')
    expect(runButton).toHaveTextContent('🏃')
    expect(runButton).toHaveTextContent('にげる')
  })

  it('攻撃ボタンクリック時にコールバックが呼ばれる', () => {
    render(<BattleActions {...defaultProps} />)
    
    const attackButton = screen.getByTestId('attack-button')
    fireEvent.click(attackButton)
    
    expect(mockOnAttack).toHaveBeenCalledOnce()
  })

  it('捕獲ボタンクリック時にコールバックが呼ばれる', () => {
    render(<BattleActions {...defaultProps} />)
    
    const captureButton = screen.getByTestId('capture-button')
    fireEvent.click(captureButton)
    
    expect(mockOnCapture).toHaveBeenCalledOnce()
  })

  it('逃走ボタンクリック時にコールバックが呼ばれる', () => {
    render(<BattleActions {...defaultProps} />)
    
    const runButton = screen.getByTestId('run-button')
    fireEvent.click(runButton)
    
    expect(mockOnRun).toHaveBeenCalledOnce()
  })

  it('disabled=trueの場合すべてのボタンが無効化される', () => {
    render(<BattleActions {...defaultProps} disabled={true} />)
    
    expect(screen.getByTestId('attack-button')).toBeDisabled()
    expect(screen.getByTestId('capture-button')).toBeDisabled()
    expect(screen.getByTestId('run-button')).toBeDisabled()
  })

  it('disabled=trueの場合ヒントメッセージが表示される', () => {
    render(<BattleActions {...defaultProps} disabled={true} />)
    
    expect(screen.getByText('相手のターンです...')).toBeInTheDocument()
  })

  it('captureEnabled=trueの場合チャンス表示が出る', () => {
    render(<BattleActions {...defaultProps} captureEnabled={true} />)
    
    expect(screen.getByText('チャンス！')).toBeInTheDocument()
    expect(screen.getByText('相手のHPが低い！捕獲のチャンス！')).toBeInTheDocument()
  })

  it('captureEnabled=trueの場合捕獲ボタンのスタイルが変わる', () => {
    render(<BattleActions {...defaultProps} captureEnabled={true} />)
    
    const captureButton = screen.getByTestId('capture-button')
    // secondary variantが適用されることを確認（実際のクラス名）
    expect(captureButton).toHaveClass('bg-gray-600', 'text-white')
  })

  it('captureEnabled=falseの場合通常のヒントが表示される', () => {
    render(<BattleActions {...defaultProps} captureEnabled={false} />)
    
    expect(screen.getByText('相手のHPを減らすと捕獲しやすくなります')).toBeInTheDocument()
  })

  it('disabled=falseかつcaptureEnabled=falseの場合の表示', () => {
    render(<BattleActions {...defaultProps} disabled={false} captureEnabled={false} />)
    
    expect(screen.queryByText('相手のターンです...')).not.toBeInTheDocument()
    expect(screen.queryByText('チャンス！')).not.toBeInTheDocument()
    expect(screen.getByText('相手のHPを減らすと捕獲しやすくなります')).toBeInTheDocument()
  })

  it('グリッドレイアウトが正しく適用される', () => {
    render(<BattleActions {...defaultProps} />)
    
    const grid = screen.getByTestId('attack-button').closest('.grid')
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3', 'gap-3')
  })

  it('チャンス表示のアニメーションクラスが適用される', () => {
    render(<BattleActions {...defaultProps} captureEnabled={true} />)
    
    const chanceSpan = screen.getByText('チャンス！')
    expect(chanceSpan).toHaveClass('animate-pulse')
  })

  it('captureEnabledがundefinedの場合falseとして扱われる', () => {
    const propsWithoutCaptureEnabled = {
      onAttack: mockOnAttack,
      onCapture: mockOnCapture,
      onRun: mockOnRun,
      disabled: false
    }
    
    render(<BattleActions {...propsWithoutCaptureEnabled} />)
    
    expect(screen.queryByText('チャンス！')).not.toBeInTheDocument()
    expect(screen.getByText('相手のHPを減らすと捕獲しやすくなります')).toBeInTheDocument()
  })
})