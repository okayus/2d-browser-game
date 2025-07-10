/**
 * 再利用可能なInputコンポーネント
 * フォーム入力のための共通コンポーネント
 */
import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Inputコンポーネントのプロパティ
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** ラベルテキスト */
  label?: string
  /** エラーメッセージ */
  error?: string
  /** ヘルプテキスト */
  help?: string
  /** 追加のCSSクラス */
  className?: string
  /** コンテナの追加CSSクラス */
  containerClassName?: string
}

/**
 * 再利用可能なInputコンポーネント
 * プロトタイプのフォームスタイルをReactコンポーネント化
 */
export function Input({
  label,
  error,
  help,
  className,
  containerClassName,
  id,
  ...props
}: InputProps) {
  // idが提供されていない場合は、labelから生成
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {/* ラベル */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-gray-700"
        >
          {label}
        </label>
      )}
      
      {/* 入力フィールド */}
      <input
        {...props}
        id={inputId}
        className={cn(
          // ベーススタイル
          'w-full px-4 py-3 border rounded-lg text-base',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          
          // エラー状態のスタイル
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
          
          // ホバー効果
          !props.disabled && 'hover:border-gray-400',
          
          className
        )}
      />
      
      {/* ヘルプテキスト */}
      {help && !error && (
        <p className="text-sm text-gray-500">
          {help}
        </p>
      )}
      
      {/* エラーメッセージ */}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      
      {/* 文字数カウンター（maxLengthが設定されている場合） */}
      {props.maxLength && (
        <div className="flex justify-end">
          <span className={cn(
            'text-xs',
            (props.value as string)?.length > props.maxLength * 0.9
              ? 'text-orange-500'
              : 'text-gray-400'
          )}>
            {(props.value as string)?.length || 0} / {props.maxLength}文字
          </span>
        </div>
      )}
    </div>
  )
}