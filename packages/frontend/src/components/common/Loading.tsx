import React from 'react';
import { cn } from '@/lib/utils';

// 初学者向けメモ：
// ローディング表示のプロパティ型定義
// size: ローディングアイコンのサイズ
// text: 表示するテキスト
// fullScreen: 全画面表示するかどうか
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * ローディング表示コンポーネント
 * 
 * @example
 * // 通常のローディング
 * <Loading text="データを読み込んでいます..." />
 * 
 * // 全画面ローディング
 * <Loading fullScreen text="ゲームを開始しています..." />
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  className,
}) => {
  // サイズ別のスタイル
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinnerElement = (
    <div
      className={cn(
        'animate-spin rounded-full border-4 border-gray-300',
        'border-t-blue-600',
        sizeStyles[size]
      )}
      role="status"
      aria-label="読み込み中"
    />
  );

  // 全画面表示の場合
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        <div className="text-center">
          {spinnerElement}
          {text && (
            <p className="mt-4 text-gray-700 font-medium animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 通常表示
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        className
      )}
    >
      {spinnerElement}
      {text && (
        <p className="mt-3 text-gray-600 text-sm animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// 初学者向けメモ：
// スケルトンローディングコンポーネント
// コンテンツが読み込まれるまでの間、プレースホルダーとして表示
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}

/**
 * スケルトンローディングコンポーネント
 * コンテンツの形に合わせたローディング表示
 * 
 * @example
 * // テキストのスケルトン
 * <Skeleton variant="text" width="200px" />
 * 
 * // カードのスケルトン
 * <Skeleton variant="rectangular" width="100%" height="200px" />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = true,
}) => {
  const variantStyles = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  // デフォルトの高さ
  const defaultHeights = {
    text: 'h-4',
    rectangular: 'h-32',
    circular: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'bg-gray-200',
        variantStyles[variant],
        !height && defaultHeights[variant],
        animation && 'animate-pulse',
        className
      )}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
      aria-hidden="true"
    />
  );
};

// 初学者向けメモ：
// リストアイテムのスケルトンローディング
// 複数のアイテムを読み込む際に使用
interface SkeletonListProps {
  count?: number;
  className?: string;
}

/**
 * リストスケルトンコンポーネント
 * 
 * @example
 * <SkeletonList count={5} />
 */
export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};