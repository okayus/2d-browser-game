import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

// 初学者向けメモ：
// モーダルコンポーネントのプロパティ型定義
// isOpen: モーダルが開いているかどうか
// onClose: モーダルを閉じる関数
// title: モーダルのタイトル
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

/**
 * モーダルダイアログコンポーネント
 * 
 * @example
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="確認"
 * >
 *   <p>本当に削除しますか？</p>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Escapeキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // モーダルが開いたときにフォーカスを設定
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // モーダルが開いていない場合は何も表示しない
  if (!isOpen) return null;

  // サイズ別のスタイル
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <>
      {/* オーバーレイ（背景） */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダル本体 */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div
          ref={modalRef}
          className={cn(
            'bg-white rounded-lg shadow-xl w-full animate-scale-in',
            'max-h-[90vh] overflow-hidden flex flex-col',
            sizeStyles[size],
            className
          )}
          tabIndex={-1}
        >
          {/* ヘッダー */}
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h2
                id="modal-title"
                className="text-xl font-bold text-gray-900"
              >
                {title}
              </h2>
            </div>
          )}

          {/* コンテンツ */}
          <div className="px-6 py-4 flex-1 overflow-y-auto">
            {children}
          </div>

          {/* 閉じるボタン（右上） */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

// 初学者向けメモ：
// 確認ダイアログ専用のコンポーネント
// はい/いいえの選択が必要な場合に使用
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

/**
 * 確認ダイアログコンポーネント
 * 
 * @example
 * <ConfirmModal
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="削除確認"
 *   message="このモンスターを逃がしますか？"
 *   confirmText="逃がす"
 *   confirmVariant="danger"
 * />
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'はい',
  cancelText = 'キャンセル',
  confirmVariant = 'primary',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <p className="text-gray-700 mb-6">{message}</p>
      
      <div className="flex justify-end space-x-3">
        <Button
          variant="ghost"
          onClick={onClose}
        >
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={handleConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};