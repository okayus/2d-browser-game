/**
 * 再利用可能なCardコンポーネント
 * 情報をまとめて表示するためのコンテナ
 */
import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Cardコンポーネントのプロパティ
 */
interface CardProps {
  /** カードの子要素 */
  children: React.ReactNode
  /** 追加のCSSクラス */
  className?: string
  /** ホバー効果を有効にするか */
  hover?: boolean
  /** クリック可能かどうか */
  clickable?: boolean
  /** クリックハンドラー */
  onClick?: () => void
}

/**
 * カードのヘッダー部分
 */
interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

/**
 * カードのコンテンツ部分
 */
interface CardContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * カードのフッター部分
 */
interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

/**
 * メインのCardコンポーネント
 * プロトタイプのカードスタイルをReactコンポーネント化
 */
export function Card({
  children,
  className,
  hover = false,
  clickable = false,
  onClick,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      onClick={onClick}
      className={cn(
        // ベーススタイル
        'bg-white rounded-lg shadow-md border border-gray-200',
        
        // ホバー効果
        hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        
        // クリック可能な場合のスタイル
        clickable && 'cursor-pointer transition-all duration-200 hover:shadow-lg active:transform active:scale-95',
        
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * カードヘッダーコンポーネント
 * タイトルやアクションボタンを配置
 */
export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
      {children}
    </div>
  )
}

/**
 * カードコンテンツコンポーネント
 * メインの内容を配置
 */
export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}

/**
 * カードフッターコンポーネント
 * アクションボタンや補足情報を配置
 */
export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200', className)}>
      {children}
    </div>
  )
}