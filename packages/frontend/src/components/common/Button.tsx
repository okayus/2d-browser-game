import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// 初学者向けメモ：
// Buttonコンポーネントのプロパティ型定義
// variant: ボタンの見た目の種類
// size: ボタンのサイズ
// isLoading: ローディング状態
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 汎用ボタンコンポーネント
 * 
 * @example
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   ゲーム開始
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  // バリアント別のスタイル定義
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  // サイズ別のスタイル定義
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        // 基本スタイル
        'font-medium rounded-lg transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // ホバー時のスケールアニメーション
        'hover:scale-[1.02] active:scale-[0.98]',
        // バリアントとサイズのスタイル
        variantStyles[variant],
        sizeStyles[size],
        // フォーカス時のリングカラー
        variant === 'primary' && 'focus:ring-blue-500',
        variant === 'secondary' && 'focus:ring-gray-500',
        variant === 'danger' && 'focus:ring-red-500',
        variant === 'ghost' && 'focus:ring-gray-400',
        // カスタムクラス
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className="inline-flex items-center justify-center space-x-2">
        {isLoading ? (
          <>
            {/* ローディングスピナー */}
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            <span>処理中...</span>
          </>
        ) : (
          <>
            {icon && <span>{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </span>
    </button>
  );
};