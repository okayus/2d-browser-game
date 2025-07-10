/**
 * useLocalStorageカスタムフックのテスト
 * 初学者向け: カスタムフックのテスト方法を学ぶ
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage カスタムフック', () => {
  // 初学者向けメモ：
  // 各テストの前にlocalStorageをクリア
  beforeEach(() => {
    vi.clearAllMocks();
    // localStorageのgetItemをundefinedを返すように設定（デフォルト状態）
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  // 初学者向けメモ：
  // 基本的な読み取り・書き込みテスト
  it('初期値が正しく設定される', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'default-value')
    );
    
    const [value] = result.current;
    expect(value).toBe('default-value');
  });

  // 初学者向けメモ：
  // 値の更新テスト
  it('値が正しく更新される', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );
    
    // 初期値の確認
    expect(result.current[0]).toBe('initial');
    
    // 値を更新
    act(() => {
      result.current[1]('updated');
    });
    
    // 更新された値を確認
    expect(result.current[0]).toBe('updated');
  });

  // 初学者向けメモ：
  // localStorageへの保存確認
  it('localStorageに値が保存される', () => {
    const { result } = renderHook(() => 
      useLocalStorage('player-name', '')
    );
    
    // 値を設定
    act(() => {
      result.current[1]('テストプレイヤー');
    });
    
    // localStorageに保存されたことを確認
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'player-name', 
      JSON.stringify('テストプレイヤー')
    );
  });

  // 初学者向けメモ：
  // localStorageからの読み取り確認
  it('localStorageから値が読み取られる', () => {
    // 事前にlocalStorageに値を設定
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify('saved-value'));
    
    const { result } = renderHook(() => 
      useLocalStorage('existing-key', 'default')
    );
    
    // 保存された値が読み取られることを確認
    expect(result.current[0]).toBe('saved-value');
  });

  // 初学者向けメモ：
  // オブジェクトの保存・読み取りテスト
  it('オブジェクトが正しく保存・読み取りされる', () => {
    const playerData = {
      id: 'player123',
      name: 'テストプレイヤー',
      level: 5,
    };

    const { result } = renderHook(() => 
      useLocalStorage('player-data', null)
    );
    
    // オブジェクトを保存
    act(() => {
      result.current[1](playerData);
    });
    
    // オブジェクトが正しく保存・読み取りされることを確認
    expect(result.current[0]).toEqual(playerData);
  });

  // 初学者向けメモ：
  // 配列の保存・読み取りテスト
  it('配列が正しく保存・読み取りされる', () => {
    const monsterList = [
      { id: '1', name: 'でんきネズミ', hp: 100 },
      { id: '2', name: 'ひこうとり', hp: 85 },
    ];

    const { result } = renderHook(() => 
      useLocalStorage('monster-list', [])
    );
    
    // 配列を保存
    act(() => {
      result.current[1](monsterList);
    });
    
    // 配列が正しく保存・読み取りされることを確認
    expect(result.current[0]).toEqual(monsterList);
  });

  // 初学者向けメモ：
  // null値の処理テスト
  it('null値が正しく処理される', () => {
    const { result } = renderHook(() => 
      useLocalStorage('nullable-key', 'default')
    );
    
    // null値を設定
    act(() => {
      result.current[1](null);
    });
    
    // null値が正しく処理されることを確認
    expect(result.current[0]).toBe(null);
  });

  // 初学者向けメモ：
  // 値の削除テスト
  it('removeValue関数で値が削除される', () => {
    const { result } = renderHook(() => 
      useLocalStorage('removable-key', 'initial-value')
    );
    
    // 初期値が設定されていることを確認
    expect(result.current[0]).toBe('initial-value');
    
    // 値を削除
    act(() => {
      result.current[2](); // removeValue関数
    });
    
    // デフォルト値に戻ることを確認（削除されるとnullになる設計）
    expect(result.current[0]).toBe(null);
    
    // localStorageから削除されることを確認
    expect(localStorage.removeItem).toHaveBeenCalledWith('removable-key');
  });

  // 初学者向けメモ：
  // 関数による値更新のテスト
  it('関数を使った値更新が正しく動作する', () => {
    const { result } = renderHook(() => 
      useLocalStorage('counter', 0)
    );
    
    // 関数を使って値を更新
    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
    
    // 再度更新
    act(() => {
      result.current[1]((prev: number) => prev * 2);
    });
    
    expect(result.current[0]).toBe(2);
  });

  // 初学者向けメモ：
  // 無効なJSONの処理テスト
  it('無効なJSONが存在する場合はデフォルト値を使用する', () => {
    // 無効なJSONを手動でlocalStorageに設定
    vi.mocked(localStorage.getItem).mockReturnValue('invalid-json');
    
    const { result } = renderHook(() => 
      useLocalStorage('broken-key', 'fallback-value')
    );
    
    // デフォルト値が使用されることを確認
    expect(result.current[0]).toBe('fallback-value');
  });

  // 初学者向けメモ：
  // ゲームデータの実際の使用例テスト
  it('ゲームデータの保存・読み取りができる', () => {
    const gameState = {
      player: {
        id: 'player123',
        name: 'テストプレイヤー',
        position: { x: 5, y: 3 },
      },
      selectedMonster: {
        id: 'monster456',
        nickname: 'でんきちゃん',
        hp: 85,
        maxHp: 100,
      },
      phase: 'playing' as const,
    };

    const { result } = renderHook(() => 
      useLocalStorage('game-state', null)
    );
    
    // ゲームデータを保存
    act(() => {
      result.current[1](gameState);
    });
    
    // ゲームデータが正しく保存・読み取りされることを確認
    expect(result.current[0]).toEqual(gameState);
    
    // プレイヤー位置を更新
    act(() => {
      result.current[1]((prev: any) => ({
        ...prev,
        player: {
          ...prev.player,
          position: { x: 6, y: 3 },
        },
      }));
    });
    
    // 更新されたデータを確認
    expect(result.current[0].player.position).toEqual({ x: 6, y: 3 });
  });
});