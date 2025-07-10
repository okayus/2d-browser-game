/**
 * Cardコンポーネントのテスト
 * Card、CardHeader、CardContent、CardFooterを網羅的にテスト
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test-utils'
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui/Card'

describe('Card コンポーネント', () => {
  describe('基本的なレンダリング', () => {
    it('子要素が正しく表示される', () => {
      // 実行
      render(
        <Card>
          <div>カードの内容</div>
        </Card>
      )

      // 検証
      expect(screen.getByText('カードの内容')).toBeInTheDocument()
    })

    it('div要素として正しくレンダリングされる', () => {
      // 実行
      render(<Card>カード</Card>)

      // 検証
      const card = screen.getByText('カード').parentElement
      expect(card?.tagName).toBe('DIV')
    })

    it('基本的なスタイルが適用される', () => {
      // 実行
      render(<Card data-testid="test-card">テストカード</Card>)

      // 検証
      const card = screen.getByTestId('test-card')
      expect(card).toHaveClass(
        'bg-white',
        'rounded-lg',
        'shadow-md',
        'border',
        'border-gray-200'
      )
    })
  })

  describe('ホバー効果（hover）プロパティ', () => {
    it('hover=trueの場合はホバーエフェクトが適用される', () => {
      // 実行
      render(<Card hover data-testid="hover-card">ホバーカード</Card>)

      // 検証
      const card = screen.getByTestId('hover-card')
      expect(card).toHaveClass(
        'transition-all',
        'duration-300',
        'hover:shadow-lg',
        'hover:-translate-y-1'
      )
    })

    it('hover=falseの場合はホバーエフェクトが適用されない', () => {
      // 実行
      render(<Card hover={false} data-testid="normal-card">通常カード</Card>)

      // 検証
      const card = screen.getByTestId('normal-card')
      expect(card).not.toHaveClass('hover:shadow-lg', 'hover:-translate-y-1')
    })

    it('hoverが指定されない場合はデフォルトでfalse', () => {
      // 実行
      render(<Card data-testid="default-card">デフォルトカード</Card>)

      // 検証
      const card = screen.getByTestId('default-card')
      expect(card).not.toHaveClass('hover:shadow-lg', 'hover:-translate-y-1')
    })
  })

  describe('クリック可能（clickable）プロパティ', () => {
    it('clickable=trueの場合はクリック可能なスタイルが適用される', () => {
      // 実行
      render(<Card clickable data-testid="clickable-card">クリック可能</Card>)

      // 検証
      const card = screen.getByTestId('clickable-card')
      expect(card).toHaveClass(
        'cursor-pointer',
        'transition-all',
        'duration-200',
        'hover:shadow-lg',
        'active:transform',
        'active:scale-95'
      )
    })

    it('clickable=falseの場合はクリック可能なスタイルが適用されない', () => {
      // 実行
      render(<Card clickable={false} data-testid="non-clickable-card">クリック不可</Card>)

      // 検証
      const card = screen.getByTestId('non-clickable-card')
      expect(card).not.toHaveClass('cursor-pointer', 'active:scale-95')
    })

    it('clickableが指定されない場合はデフォルトでfalse', () => {
      // 実行
      render(<Card data-testid="default-clickable-card">デフォルト</Card>)

      // 検証
      const card = screen.getByTestId('default-clickable-card')
      expect(card).not.toHaveClass('cursor-pointer')
    })
  })

  describe('クリックイベント（onClick）', () => {
    it('onClickイベントが正しく発火する', () => {
      // 準備
      const handleClick = vi.fn()

      // 実行
      render(<Card onClick={handleClick} data-testid="click-test-card">クリックテスト</Card>)
      const card = screen.getByTestId('click-test-card')
      fireEvent.click(card)

      // 検証
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('複数回クリックで複数回イベントが発火する', () => {
      // 準備
      const handleClick = vi.fn()

      // 実行
      render(<Card onClick={handleClick} data-testid="multi-click-card">複数クリック</Card>)
      const card = screen.getByTestId('multi-click-card')
      fireEvent.click(card)
      fireEvent.click(card)
      fireEvent.click(card)

      // 検証
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('onClickが指定されていない場合はエラーが発生しない', () => {
      // 実行 & 検証（エラーが発生しないことを確認）
      render(<Card data-testid="no-click-card">onClickなし</Card>)
      const card = screen.getByTestId('no-click-card')
      
      expect(() => {
        fireEvent.click(card)
      }).not.toThrow()
    })
  })

  describe('カスタムクラス（className）', () => {
    it('カスタムクラスが追加される', () => {
      // 実行
      render(<Card className="custom-card-class" data-testid="custom-class-card">カスタム</Card>)

      // 検証
      const card = screen.getByTestId('custom-class-card')
      expect(card).toHaveClass('custom-card-class')
    })

    it('デフォルトクラスとカスタムクラスが共存する', () => {
      // 実行
      render(<Card className="border-blue-500" data-testid="custom-border-card">カスタムボーダー</Card>)

      // 検証
      const card = screen.getByTestId('custom-border-card')
      expect(card).toHaveClass('bg-white') // デフォルト
      expect(card).toHaveClass('border-blue-500') // カスタム
    })
  })

  describe('複合条件のテスト', () => {
    it('ホバーとクリック可能の両方が有効な場合', () => {
      // 準備
      const handleClick = vi.fn()

      // 実行
      render(
        <Card hover clickable onClick={handleClick} className="test-card" data-testid="full-feature-card">
          フル機能カード
        </Card>
      )

      // 検証
      const card = screen.getByTestId('full-feature-card')
      
      // スタイル確認
      expect(card).toHaveClass('hover:shadow-lg') // hover effect
      expect(card).toHaveClass('cursor-pointer') // clickable
      expect(card).toHaveClass('test-card') // custom class
      
      // クリック動作確認
      fireEvent.click(card)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})

describe('CardHeader コンポーネント', () => {
  describe('基本的なレンダリング', () => {
    it('子要素が正しく表示される', () => {
      // 実行
      render(
        <CardHeader>
          <h2>カードタイトル</h2>
        </CardHeader>
      )

      // 検証
      expect(screen.getByRole('heading', { name: 'カードタイトル' })).toBeInTheDocument()
    })

    it('基本的なスタイルが適用される', () => {
      // 実行
      render(<CardHeader data-testid="header-basic">ヘッダー</CardHeader>)

      // 検証
      const header = screen.getByTestId('header-basic')
      expect(header).toHaveClass(
        'px-6',
        'py-4',
        'border-b',
        'border-gray-200'
      )
    })
  })

  describe('カスタムクラス', () => {
    it('カスタムクラスが正しく適用される', () => {
      // 実行
      render(<CardHeader className="bg-blue-100" data-testid="header-custom">カスタムヘッダー</CardHeader>)

      // 検証
      const header = screen.getByTestId('header-custom')
      expect(header).toHaveClass('bg-blue-100')
      expect(header).toHaveClass('px-6', 'py-4') // デフォルトクラスも保持
    })
  })
})

describe('CardContent コンポーネント', () => {
  describe('基本的なレンダリング', () => {
    it('子要素が正しく表示される', () => {
      // 実行
      render(
        <CardContent>
          <p>カードの内容です</p>
        </CardContent>
      )

      // 検証
      expect(screen.getByText('カードの内容です')).toBeInTheDocument()
    })

    it('基本的なスタイルが適用される', () => {
      // 実行
      render(<CardContent data-testid="content-basic">コンテンツ</CardContent>)

      // 検証
      const content = screen.getByTestId('content-basic')
      expect(content).toHaveClass('px-6', 'py-4')
    })
  })

  describe('カスタムクラス', () => {
    it('カスタムクラスが正しく適用される', () => {
      // 実行
      render(<CardContent className="text-center" data-testid="content-custom">中央寄せ</CardContent>)

      // 検証
      const content = screen.getByTestId('content-custom')
      expect(content).toHaveClass('text-center')
      expect(content).toHaveClass('px-6', 'py-4') // デフォルトクラスも保持
    })
  })
})

describe('CardFooter コンポーネント', () => {
  describe('基本的なレンダリング', () => {
    it('子要素が正しく表示される', () => {
      // 実行
      render(
        <CardFooter>
          <button>アクション</button>
        </CardFooter>
      )

      // 検証
      expect(screen.getByRole('button', { name: 'アクション' })).toBeInTheDocument()
    })

    it('基本的なスタイルが適用される', () => {
      // 実行
      render(<CardFooter data-testid="footer-basic">フッター</CardFooter>)

      // 検証
      const footer = screen.getByTestId('footer-basic')
      expect(footer).toHaveClass(
        'px-6',
        'py-4',
        'bg-gray-50',
        'rounded-b-lg',
        'border-t',
        'border-gray-200'
      )
    })
  })

  describe('カスタムクラス', () => {
    it('カスタムクラスが正しく適用される', () => {
      // 実行
      render(<CardFooter className="bg-blue-50" data-testid="footer-custom">カスタムフッター</CardFooter>)

      // 検証
      const footer = screen.getByTestId('footer-custom')
      expect(footer).toHaveClass('bg-blue-50')
      expect(footer).toHaveClass('px-6', 'py-4', 'rounded-b-lg') // デフォルトクラスも保持
    })
  })
})

describe('Card組み合わせテスト', () => {
  it('完全なCardコンポーネントが正しく動作する', () => {
    // 準備
    const handleClick = vi.fn()

    // 実行
    render(
      <Card hover clickable onClick={handleClick} className="test-complete-card" data-testid="complete-card">
        <CardHeader className="bg-blue-50" data-testid="complete-header">
          <h2>モンスター情報</h2>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="complete-content">
          <p>モンスターの詳細情報がここに表示されます。</p>
          <div>HP: 100/100</div>
        </CardContent>
        <CardFooter className="flex justify-between" data-testid="complete-footer">
          <button>編集</button>
          <button>削除</button>
        </CardFooter>
      </Card>
    )

    // 検証
    expect(screen.getByRole('heading', { name: 'モンスター情報' })).toBeInTheDocument()
    expect(screen.getByText('モンスターの詳細情報がここに表示されます。')).toBeInTheDocument()
    expect(screen.getByText('HP: 100/100')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()

    // カスタムクラスの確認
    const header = screen.getByTestId('complete-header')
    const content = screen.getByTestId('complete-content')
    const footer = screen.getByTestId('complete-footer')

    expect(header).toHaveClass('bg-blue-50')
    expect(content).toHaveClass('space-y-4')
    expect(footer).toHaveClass('flex', 'justify-between')

    // カード全体のクリック動作確認
    const card = screen.getByTestId('complete-card')
    fireEvent.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('部分的なCard（Headerのみ）でも正常に動作する', () => {
    // 実行
    render(
      <Card>
        <CardHeader>
          <h3>ヘッダーのみ</h3>
        </CardHeader>
      </Card>
    )

    // 検証
    expect(screen.getByRole('heading', { name: 'ヘッダーのみ' })).toBeInTheDocument()
  })

  it('部分的なCard（Contentのみ）でも正常に動作する', () => {
    // 実行
    render(
      <Card>
        <CardContent>
          <div>コンテンツのみ</div>
        </CardContent>
      </Card>
    )

    // 検証
    expect(screen.getByText('コンテンツのみ')).toBeInTheDocument()
  })

  it('部分的なCard（Footerのみ）でも正常に動作する', () => {
    // 実行
    render(
      <Card>
        <CardFooter>
          <span>フッターのみ</span>
        </CardFooter>
      </Card>
    )

    // 検証
    expect(screen.getByText('フッターのみ')).toBeInTheDocument()
  })
})