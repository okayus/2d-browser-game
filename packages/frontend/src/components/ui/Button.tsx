/**
 * 再利用可能なButtonコンポーネント
 * 様々なバリエーションに対応
 */
import React from 'react'
import { cn } from '../../lib/utils'

/**
 * ボタンのスタイルバリアント定義
 */
type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'default' | 'outline'

/**
 * ボタンのサイズバリアント定義
 */
type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Buttonコンポーネントのプロパティ
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンのスタイルバリアント */
  variant?: ButtonVariant
  /** ボタンのサイズ */
  size?: ButtonSize
  /** ローディング状態 */
  isLoading?: boolean
  /** アイコン要素 */
  icon?: React.ReactNode
  /** 子要素 */
  children: React.ReactNode
  /** 追加のCSSクラス */
  className?: string
}

/**
 * バリアント別のスタイル定義
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white shadow-md hover:shadow-lg',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300',
  default: 'bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-sm hover:shadow-md',
  outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400'
}

/**
 * サイズ別のスタイル定義
 */
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-lg'
}

/**
 * 再利用可能なButtonコンポーネント
 * プロトタイプのボタンスタイルをReactコンポーネント化
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  // ボタンが無効化される条件
  const isDisabled = disabled || isLoading

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        // ベーススタイル
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        
        // バリアント別スタイル
        variantStyles[variant],
        
        // サイズ別スタイル
        sizeStyles[size],
        
        // フォーカス時のリングカラー
        variant === 'primary' && 'focus:ring-blue-500',
        variant === 'secondary' && 'focus:ring-gray-500',
        variant === 'success' && 'focus:ring-green-500',
        variant === 'danger' && 'focus:ring-red-500',
        variant === 'ghost' && 'focus:ring-gray-500',
        variant === 'default' && 'focus:ring-gray-400',
        variant === 'outline' && 'focus:ring-gray-500',
        
        // ホバー効果（無効化時は除外）
        !isDisabled && 'hover:transform hover:-translate-y-0.5',
        
        // カスタムクラス
        className
      )}
    >
      {/* ローディングスピナー */}
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {/* アイコン（ローディング中でない場合のみ表示） */}
      {!isLoading && icon && (
        <span className="mr-2">{icon}</span>
      )}
      
      {/* ボタンテキスト */}
      <span>{children}</span>
    </button>
  )
}