/**
 * ゲームカードコンポーネント
 * 
 * 初学者向けメモ:
 * - shadcn/uiのトラブルを避けて独自実装
 * - TDD で実装されたコンポーネント
 * - Compound Component パターンで柔軟な構成を実現
 * - interactive variant でクリック可能なカードを作成
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * ゲームカードのバリアント定義
 * 
 * 初学者向けメモ:
 * - variant: カードの種類（見た目のパターン）
 * - padding: カード内の余白サイズ
 * - selected: 選択状態の視覚表現
 */
const ゲームカードVariants = cva(
  // ベースクラス（全てのカードに適用される共通スタイル）
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        outlined: "border-2 border-border",
        elevated: "shadow-lg",
        interactive: "cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1",
      },
      padding: {
        sm: "p-3",
        md: "p-4", 
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

/**
 * ゲームカードのプロパティ型定義
 * 
 * 初学者向けメモ:
 * - React.HTMLAttributes から標準的なHTML属性を継承
 * - VariantProps で cva のバリアント型を取得
 * - selected: 選択状態の制御
 * - onClick: クリック時の処理（interactive variant時のみ有効）
 */
export interface ゲームカードProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ゲームカードVariants> {
  /** 選択状態の制御 */
  selected?: boolean;
  /** クリック時の処理 */
  onClick?: () => void;
}

/**
 * メインのゲームカードコンポーネント
 */
export const ゲームカード = ({
  className,
  variant,
  padding,
  selected,
  onClick,
  children,
  ...props
}: ゲームカードProps) => {
  const isInteractive = variant === 'interactive' && onClick;
  
  return (
    <div
      className={cn(
        ゲームカードVariants({ variant, padding }),
        selected && "ring-2 ring-primary ring-offset-2",
        className
      )}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * カードヘッダーコンポーネント
 */
const ゲームカードHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
);

/**
 * カードコンテンツコンポーネント
 */
const ゲームカードContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("p-6 pt-0", className)}
    {...props}
  />
);

/**
 * カードアクションエリアコンポーネント
 */
const ゲームカードActions = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
);

// Compound Component パターンの実装
ゲームカード.Header = ゲームカードHeader;
ゲームカード.Content = ゲームカードContent;
ゲームカード.Actions = ゲームカードActions;