/**
 * Inputコンポーネントのテスト
 * 全てのプロパティと状態を網羅的にテスト
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test-utils'
import { Input } from '../../../components/ui/Input'

describe('Input コンポーネント', () => {
  describe('基本的なレンダリング', () => {
    it('input要素が正しくレンダリングされる', () => {
      // 実行
      render(<Input />)

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })

    it('基本的なスタイルが適用される', () => {
      // 実行
      render(<Input />)

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass(
        'w-full',
        'px-4',
        'py-3',
        'border',
        'rounded-lg',
        'text-base',
        'transition-all',
        'duration-200'
      )
    })

    it('デフォルトでは通常のボーダー色が適用される', () => {
      // 実行
      render(<Input />)

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-200')
    })
  })

  describe('ラベル（label）プロパティ', () => {
    it('ラベルが正しく表示される', () => {
      // 実行
      render(<Input label="プレイヤー名" />)

      // 検証
      expect(screen.getByText('プレイヤー名')).toBeInTheDocument()
      expect(screen.getByLabelText('プレイヤー名')).toBeInTheDocument()
    })

    it('ラベルとinputが正しく関連付けられている', () => {
      // 実行
      render(<Input label="メールアドレス" />)

      // 検証
      const input = screen.getByLabelText('メールアドレス')
      const label = screen.getByText('メールアドレス')
      expect(input).toHaveAttribute('id', 'メールアドレス')
      expect(label).toHaveAttribute('for', 'メールアドレス')
    })

    it('カスタムidが提供された場合はそちらを使用', () => {
      // 実行
      render(<Input label="テストラベル" id="custom-id" />)

      // 検証
      const input = screen.getByLabelText('テストラベル')
      const label = screen.getByText('テストラベル')
      expect(input).toHaveAttribute('id', 'custom-id')
      expect(label).toHaveAttribute('for', 'custom-id')
    })

    it('複数単語のラベルはハイフンでつながったidになる', () => {
      // 実行
      render(<Input label="プレイヤー名 入力" />)

      // 検証
      const input = screen.getByLabelText('プレイヤー名 入力')
      expect(input).toHaveAttribute('id', 'プレイヤー名-入力')
    })

    it('ラベルがない場合はlabel要素が表示されない', () => {
      // 実行
      render(<Input placeholder="ラベルなし" />)

      // 検証
      expect(screen.queryByRole('label')).not.toBeInTheDocument()
    })
  })

  describe('エラー（error）プロパティ', () => {
    it('エラーメッセージが正しく表示される', () => {
      // 実行
      render(<Input error="プレイヤー名は必須です" />)

      // 検証
      expect(screen.getByText('プレイヤー名は必須です')).toBeInTheDocument()
    })

    it('エラー状態では赤いボーダーが適用される', () => {
      // 実行
      render(<Input error="エラーです" />)

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-300', 'focus:border-red-500', 'focus:ring-red-200')
    })

    it('エラーメッセージにアイコンが表示される', () => {
      // 実行
      render(<Input error="エラー" />)

      // 検証
      const errorElement = screen.getByText('エラー')
      const icon = errorElement.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('w-4', 'h-4', 'mr-1')
    })

    it('エラーがある場合はヘルプテキストが表示されない', () => {
      // 実行
      render(<Input error="エラー" help="ヘルプテキスト" />)

      // 検証
      expect(screen.getByText('エラー')).toBeInTheDocument()
      expect(screen.queryByText('ヘルプテキスト')).not.toBeInTheDocument()
    })

    it('エラーメッセージは赤いテキストで表示される', () => {
      // 実行
      render(<Input error="エラーメッセージ" />)

      // 検証
      const errorElement = screen.getByText('エラーメッセージ')
      expect(errorElement).toHaveClass('text-sm', 'text-red-600')
    })
  })

  describe('ヘルプ（help）プロパティ', () => {
    it('ヘルプテキストが正しく表示される', () => {
      // 実行
      render(<Input help="3文字以上で入力してください" />)

      // 検証
      expect(screen.getByText('3文字以上で入力してください')).toBeInTheDocument()
    })

    it('ヘルプテキストは灰色で表示される', () => {
      // 実行
      render(<Input help="ヘルプテキスト" />)

      // 検証
      const helpElement = screen.getByText('ヘルプテキスト')
      expect(helpElement).toHaveClass('text-sm', 'text-gray-500')
    })

    it('エラーがない場合のみヘルプテキストが表示される', () => {
      // 実行
      render(<Input help="ヘルプテキスト" />)

      // 検証
      expect(screen.getByText('ヘルプテキスト')).toBeInTheDocument()
    })
  })

  describe('値の入力と変更', () => {
    it('入力値が正しく反映される', () => {
      // 実行
      render(<Input value="テスト値" readOnly />)

      // 検証
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('テスト値')
    })

    it('onChange イベントが正しく発火する', () => {
      // 準備
      const handleChange = vi.fn()

      // 実行
      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '新しい値' } })

      // 検証
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: '新しい値'
          })
        })
      )
    })

    it('複数文字の入力で複数回イベントが発火する', () => {
      // 準備
      const handleChange = vi.fn()

      // 実行
      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.change(input, { target: { value: 'ab' } })
      fireEvent.change(input, { target: { value: 'abc' } })

      // 検証
      expect(handleChange).toHaveBeenCalledTimes(3)
    })
  })

  describe('文字数制限（maxLength）', () => {
    it('maxLengthが設定されている場合は文字数カウンターが表示される', () => {
      // 実行
      render(<Input maxLength={20} value="テスト" readOnly />)

      // 検証: テキストが分割されているため、コンテナで検索
      const counter = screen.getByText(/\d+ \/ \d+文字/).closest('span')
      expect(counter?.textContent).toBe('3 / 20文字')
    })

    it('文字数が90%を超えるとオレンジ色になる', () => {
      // 実行: 20文字制限で19文字入力（95%、90%超過）
      const longValue = "a".repeat(19)
      render(<Input maxLength={20} value={longValue} readOnly />)

      // 検証
      const counter = screen.getByText(/\d+ \/ \d+文字/).closest('span')
      expect(counter?.textContent).toBe('19 / 20文字')
      expect(counter).toHaveClass('text-orange-500')
    })

    it('文字数が90%以下では灰色のまま', () => {
      // 実行: 20文字制限で10文字入力（50%）
      const mediumValue = "a".repeat(10)
      render(<Input maxLength={20} value={mediumValue} readOnly />)

      // 検証
      const counter = screen.getByText(/\d+ \/ \d+文字/).closest('span')
      expect(counter?.textContent).toBe('10 / 20文字')
      expect(counter).toHaveClass('text-gray-400')
    })

    it('値がない場合は0文字として表示される', () => {
      // 実行
      render(<Input maxLength={10} />)

      // 検証
      const counter = screen.getByText(/\d+ \/ \d+文字/).closest('span')
      expect(counter?.textContent).toBe('0 / 10文字')
    })

    it('maxLengthがない場合は文字数カウンターが表示されない', () => {
      // 実行
      render(<Input value="テスト" readOnly />)

      // 検証
      expect(screen.queryByText(/文字/)).not.toBeInTheDocument()
    })
  })

  describe('無効化（disabled）状態', () => {
    it('disabled時は適切なスタイルが適用される', () => {
      // 実行
      render(<Input disabled />)

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:bg-gray-50', 'disabled:text-gray-500', 'disabled:cursor-not-allowed')
    })

    it('disabled時はホバー効果が無効化される', () => {
      // 実行
      render(<Input disabled />)

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveClass('hover:border-gray-400')
    })

    it('disabled時も onChange イベントは発火する（HTMLの仕様）', () => {
      // 準備
      const handleChange = vi.fn()

      // 実行
      render(<Input disabled onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test' } })

      // 検証: HTMLのdisabled inputでもchangeイベントは発火する
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('フォーカスイベント', () => {
    it('onFocus イベントが正しく動作する', () => {
      // 準備
      const handleFocus = vi.fn()

      // 実行
      render(<Input onFocus={handleFocus} />)
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)

      // 検証
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('onBlur イベントが正しく動作する', () => {
      // 準備
      const handleBlur = vi.fn()

      // 実行
      render(<Input onBlur={handleBlur} />)
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      fireEvent.blur(input)

      // 検証
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('カスタムクラス', () => {
    it('className が正しく適用される', () => {
      // 実行
      render(<Input className="custom-input-class" />)

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-input-class')
    })

    it('containerClassName が正しく適用される', () => {
      // 実行
      render(<Input containerClassName="custom-container" label="テスト" />)

      // 検証
      const container = screen.getByText('テスト').closest('div')
      expect(container).toHaveClass('custom-container')
    })

    it('デフォルトクラスとカスタムクラスが共存する', () => {
      // 実行
      render(<Input className="text-purple-500" />)

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('w-full') // デフォルト
      expect(input).toHaveClass('text-purple-500') // カスタム
    })
  })

  describe('HTMLの属性継承', () => {
    it('placeholder が正しく設定される', () => {
      // 実行
      render(<Input placeholder="名前を入力してください" />)

      // 検証
      const input = screen.getByPlaceholderText('名前を入力してください')
      expect(input).toBeInTheDocument()
    })

    it('type属性が正しく設定される', () => {
      // 実行
      render(<Input type="email" />)

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('required属性が正しく設定される', () => {
      // 実行
      render(<Input required />)

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })

    it('pattern属性が正しく設定される', () => {
      // 実行
      render(<Input pattern="[0-9]*" />)

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('pattern', '[0-9]*')
    })
  })

  describe('複合条件のテスト', () => {
    it('ラベル、エラー、maxLength全てが設定された場合', () => {
      // 実行
      render(
        <Input
          label="プレイヤー名"
          error="名前が短すぎます"
          maxLength={20}
          value="ab"
          readOnly
        />
      )

      // 検証
      expect(screen.getByText('プレイヤー名')).toBeInTheDocument()
      expect(screen.getByText('名前が短すぎます')).toBeInTheDocument()
      const counter = screen.getByText(/\d+ \/ \d+文字/).closest('span')
      expect(counter?.textContent).toBe('2 / 20文字')
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-300') // エラー状態
    })

    it('ラベル、ヘルプ、maxLengthが設定された正常な状態', () => {
      // 実行
      render(
        <Input
          label="プレイヤー名"
          help="3文字以上で入力してください"
          maxLength={20}
          value="テストプレイヤー"
          readOnly
        />
      )

      // 検証
      expect(screen.getByText('プレイヤー名')).toBeInTheDocument()
      expect(screen.getByText('3文字以上で入力してください')).toBeInTheDocument()
      const counter = screen.getByText(/\d+ \/ \d+文字/).closest('span')
      expect(counter?.textContent).toBe('8 / 20文字')
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-gray-300') // 通常状態
    })

    it('無効化されたエラー状態のInput', () => {
      // 実行
      render(
        <Input
          label="無効フィールド"
          error="エラーメッセージ"
          disabled
          value="値"
        />
      )

      // 検証
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('border-red-300') // エラー状態
      expect(input).toHaveClass('disabled:bg-gray-50') // 無効状態
      expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
    })
  })
})