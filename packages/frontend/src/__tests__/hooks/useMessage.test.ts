/**
 * useMessageカスタムフックのテスト
 * 初学者向け: 状態管理とタイマー処理を含むフックのテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMessage, useAsyncMessage } from '@/hooks/useMessage';

// 初学者向けメモ：
// タイマー処理をテストするためにvi.useFakeTimers()を使用
describe('useMessage カスタムフック', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 初学者向けメモ：
  // 初期状態のテスト
  it('初期状態では空の配列を返す', () => {
    const { result } = renderHook(() => useMessage());
    
    expect(result.current.messages).toEqual([]);
  });

  // 初学者向けメモ：
  // メッセージ追加のテスト
  it('メッセージが正しく追加される', () => {
    const { result } = renderHook(() => useMessage());
    
    act(() => {
      result.current.showMessage('success', 'テストメッセージ');
    });
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      type: 'success',
      message: 'テストメッセージ',
    });
    expect(result.current.messages[0].id).toBeDefined();
  });

  // 初学者向けメモ：
  // 複数メッセージの追加テスト
  it('複数のメッセージが追加できる', () => {
    const { result } = renderHook(() => useMessage());
    
    act(() => {
      result.current.showMessage('success', 'メッセージ1');
      result.current.showMessage('error', 'メッセージ2');
      result.current.showMessage('warning', 'メッセージ3');
    });
    
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[0].message).toBe('メッセージ1');
    expect(result.current.messages[1].message).toBe('メッセージ2');
    expect(result.current.messages[2].message).toBe('メッセージ3');
  });

  // 初学者向めメモ：
  // 便利メソッドのテスト
  it('showSuccess関数が正しく動作する', () => {
    const { result } = renderHook(() => useMessage());
    
    act(() => {
      result.current.showSuccess('成功メッセージ');
    });
    
    expect(result.current.messages[0]).toMatchObject({
      type: 'success',
      message: '成功メッセージ',
    });
  });

  it('showError関数が正しく動作する', () => {
    const { result } = renderHook(() => useMessage());
    
    act(() => {
      result.current.showError('エラーメッセージ');
    });
    
    expect(result.current.messages[0]).toMatchObject({
      type: 'error',
      message: 'エラーメッセージ',
    });
  });

  it('showWarning関数が正しく動作する', () => {
    const { result } = renderHook(() => useMessage());
    
    act(() => {
      result.current.showWarning('警告メッセージ');
    });
    
    expect(result.current.messages[0]).toMatchObject({
      type: 'warning',
      message: '警告メッセージ',
    });
  });

  it('showInfo関数が正しく動作する', () => {
    const { result } = renderHook(() => useMessage());
    
    act(() => {
      result.current.showInfo('情報メッセージ');
    });
    
    expect(result.current.messages[0]).toMatchObject({
      type: 'info',
      message: '情報メッセージ',
    });
  });

  // 初学者向けメモ：
  // メッセージ削除のテスト
  it('removeMessage関数で特定のメッセージが削除される', () => {
    const { result } = renderHook(() => useMessage());
    
    // 複数のメッセージを追加
    act(() => {
      result.current.showMessage('success', 'メッセージ1');
      result.current.showMessage('error', 'メッセージ2');
    });
    
    const messageId = result.current.messages[0].id;
    
    // 特定のメッセージを削除
    act(() => {
      result.current.removeMessage(messageId);
    });
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].message).toBe('メッセージ2');
  });

  // 初学者向けメモ：
  // 全メッセージクリアのテスト
  it('clearMessages関数で全メッセージがクリアされる', () => {
    const { result } = renderHook(() => useMessage());
    
    // 複数のメッセージを追加
    act(() => {
      result.current.showMessage('success', 'メッセージ1');
      result.current.showMessage('error', 'メッセージ2');
      result.current.showMessage('warning', 'メッセージ3');
    });
    
    expect(result.current.messages).toHaveLength(3);
    
    // 全メッセージをクリア
    act(() => {
      result.current.clearMessages();
    });
    
    expect(result.current.messages).toHaveLength(0);
  });

  // 初学者向けメモ：
  // 自動削除のテスト（5秒後）
  it('メッセージが5秒後に自動削除される', () => {
    const { result } = renderHook(() => useMessage());
    
    act(() => {
      result.current.showMessage('success', 'テストメッセージ');
    });
    
    expect(result.current.messages).toHaveLength(1);
    
    // 5秒経過をシミュレート
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(result.current.messages).toHaveLength(0);
  });

  // 初学者向けメモ：
  // 複数メッセージの個別自動削除テスト
  it('複数メッセージがそれぞれ5秒後に自動削除される', () => {
    const { result } = renderHook(() => useMessage());
    
    // 1つ目のメッセージを追加
    act(() => {
      result.current.showMessage('success', 'メッセージ1');
    });
    
    // 2秒後に2つ目のメッセージを追加
    act(() => {
      vi.advanceTimersByTime(2000);
      result.current.showMessage('error', 'メッセージ2');
    });
    
    expect(result.current.messages).toHaveLength(2);
    
    // さらに3秒経過（1つ目は合計5秒経過）
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // 1つ目だけが削除される
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].message).toBe('メッセージ2');
    
    // さらに2秒経過（2つ目も合計5秒経過）
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // 2つ目も削除される
    expect(result.current.messages).toHaveLength(0);
  });
});

describe('useAsyncMessage カスタムフック', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 初学者向けメモ：
  // 成功時の非同期処理テスト
  it('非同期処理成功時に適切なメッセージが表示される', async () => {
    const { result } = renderHook(() => useAsyncMessage());
    
    const mockAsyncFunction = vi.fn().mockResolvedValue('成功データ');
    
    // 非同期処理を実行
    let resultValue: any;
    await act(async () => {
      resultValue = await result.current.executeWithMessage(
        mockAsyncFunction,
        {
          loadingMessage: '処理中...',
          successMessage: '処理が完了しました',
          errorMessage: '処理に失敗しました',
        }
      );
    });
    
    // 関数が呼ばれたことを確認
    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
    
    // 正しい値が返されることを確認
    expect(resultValue).toBe('成功データ');
    
    // 成功メッセージが表示されることを確認
    const successMessage = result.current.messages.find(
      msg => msg.message === '処理が完了しました'
    );
    expect(successMessage).toBeDefined();
    expect(successMessage?.type).toBe('success');
  });

  // 初学者向けメモ：
  // エラー時の非同期処理テスト
  it('非同期処理エラー時に適切なメッセージが表示される', async () => {
    const { result } = renderHook(() => useAsyncMessage());
    
    const mockAsyncFunction = vi.fn().mockRejectedValue(new Error('テストエラー'));
    
    // 非同期処理を実行
    let resultValue: any;
    await act(async () => {
      resultValue = await result.current.executeWithMessage(
        mockAsyncFunction,
        {
          loadingMessage: '処理中...',
          successMessage: '処理が完了しました',
          errorMessage: '処理に失敗しました',
        }
      );
    });
    
    // 関数が呼ばれたことを確認
    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
    
    // nullが返されることを確認
    expect(resultValue).toBe(null);
    
    // エラーメッセージが表示されることを確認
    const errorMessage = result.current.messages.find(
      msg => msg.message.includes('処理に失敗しました')
    );
    expect(errorMessage).toBeDefined();
    expect(errorMessage?.type).toBe('error');
  });

  // 初学者向けメモ：
  // ローディング状態のテスト
  it('非同期処理中はローディング状態になる', async () => {
    const { result } = renderHook(() => useAsyncMessage());
    
    let resolvePromise: (value: string) => void;
    const mockAsyncFunction = vi.fn().mockImplementation(
      () => new Promise<string>(resolve => {
        resolvePromise = resolve;
      })
    );
    
    // 非同期処理を開始（awaitしない）
    let promiseResult: Promise<any>;
    act(() => {
      promiseResult = result.current.executeWithMessage(mockAsyncFunction);
    });
    
    // ローディング状態であることを確認
    expect(result.current.isLoading).toBe(true);
    
    // Promise を解決
    await act(async () => {
      resolvePromise!('完了');
      await promiseResult;
    });
    
    // ローディング状態が終了することを確認
    expect(result.current.isLoading).toBe(false);
  });

  // 初学者向けメモ：
  // ゲームAPIの実際の使用例テスト
  it('プレイヤー作成APIの実際の使用例', async () => {
    const { result } = renderHook(() => useAsyncMessage());
    
    const mockCreatePlayer = vi.fn().mockResolvedValue({
      id: 'player123',
      name: 'テストプレイヤー',
    });
    
    // useAsyncMessageが正しく初期化されていることを確認
    expect(result.current).toBeDefined();
    expect(result.current.executeWithMessage).toBeDefined();
    
    await act(async () => {
      await result.current.executeWithMessage(
        () => mockCreatePlayer('テストプレイヤー'),
        {
          loadingMessage: 'プレイヤーを作成中...',
          successMessage: 'プレイヤーを作成しました！',
          errorMessage: 'プレイヤーの作成に失敗しました',
        }
      );
    });
    
    // API関数が正しい引数で呼ばれることを確認
    expect(mockCreatePlayer).toHaveBeenCalledWith('テストプレイヤー');
    
    // 成功メッセージが表示されることを確認
    const successMessage = result.current.messages.find(
      msg => msg.message === 'プレイヤーを作成しました！'
    );
    expect(successMessage?.type).toBe('success');
  });
});