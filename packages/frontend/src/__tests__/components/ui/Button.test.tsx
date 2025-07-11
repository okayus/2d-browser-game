/**
 * Buttonコンポーネントのテスト
 * 全てのプロパティとバリエーションを網羅的にテスト
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test-utils'
import { Button } from '../../../components/ui/Button'

describe('Button コンポーネント', () => {
  describe('基本的なレンダリング', () => {
    it('子要素のテキストを表示する', () => {
      // 実行
      render(<Button>テストボタン</Button>)

      // 検証
      expect(screen.getByRole('button', { name: 'テストボタン' })).toBeInTheDocument()
    })

    it('button要素として正しくレンダリングされる', () => {
      // 実行
      render(<Button>ボタン</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button.tagName).toBe('BUTTON')
    })

    it('デフォルトでprimaryバリアントとmdサイズが適用される', () => {
      // 実行
      render(<Button>デフォルトボタン</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-blue-600') // primary variant
      expect(button).toHaveClass('px-4', 'py-3', 'text-base') // md size
    })
  })

  describe('バリアント（variant）プロパティ', () => {
    it('primaryバリアントのスタイルが適用される', () => {
      // 実行
      render(<Button variant="primary">Primary</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white')
    })

    it('secondaryバリアントのスタイルが適用される', () => {
      // 実行
      render(<Button variant="secondary">Secondary</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-500', 'hover:bg-gray-600', 'text-white')
    })

    it('successバリアントのスタイルが適用される', () => {
      // 実行
      render(<Button variant="success">Success</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-green-600', 'hover:bg-green-700', 'text-white')
    })

    it('dangerバリアントのスタイルが適用される', () => {
      // 実行
      render(<Button variant="danger">Danger</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-600', 'hover:bg-red-700', 'text-white')
    })

    it('ghostバリアントのスタイルが適用される', () => {
      // 実行
      render(<Button variant="ghost">Ghost</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent', 'hover:bg-gray-100', 'text-gray-700', 'border', 'border-gray-300')
    })
  })

  describe('サイズ（size）プロパティ', () => {
    it('smサイズのスタイルが適用される', () => {
      // 実行
      render(<Button size="sm">Small</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3', 'py-2', 'text-sm')
    })

    it('mdサイズのスタイルが適用される', () => {
      // 実行
      render(<Button size="md">Medium</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-3', 'text-base')
    })

    it('lgサイズのスタイルが適用される', () => {
      // 実行
      render(<Button size="lg">Large</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-6', 'py-4', 'text-lg')
    })
  })

  describe('ローディング状態（isLoading）', () => {
    it('ローディング中はスピナーが表示される', () => {
      // 実行
      render(<Button isLoading>Loading</Button>)

      // 検証
      const spinner = screen.getByRole('button').querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('ローディング中はボタンが無効化される', () => {
      // 実行
      render(<Button isLoading>Loading</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })

    it('ローディング中はアイコンが非表示になる', () => {
      // 実行
      render(
        <Button isLoading icon={<span data-testid="icon">📧</span>}>
          Loading
        </Button>
      )

      // 検証
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
    })

    it('ローディング中でなければスピナーは表示されない', () => {
      // 実行
      render(<Button isLoading={false}>Normal</Button>)

      // 検証
      const spinner = screen.getByRole('button').querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })
  })

  describe('アイコン（icon）プロパティ', () => {
    it('アイコンが正しく表示される', () => {
      // 実行
      render(
        <Button icon={<span data-testid="icon">🎮</span>}>
          ゲーム開始
        </Button>
      )

      // 検証
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByTestId('icon')).toHaveTextContent('🎮')
    })

    it('アイコンとテキストが両方表示される', () => {
      // 実行
      render(
        <Button icon={<span data-testid="icon">⚙️</span>}>
          設定
        </Button>
      )

      // 検証
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('設定')).toBeInTheDocument()
    })

    it('アイコンなしでも正常に動作する', () => {
      // 実行
      render(<Button>アイコンなし</Button>)

      // 検証
      expect(screen.getByText('アイコンなし')).toBeInTheDocument()
      // アイコン用のspanが存在しないことを確認
      const button = screen.getByRole('button')
      const iconSpan = button.querySelector('span[class*="mr-2"]:not(:last-child)')
      expect(iconSpan).not.toBeInTheDocument()
    })
  })

  describe('無効化（disabled）状態', () => {
    it('disabledプロパティでボタンが無効化される', () => {
      // 実行
      render(<Button disabled>無効ボタン</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })

    it('無効化されたボタンはクリックできない', () => {
      // 準備
      const handleClick = vi.fn()

      // 実行
      render(<Button disabled onClick={handleClick}>無効ボタン</Button>)
      const button = screen.getByRole('button')
      fireEvent.click(button)

      // 検証
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('ローディング中も無効化される', () => {
      // 実行
      render(<Button isLoading>ローディング中</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('イベントハンドリング', () => {
    it('クリックイベントが正しく発火する', () => {
      // 準備
      const handleClick = vi.fn()

      // 実行
      render(<Button onClick={handleClick}>クリック</Button>)
      const button = screen.getByRole('button')
      fireEvent.click(button)

      // 検証
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('複数回クリックで複数回イベントが発火する', () => {
      // 準備
      const handleClick = vi.fn()

      // 実行
      render(<Button onClick={handleClick}>複数クリック</Button>)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      // 検証
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('onMouseOverイベントが正しく動作する', () => {
      // 準備
      const handleMouseOver = vi.fn()

      // 実行
      render(<Button onMouseOver={handleMouseOver}>ホバー</Button>)
      const button = screen.getByRole('button')
      fireEvent.mouseOver(button)

      // 検証
      expect(handleMouseOver).toHaveBeenCalledTimes(1)
    })

    it('onFocusイベントが正しく動作する', () => {
      // 準備
      const handleFocus = vi.fn()

      // 実行
      render(<Button onFocus={handleFocus}>フォーカス</Button>)
      const button = screen.getByRole('button')
      fireEvent.focus(button)

      // 検証
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })
  })

  describe('カスタムクラス（className）', () => {
    it('カスタムクラスが追加される', () => {
      // 実行
      render(<Button className="custom-class">カスタム</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('デフォルトクラスとカスタムクラスが両方適用される', () => {
      // 実行
      render(<Button className="text-purple-500">カスタム色</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('inline-flex') // デフォルトクラス
      expect(button).toHaveClass('text-purple-500') // カスタムクラス
    })
  })

  describe('HTMLの属性継承', () => {
    it('type属性が正しく設定される', () => {
      // 実行
      render(<Button type="submit">送信</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('form属性が正しく設定される', () => {
      // 実行
      render(<Button form="test-form">フォーム送信</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('form', 'test-form')
    })

    it('aria-label属性が正しく設定される', () => {
      // 実行
      render(<Button aria-label="閉じる">×</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', '閉じる')
    })

    it('data属性が正しく設定される', () => {
      // 実行
      render(<Button data-testid="custom-button">データ</Button>)

      // 検証
      const button = screen.getByTestId('custom-button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('フォーカスリング', () => {
    it('primaryバリアントは青いフォーカスリングを持つ', () => {
      // 実行
      render(<Button variant="primary">Primary</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:ring-blue-500')
    })

    it('dangerバリアントは赤いフォーカスリングを持つ', () => {
      // 実行
      render(<Button variant="danger">Danger</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:ring-red-500')
    })

    it('successバリアントは緑のフォーカスリングを持つ', () => {
      // 実行
      render(<Button variant="success">Success</Button>)

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:ring-green-500')
    })
  })

  describe('複合条件のテスト', () => {
    it('大きなサイズのdangerボタンが正しくレンダリングされる', () => {
      // 実行
      render(
        <Button variant="danger" size="lg" className="w-full">
          削除実行
        </Button>
      )

      // 検証
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-600') // danger variant
      expect(button).toHaveClass('px-6', 'py-4', 'text-lg') // lg size
      expect(button).toHaveClass('w-full') // custom class
    })

    it('アイコン付きローディング状態のボタン', () => {
      // 実行
      render(
        <Button 
          isLoading 
          icon={<span data-testid="icon">💾</span>}
          variant="success"
        >
          保存中...
        </Button>
      )

      // 検証
      const button = screen.getByRole('button')
      expect(button).toBeDisabled() // loading disabled
      expect(button).toHaveClass('bg-green-600') // success variant
      expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument() // spinner
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument() // icon hidden
    })

    it('小サイズの無効化されたghostボタン', () => {
      // 実行
      render(
        <Button variant="ghost" size="sm" disabled>
          無効
        </Button>
      )

      // 検証
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('bg-transparent') // ghost variant
      expect(button).toHaveClass('px-3', 'py-2', 'text-sm') // sm size
      expect(button).toHaveClass('disabled:opacity-50')
    })
  })
})