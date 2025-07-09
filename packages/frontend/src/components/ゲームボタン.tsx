/**
 * ゲームボタンコンポーネント
 * 
 * 初学者向けメモ:
 * - shadcn/ui の Button コンポーネントをベースにゲーム用にカスタマイズ
 * - TDD で実装されたコンポーネント（テストファーストで開発）
 * - TypeScript の厳密型定義でプロパティを制限
 * - アクセシビリティ機能も含まれている
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * ゲームボタンのバリアント定義
 * 
 * 初学者向けメモ:
 * - cva (Class Variance Authority) でスタイルバリアントを定義
 * - variant: ボタンの種類（デザインパターン）
 * - size: ボタンのサイズ
 */
const ゲームボタンVariants = cva(
  // ベースクラス（全てのボタンに適用される共通スタイル）
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // ゲーム専用バリアント
        primary: "bg-game-primary text-white hover:bg-game-primary/90 shadow-lg",
        success: "bg-game-success text-white hover:bg-game-success/90",
        warning: "bg-game-warning text-white hover:bg-game-warning/90",
        error: "bg-game-error text-white hover:bg-game-error/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * ゲームボタンのプロパティ型定義
 * 
 * 初学者向けメモ:
 * - React.ButtonHTMLAttributes から標準的なボタン属性を継承
 * - VariantProps で cva のバリアント型を取得
 * - loading プロパティでローディング状態を制御
 */
export interface ゲームボタンProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ゲームボタンVariants> {
  /** ローディング状態の制御 */
  loading?: boolean;
  /** アクセシビリティ用のラベル */
  'aria-label'?: string;
}

/**
 * ゲームボタンコンポーネント
 * 
 * @param variant - ボタンの種類（デザインパターン）
 * @param size - ボタンのサイズ
 * @param loading - ローディング状態
 * @param disabled - 無効状態
 * @param children - ボタン内のコンテンツ
 * @param className - 追加のCSSクラス
 * @param onClick - クリック時の処理
 * @param props - その他のボタン属性
 */
export const ゲームボタン = React.forwardRef<HTMLButtonElement, ゲームボタンProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(ゲームボタンVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {loading ? '読み込み中...' : children}
      </button>
    );
  }
);

ゲームボタン.displayName = "ゲームボタン";