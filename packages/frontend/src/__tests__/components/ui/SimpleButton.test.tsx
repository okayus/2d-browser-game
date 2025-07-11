/**
 * 簡単なButtonコンポーネントのテスト
 * 最小限のテストケース
 */
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../../../components/ui/Button'

describe('Button 基本テスト', () => {
  it('ボタンが正しくレンダリングされる', () => {
    render(<Button>テストボタン</Button>)
    expect(screen.getByRole('button', { name: 'テストボタン' })).toBeInTheDocument()
  })

  it('primaryバリアントのスタイルが適用される', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600')
  })

  it('mdサイズのスタイルが適用される', () => {
    render(<Button size="md">Medium</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-4', 'py-3', 'text-base')
  })

  it('ローディング中はボタンが無効化される', () => {
    render(<Button isLoading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})