import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

// 初学者向けメモ：
// メッセージの種類を定義
// success: 成功メッセージ（緑色）
// error: エラーメッセージ（赤色）
// warning: 警告メッセージ（黄色）
// info: 情報メッセージ（青色）
type MessageType = 'success' | 'error' | 'warning' | 'info';

interface MessageProps {
  type: MessageType;
  message: string;
  duration?: number; // ミリ秒単位、0で自動消去なし
  onClose?: () => void;
  className?: string;
}

/**
 * メッセージ表示コンポーネント
 * 
 * @example
 * <Message
 *   type="success"
 *   message="プレイヤーを作成しました！"
 *   duration={3000}
 *   onClose={() => setShowMessage(false)}
 * />
 */
export const Message: React.FC<MessageProps> = ({
  type,
  message,
  duration = 5000,
  onClose,
  className,
}) => {
  // 自動消去の処理
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      // クリーンアップ関数
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // タイプ別のスタイル定義
  const typeStyles = {
    success: {
      container: 'bg-green-100 border-green-400 text-green-700',
      icon: '✓',
      iconBg: 'bg-green-500',
    },
    error: {
      container: 'bg-red-100 border-red-400 text-red-700',
      icon: '✕',
      iconBg: 'bg-red-500',
    },
    warning: {
      container: 'bg-yellow-100 border-yellow-400 text-yellow-700',
      icon: '!',
      iconBg: 'bg-yellow-500',
    },
    info: {
      container: 'bg-blue-100 border-blue-400 text-blue-700',
      icon: 'i',
      iconBg: 'bg-blue-500',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={cn(
        // 基本スタイル
        'flex items-center px-4 py-3 rounded-lg border',
        'animate-fade-in transition-all duration-300',
        // タイプ別スタイル
        style.container,
        // カスタムクラス
        className
      )}
      role="alert"
    >
      {/* アイコン */}
      <div
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3',
          style.iconBg
        )}
      >
        {style.icon}
      </div>

      {/* メッセージ */}
      <div className="flex-1">{message}</div>

      {/* 閉じるボタン */}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="メッセージを閉じる"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// 初学者向けメモ：
// メッセージリストコンポーネント
// 複数のメッセージを管理して表示する
interface MessageListProps {
  messages: Array<{
    id: string;
    type: MessageType;
    message: string;
  }>;
  onRemove: (id: string) => void;
  className?: string;
}

/**
 * メッセージリストコンポーネント
 * 複数のメッセージを縦に並べて表示
 */
export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onRemove,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {messages.map((msg) => (
        <Message
          key={msg.id}
          type={msg.type}
          message={msg.message}
          onClose={() => onRemove(msg.id)}
        />
      ))}
    </div>
  );
};