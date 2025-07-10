/**
 * プレイヤー管理のカスタムフック
 * 初学者向け: D1データベースとの連携でプレイヤーデータを管理
 */

import { useState, useCallback, useEffect } from 'react';
import { playerAPI } from '@/api/client';
import { useLocalStorage } from './useLocalStorage';
import type { Player } from '@monster-game/shared';

// プレイヤーフックの戻り値型
export interface UsePlayerResult {
  // 現在のプレイヤー情報
  currentPlayer: Player | null;
  // ローディング状態
  loading: boolean;
  // エラー情報
  error: string | null;
  // プレイヤー作成
  createPlayer: (name: string) => Promise<Player | null>;
  // プレイヤー情報取得
  getPlayer: (playerId: string) => Promise<Player | null>;
  // プレイヤー一覧取得
  getPlayerList: () => Promise<Player[]>;
  // 現在のプレイヤーを設定
  setCurrentPlayer: (player: Player | null) => void;
  // ログアウト（現在のプレイヤーをクリア）
  logout: () => void;
  // プレイヤー状態をリセット
  reset: () => void;
}

/**
 * プレイヤー管理カスタムフック
 * 
 * 初学者向けメモ：
 * - D1データベースとAPI連携でプレイヤーデータを管理
 * - localStorage は最後に選択したプレイヤーIDのみ保存
 * - 実際のプレイヤーデータはAPIから取得
 * 
 * @example
 * const { currentPlayer, createPlayer, loading, error } = usePlayer();
 * 
 * // プレイヤー作成
 * const handleCreate = async () => {
 *   const player = await createPlayer('テストプレイヤー');
 *   if (player) {
 *     console.log('プレイヤー作成成功:', player);
 *   }
 * };
 */
export const usePlayer = (): UsePlayerResult => {
  // 現在のプレイヤー情報
  const [currentPlayer, setCurrentPlayerState] = useState<Player | null>(null);
  
  // API呼び出しの状態管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 最後に選択したプレイヤーIDをlocalStorageに保存
  // 初学者向けメモ: プレイヤーデータそのものではなく、IDのみを保存
  const [lastPlayerID, setLastPlayerID] = useLocalStorage<string | null>('last-player-id', null);

  // 初期化時に最後のプレイヤーを復元
  useEffect(() => {
    const initializePlayer = async () => {
      if (lastPlayerID) {
        await getPlayer(lastPlayerID);
      }
    };

    initializePlayer();
  }, [lastPlayerID]); // eslint-disable-line react-hooks/exhaustive-deps

  // プレイヤー作成
  const createPlayer = useCallback(async (name: string): Promise<Player | null> => {
    setLoading(true);
    setError(null);

    try {
      // API呼び出してプレイヤー作成
      const response = await playerAPI.create(name);
      
      if (response && response.プレイヤー) {
        const newPlayer = response.プレイヤー;
        
        // 作成したプレイヤーを現在のプレイヤーに設定
        setCurrentPlayerState(newPlayer);
        setLastPlayerID(newPlayer.id);
        
        return newPlayer;
      }
      
      throw new Error('プレイヤーの作成に失敗しました');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プレイヤー作成中にエラーが発生しました';
      setError(errorMessage);
      console.error('プレイヤー作成エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLastPlayerID]);

  // プレイヤー情報取得
  const getPlayer = useCallback(async (playerId: string): Promise<Player | null> => {
    setLoading(true);
    setError(null);

    try {
      // API呼び出してプレイヤー情報取得
      const response = await playerAPI.get(playerId);
      
      if (response && response.データ) {
        const player = response.データ;
        
        // 取得したプレイヤーを現在のプレイヤーに設定
        setCurrentPlayerState(player);
        setLastPlayerID(player.id);
        
        return player;
      }
      
      throw new Error('プレイヤー情報の取得に失敗しました');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プレイヤー情報取得中にエラーが発生しました';
      setError(errorMessage);
      console.error('プレイヤー取得エラー:', err);
      
      // プレイヤーが見つからない場合はlocalStorageもクリア
      if (err instanceof Error && err.message.includes('見つからない')) {
        setLastPlayerID(null);
        setCurrentPlayerState(null);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLastPlayerID]);

  // プレイヤー一覧取得
  const getPlayerList = useCallback(async (): Promise<Player[]> => {
    setLoading(true);
    setError(null);

    try {
      // API呼び出してプレイヤー一覧取得
      const response = await playerAPI.list();
      
      if (response && response.データ) {
        return response.データ;
      }
      
      throw new Error('プレイヤー一覧の取得に失敗しました');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プレイヤー一覧取得中にエラーが発生しました';
      setError(errorMessage);
      console.error('プレイヤー一覧取得エラー:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 現在のプレイヤーを設定
  const setCurrentPlayer = useCallback((player: Player | null) => {
    setCurrentPlayerState(player);
    if (player) {
      setLastPlayerID(player.id);
    } else {
      setLastPlayerID(null);
    }
  }, [setLastPlayerID]);

  // ログアウト
  const logout = useCallback(() => {
    setCurrentPlayerState(null);
    setLastPlayerID(null);
    setError(null);
  }, [setLastPlayerID]);

  // 状態リセット
  const reset = useCallback(() => {
    setCurrentPlayerState(null);
    setError(null);
    setLoading(false);
    // localStorageは保持（最後のプレイヤーIDは残す）
  }, []);

  return {
    currentPlayer,
    loading,
    error,
    createPlayer,
    getPlayer,
    getPlayerList,
    setCurrentPlayer,
    logout,
    reset,
  };
};

/**
 * 初学者向けメモ：データの永続化戦略
 * 
 * 🗄️ **D1データベース（バックエンド）**
 * - プレイヤーの基本情報（id, 名前, 作成日時）
 * - 永続的なデータ保存
 * - 複数デバイス間での同期
 * 
 * 💾 **localStorage（フロントエンド）**
 * - 最後に選択したプレイヤーIDのみ
 * - ページリロード時の復元用
 * - ユーザー体験の向上
 * 
 * 🔄 **状態フロー**
 * 1. ページロード時: localStorage からプレイヤーIDを読み取り
 * 2. API呼び出し: プレイヤーIDでサーバーからプレイヤー情報取得
 * 3. 状態更新: React state にプレイヤー情報を設定
 * 4. localStorage更新: 新しいプレイヤーIDを保存
 * 
 * 📝 **使用例**
 * ```typescript
 * function PlayerSelection() {
 *   const { currentPlayer, createPlayer, getPlayerList, loading, error } = usePlayer();
 *   
 *   if (loading) return <Loading />;
 *   if (error) return <Error message={error} />;
 *   
 *   return (
 *     <div>
 *       {currentPlayer ? (
 *         <PlayerInfo player={currentPlayer} />
 *       ) : (
 *         <PlayerCreationForm onSubmit={createPlayer} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */