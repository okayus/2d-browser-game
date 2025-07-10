import { useState, useCallback, useEffect } from 'react';
import type { Monster, Player } from '@monster-game/shared';

// 初学者向けメモ：
// ゲームの状態を表す型定義
// gamePhase: ゲームの現在のフェーズ（開始画面、プレイヤー作成中、プレイ中など）
export type GamePhase = 'start' | 'playerCreation' | 'playing' | 'battle';

export interface GameState {
  player: Player | null;
  selectedMonster: Monster | null;
  ownedMonsters: Monster[];
  playerPosition: { x: number; y: number };
  gamePhase: GamePhase;
}

// ローカルストレージのキー
const STORAGE_KEYS = {
  PLAYER: 'player',
  SELECTED_MONSTER: 'selected_monster',
  OWNED_MONSTERS: 'owned_monsters',
  PLAYER_POSITION: 'player_position',
  GAME_PHASE: 'game_phase',
} as const;

// デフォルトの位置
const DEFAULT_POSITION = { x: 5, y: 4 };

/**
 * ゲーム状態を管理するカスタムフック
 * 
 * @example
 * const { gameState, updatePlayer, selectMonster } = useGameState();
 */
export const useGameState = () => {
  // 初期状態をローカルストレージから復元
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState: Partial<GameState> = {};

    // プレイヤー情報を復元
    const savedPlayer = localStorage.getItem(STORAGE_KEYS.PLAYER);
    if (savedPlayer) {
      try {
        savedState.player = JSON.parse(savedPlayer);
      } catch (e) {
        console.error('プレイヤー情報の復元に失敗:', e);
      }
    }

    // 選択されたモンスターを復元
    const savedSelectedMonster = localStorage.getItem(STORAGE_KEYS.SELECTED_MONSTER);
    if (savedSelectedMonster) {
      try {
        savedState.selectedMonster = JSON.parse(savedSelectedMonster);
      } catch (e) {
        console.error('選択モンスター情報の復元に失敗:', e);
      }
    }

    // 所持モンスターを復元
    const savedOwnedMonsters = localStorage.getItem(STORAGE_KEYS.OWNED_MONSTERS);
    if (savedOwnedMonsters) {
      try {
        savedState.ownedMonsters = JSON.parse(savedOwnedMonsters);
      } catch (e) {
        console.error('所持モンスター情報の復元に失敗:', e);
      }
    }

    // プレイヤー位置を復元
    const savedPosition = localStorage.getItem(STORAGE_KEYS.PLAYER_POSITION);
    if (savedPosition) {
      try {
        savedState.playerPosition = JSON.parse(savedPosition);
      } catch (e) {
        console.error('プレイヤー位置の復元に失敗:', e);
      }
    }

    // ゲームフェーズを復元
    const savedPhase = localStorage.getItem(STORAGE_KEYS.GAME_PHASE);
    if (savedPhase) {
      savedState.gamePhase = savedPhase as GamePhase;
    }

    return {
      player: savedState.player || null,
      selectedMonster: savedState.selectedMonster || null,
      ownedMonsters: savedState.ownedMonsters || [],
      playerPosition: savedState.playerPosition || DEFAULT_POSITION,
      gamePhase: savedState.gamePhase || 'start',
    };
  });

  // 状態が変更されたらローカルストレージに保存
  useEffect(() => {
    if (gameState.player) {
      localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(gameState.player));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PLAYER);
    }

    if (gameState.selectedMonster) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_MONSTER, JSON.stringify(gameState.selectedMonster));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_MONSTER);
    }

    if (gameState.ownedMonsters.length > 0) {
      localStorage.setItem(STORAGE_KEYS.OWNED_MONSTERS, JSON.stringify(gameState.ownedMonsters));
    } else {
      localStorage.removeItem(STORAGE_KEYS.OWNED_MONSTERS);
    }

    localStorage.setItem(STORAGE_KEYS.PLAYER_POSITION, JSON.stringify(gameState.playerPosition));
    localStorage.setItem(STORAGE_KEYS.GAME_PHASE, gameState.gamePhase);
  }, [gameState]);

  // プレイヤー情報を更新
  const updatePlayer = useCallback((player: Player | null) => {
    setGameState(prev => ({ ...prev, player }));
  }, []);

  // モンスターを選択
  const selectMonster = useCallback((monster: Monster | null) => {
    setGameState(prev => ({ ...prev, selectedMonster: monster }));
  }, []);

  // 所持モンスターを追加
  const addOwnedMonster = useCallback((monster: Monster) => {
    setGameState(prev => ({
      ...prev,
      ownedMonsters: [...prev.ownedMonsters, monster],
    }));
  }, []);

  // 所持モンスターを削除
  const removeOwnedMonster = useCallback((monsterId: string) => {
    setGameState(prev => ({
      ...prev,
      ownedMonsters: prev.ownedMonsters.filter(m => m.id !== monsterId),
    }));
  }, []);

  // 所持モンスターを更新
  const updateOwnedMonster = useCallback((monsterId: string, updates: Partial<Monster>) => {
    setGameState(prev => ({
      ...prev,
      ownedMonsters: prev.ownedMonsters.map(m =>
        m.id === monsterId ? { ...m, ...updates } : m
      ),
    }));
  }, []);

  // プレイヤー位置を更新
  const updatePlayerPosition = useCallback((x: number, y: number) => {
    setGameState(prev => ({
      ...prev,
      playerPosition: { x, y },
    }));
  }, []);

  // ゲームフェーズを更新
  const updateGamePhase = useCallback((phase: GamePhase) => {
    setGameState(prev => ({ ...prev, gamePhase: phase }));
  }, []);

  // ゲーム状態をリセット
  const resetGameState = useCallback(() => {
    // ローカルストレージをクリア
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    // 状態を初期値に戻す
    setGameState({
      player: null,
      selectedMonster: null,
      ownedMonsters: [],
      playerPosition: DEFAULT_POSITION,
      gamePhase: 'start',
    });
  }, []);

  return {
    gameState,
    updatePlayer,
    selectMonster,
    addOwnedMonster,
    removeOwnedMonster,
    updateOwnedMonster,
    updatePlayerPosition,
    updateGamePhase,
    resetGameState,
  };
};