import { useState, useCallback } from 'react';

// 初学者向けメモ：
// メッセージの型定義
// id: 一意のID（削除時に使用）
// type: メッセージの種類
// message: 表示するメッセージ
export interface MessageItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

/**
 * メッセージ表示を管理するカスタムフック
 * 
 * @example
 * const { messages, showMessage, removeMessage, clearMessages } = useMessage();
 * 
 * // メッセージを表示
 * showMessage('success', 'プレイヤーを作成しました！');
 * showMessage('error', 'エラーが発生しました');
 * 
 * // コンポーネントで使用
 * <MessageList messages={messages} onRemove={removeMessage} />
 */
export const useMessage = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);

  // メッセージを削除
  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // メッセージを表示
  const showMessage = useCallback(
    (type: MessageItem['type'], message: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      
      setMessages(prev => [
        ...prev,
        { id, type, message },
      ]);

      // 5秒後に自動削除
      setTimeout(() => {
        removeMessage(id);
      }, 5000);
    },
    [removeMessage]
  );

  // すべてのメッセージをクリア
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // 便利メソッド
  const showSuccess = useCallback(
    (message: string) => showMessage('success', message),
    [showMessage]
  );

  const showError = useCallback(
    (message: string) => showMessage('error', message),
    [showMessage]
  );

  const showWarning = useCallback(
    (message: string) => showMessage('warning', message),
    [showMessage]
  );

  const showInfo = useCallback(
    (message: string) => showMessage('info', message),
    [showMessage]
  );

  return {
    messages,
    showMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeMessage,
    clearMessages,
  };
};

// 初学者向けメモ：
// 非同期処理のエラーハンドリングを含むメッセージ表示フック
interface AsyncMessageOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * 非同期処理と連携したメッセージ表示フック
 * 
 * @example
 * const { messages, executeWithMessage } = useAsyncMessage();
 * 
 * const handleSubmit = () => {
 *   executeWithMessage(
 *     async () => {
 *       const result = await api.createPlayer(name);
 *       return result;
 *     },
 *     {
 *       loadingMessage: 'プレイヤーを作成中...',
 *       successMessage: 'プレイヤーを作成しました！',
 *       errorMessage: 'プレイヤーの作成に失敗しました',
 *     }
 *   );
 * };
 */
export const useAsyncMessage = () => {
  const {
    messages,
    showMessage,
    showSuccess,
    showError,
    showInfo,
    removeMessage,
    clearMessages,
  } = useMessage();

  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);

  // 非同期処理をメッセージ付きで実行
  const executeWithMessage = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      options: AsyncMessageOptions = {}
    ): Promise<T | null> => {
      const {
        loadingMessage = '処理中...',
        successMessage = '完了しました',
        errorMessage = 'エラーが発生しました',
      } = options;

      // ローディングメッセージを表示
      const id = `loading-${Date.now()}`;
      setLoadingMessageId(id);
      showInfo(loadingMessage);

      try {
        // 非同期処理を実行
        const result = await asyncFn();

        // ローディングメッセージIDをクリア
        setLoadingMessageId(null);

        // 成功メッセージを表示
        showSuccess(successMessage);

        return result;
      } catch (error) {
        // ローディングメッセージIDをクリア
        setLoadingMessageId(null);

        // エラーメッセージを表示
        const message = error instanceof Error
          ? `${errorMessage}: ${error.message}`
          : errorMessage;
        showError(message);

        console.error('非同期処理エラー:', error);
        return null;
      }
    },
    [showSuccess, showError, showInfo]
  );

  return {
    messages,
    showMessage,
    showSuccess,
    showError,
    showInfo,
    removeMessage,
    clearMessages,
    executeWithMessage,
    isLoading: loadingMessageId !== null,
  };
};