import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// 初学者向けメモ：
// Cardコンポーネントのプロパティ型定義
// isSelectable: 選択可能なカードかどうか
// isSelected: 選択されているかどうか
// onClick: クリック時の処理
interface CardProps {
  isSelectable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * カード型UIコンポーネント
 * 
 * @example
 * <Card isSelectable isSelected={selected} onClick={handleSelect}>
 *   <h3>カードタイトル</h3>
 *   <p>カードの内容</p>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  isSelectable = false,
  isSelected = false,
  onClick,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        // 基本スタイル
        'bg-white rounded-lg shadow-md p-6 transition-all duration-300',
        // 選択可能な場合のスタイル
        isSelectable && [
          'cursor-pointer',
          'hover:shadow-lg hover:scale-[1.02]',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
        ],
        // 選択されている場合のスタイル
        isSelected && [
          'ring-2 ring-blue-500',
          'bg-blue-50',
          'shadow-lg scale-[1.02]',
        ],
        // カスタムクラス
        className
      )}
      onClick={isSelectable ? onClick : undefined}
      role={isSelectable ? 'button' : undefined}
      tabIndex={isSelectable ? 0 : undefined}
      onKeyDown={
        isSelectable
          ? (e) => {
              // Enter または Space キーでクリック
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {/* 選択されている場合のチェックマーク */}
      {isSelectable && isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">✓</span>
        </div>
      )}
      {children}
    </div>
  );
};

// 初学者向けメモ：
// CardHeader, CardBody, CardFooter は Card の中で使うサブコンポーネント
// これらを組み合わせることで、統一感のあるカードUIを作れる

interface CardSectionProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * カードヘッダーコンポーネント
 */
export const CardHeader: React.FC<CardSectionProps> = ({ className, children }) => {
  return (
    <div className={cn('mb-4 pb-4 border-b border-gray-200', className)}>
      {children}
    </div>
  );
};

/**
 * カードボディコンポーネント
 */
export const CardBody: React.FC<CardSectionProps> = ({ className, children }) => {
  return <div className={cn('mb-4', className)}>{children}</div>;
};

/**
 * カードフッターコンポーネント
 */
export const CardFooter: React.FC<CardSectionProps> = ({ className, children }) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  );
};