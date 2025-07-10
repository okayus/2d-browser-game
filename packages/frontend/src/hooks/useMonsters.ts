/**
 * モンスター管理のカスタムフック
 * 初学者向け: D1データベースとの連携でモンスターCRUD操作を管理
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { monsterAPI } from '@/api/client';
import { useLocalStorage } from './useLocalStorage';
import type { Monster } from '@monster-game/shared';

// モンスターフックの戻り値型
export interface UseMonstersResult {
  // プレイヤーの所持モンスター一覧
  monsters: Monster[];
  // 選択中のモンスター
  selectedMonster: Monster | null;
  // ローディング状態
  loading: boolean;
  // エラー情報
  error: string | null;
  // 最後に更新した時刻
  lastUpdated: Date | null;
  // モンスター一覧を取得
  fetchMonsters: (playerId: string) => Promise<Monster[]>;
  // モンスターのニックネーム更新
  updateNickname: (monsterId: string, nickname: string) => Promise<boolean>;
  // モンスターを逃がす
  releaseMonster: (monsterId: string) => Promise<boolean>;
  // バトル実行
  battle: (playerId: string, action: 'attack' | 'capture') => Promise<unknown>;
  // 選択モンスターを設定
  selectMonster: (monster: Monster | null) => void;
  // データをリフレッシュ
  refresh: (playerId: string) => Promise<void>;
  // 状態をリセット
  reset: () => void;
}

/**
 * モンスター管理カスタムフック
 * 
 * 初学者向けメモ：
 * - D1データベースとAPI連携でモンスターCRUD操作
 * - 選択モンスターはsessionStorageに保存（一時的な状態）
 * - モンスターデータはAPIから取得（リアルタイム同期）
 * 
 * @example
 * const { monsters, selectedMonster, fetchMonsters, updateNickname, loading } = useMonsters();
 * 
 * // プレイヤーのモンスター一覧取得
 * useEffect(() => {
 *   if (playerId) {
 *     fetchMonsters(playerId);
 *   }
 * }, [playerId, fetchMonsters]);
 */
export const useMonsters = (): UseMonstersResult => {
  // モンスター一覧
  const [monsters, setMonsters] = useState<Monster[]>([]);
  
  // API呼び出しの状態管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // 選択中のモンスターをsessionStorageに保存
  // 初学者向けメモ: ページリロード時に復元するが、ブラウザ終了時には削除される
  const [selectedMonster, setSelectedMonsterState] = useLocalStorage<Monster | null>('selected-monster', null);

  // モンスター一覧取得
  const fetchMonsters = useCallback(async (playerId: string): Promise<Monster[]> => {
    if (!playerId) {
      setError('プレイヤーIDが必要です');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // API呼び出してモンスター一覧取得
      const response = await monsterAPI.listByPlayer(playerId);
      
      if (response && response.データ && response.データ.monsters) {
        const fetchedMonsters = response.データ.monsters;
        
        setMonsters(fetchedMonsters);
        setLastUpdated(new Date());
        
        // 選択中のモンスターが削除されている場合はクリア
        if (selectedMonster && !fetchedMonsters.find((m: any) => m.id === selectedMonster.id)) {
          setSelectedMonsterState(null);
        }
        
        return fetchedMonsters;
      }
      
      throw new Error('モンスター一覧の取得に失敗しました');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'モンスター取得中にエラーが発生しました';
      setError(errorMessage);
      console.error('モンスター取得エラー:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [selectedMonster, setSelectedMonsterState]);

  // モンスターのニックネーム更新
  const updateNickname = useCallback(async (monsterId: string, nickname: string): Promise<boolean> => {
    if (!monsterId || !nickname.trim()) {
      setError('モンスターIDとニックネームが必要です');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // API呼び出してニックネーム更新
      const response = await monsterAPI.updateNickname(monsterId, nickname.trim());
      
      if (response && response.成功) {
        // ローカル状態を更新
        setMonsters(prevMonsters => 
          prevMonsters.map(monster => 
            monster.id === monsterId 
              ? { ...monster, ニックネーム: nickname.trim() }
              : monster
          )
        );
        
        // 選択中のモンスターも更新
        if (selectedMonster && selectedMonster.id === monsterId) {
          setSelectedMonsterState({
            ...selectedMonster,
            ニックネーム: nickname.trim()
          });
        }
        
        setLastUpdated(new Date());
        return true;
      }
      
      throw new Error('ニックネームの更新に失敗しました');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ニックネーム更新中にエラーが発生しました';
      setError(errorMessage);
      console.error('ニックネーム更新エラー:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedMonster, setSelectedMonsterState]);

  // モンスターを逃がす
  const releaseMonster = useCallback(async (monsterId: string): Promise<boolean> => {
    if (!monsterId) {
      setError('モンスターIDが必要です');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // API呼び出してモンスターを削除
      const response = await monsterAPI.release(monsterId);
      
      if (response && response.成功) {
        // ローカル状態から削除
        setMonsters(prevMonsters => 
          prevMonsters.filter(monster => monster.id !== monsterId)
        );
        
        // 選択中のモンスターが削除対象の場合はクリア
        if (selectedMonster && selectedMonster.id === monsterId) {
          setSelectedMonsterState(null);
        }
        
        setLastUpdated(new Date());
        return true;
      }
      
      throw new Error('モンスターの解放に失敗しました');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'モンスター解放中にエラーが発生しました';
      setError(errorMessage);
      console.error('モンスター解放エラー:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedMonster, setSelectedMonsterState]);

  // バトル実行
  const battle = useCallback(async (playerId: string, action: 'attack' | 'capture'): Promise<unknown> => {
    if (!playerId) {
      setError('プレイヤーIDが必要です');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // API呼び出してバトル実行
      const response = await monsterAPI.battle(playerId, action);
      
      if (response && response.成功) {
        // バトル後はモンスター一覧を再取得
        await fetchMonsters(playerId);
        
        return response.データ;
      }
      
      throw new Error('バトル実行に失敗しました');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'バトル中にエラーが発生しました';
      setError(errorMessage);
      console.error('バトルエラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchMonsters]);

  // 選択モンスターを設定
  const selectMonster = useCallback((monster: Monster | null) => {
    setSelectedMonsterState(monster);
  }, [setSelectedMonsterState]);

  // データをリフレッシュ
  const refresh = useCallback(async (playerId: string): Promise<void> => {
    await fetchMonsters(playerId);
  }, [fetchMonsters]);

  // 状態をリセット
  const reset = useCallback(() => {
    setMonsters([]);
    setSelectedMonsterState(null);
    setError(null);
    setLoading(false);
    setLastUpdated(null);
  }, [setSelectedMonsterState]);

  // 計算値（メモ化）
  const monsterCount = useMemo(() => monsters.length, [monsters]);
  const hasSelectedMonster = useMemo(() => selectedMonster !== null, [selectedMonster]);

  return {
    monsters,
    selectedMonster,
    loading,
    error,
    lastUpdated,
    fetchMonsters,
    updateNickname,
    releaseMonster,
    battle,
    selectMonster,
    refresh,
    reset,
    // 追加のヘルパー値
    monsterCount,
    hasSelectedMonster,
  } as UseMonstersResult & {
    monsterCount: number;
    hasSelectedMonster: boolean;
  };
};

/**
 * 初学者向けメモ：モンスターデータの管理戦略
 * 
 * 🗄️ **D1データベース（バックエンド）**
 * - モンスターの基本情報（id, 種族, HP, ニックネーム等）
 * - プレイヤーとの紐付け情報
 * - 永続的なデータ保存
 * 
 * 💾 **sessionStorage（フロントエンド）**
 * - 選択中のモンスター情報
 * - ページリロード時のみ復元
 * - ブラウザ終了時にクリア
 * 
 * 🔄 **データフロー**
 * 1. API呼び出し: プレイヤーIDでモンスター一覧取得
 * 2. 状態更新: React state にモンスター一覧を設定
 * 3. 操作実行: ニックネーム変更、解放等のCRUD操作
 * 4. 楽観的更新: ローカル状態を即座に更新
 * 5. 同期確認: 必要に応じてサーバーから再取得
 * 
 * 📝 **使用例**
 * ```typescript
 * function MonsterList({ playerId }: { playerId: string }) {
 *   const { 
 *     monsters, 
 *     selectedMonster, 
 *     fetchMonsters, 
 *     updateNickname,
 *     selectMonster,
 *     loading, 
 *     error 
 *   } = useMonsters();
 *   
 *   useEffect(() => {
 *     fetchMonsters(playerId);
 *   }, [playerId, fetchMonsters]);
 *   
 *   if (loading) return <Loading />;
 *   if (error) return <Error message={error} />;
 *   
 *   return (
 *     <div>
 *       {monsters.map(monster => (
 *         <MonsterCard 
 *           key={monster.id}
 *           monster={monster}
 *           isSelected={selectedMonster?.id === monster.id}
 *           onSelect={() => selectMonster(monster)}
 *           onUpdateNickname={(nickname) => updateNickname(monster.id, nickname)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */