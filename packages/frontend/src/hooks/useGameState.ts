/**
 * 統合ゲーム状態管理のカスタムフック
 * 初学者向け: D1データベース連携とセッション管理を統合
 * 
 * 以前のlocalStorage版から、API連携版にリファクタリング
 */

import { useCallback, useEffect, useMemo } from 'react';
import { usePlayer } from './usePlayer';
import { useMonsters } from './useMonsters';
import { useGameSession, type GamePhase } from './useGameSession';
import type { Monster, Player } from '@monster-game/shared';

// 統合ゲーム状態の型定義
export interface GameState {
  // プレイヤー情報（D1データベースから取得）
  player: Player | null;
  // 選択中のモンスター（sessionStorageで管理）
  selectedMonster: Monster | null;
  // 所持モンスター一覧（D1データベースから取得）
  ownedMonsters: Monster[];
  // プレイヤー位置（sessionStorageで管理）
  playerPosition: { x: number; y: number };
  // ゲームフェーズ（sessionStorageで管理）
  gamePhase: GamePhase;
}

// 統合フックの戻り値型
export interface UseGameStateResult {
  // 統合されたゲーム状態
  gameState: GameState;
  // ローディング状態
  loading: boolean;
  // エラー情報
  error: string | null;
  // プレイヤー操作
  createPlayer: (name: string) => Promise<boolean>;
  selectPlayer: (playerId: string) => Promise<boolean>;
  logout: () => void;
  // モンスター操作
  refreshMonsters: () => Promise<void>;
  updateMonsterNickname: (monsterId: string, nickname: string) => Promise<boolean>;
  releaseMonster: (monsterId: string) => Promise<boolean>;
  selectMonster: (monster: Monster | null) => void;
  // セッション操作
  setGamePhase: (phase: GamePhase) => void;
  movePlayer: (deltaX: number, deltaY: number) => void;
  setPlayerPosition: (position: { x: number; y: number }) => void;
  // ゲーム操作
  startBattle: (action: 'attack' | 'capture') => Promise<unknown>;
  // 状態リセット
  resetGame: () => void;
}

/**
 * 統合ゲーム状態管理カスタムフック
 * 
 * 初学者向けメモ：
 * - 複数の個別フックを組み合わせて統合的なゲーム状態を提供
 * - D1データベース: プレイヤー・モンスターの永続データ
 * - sessionStorage: 位置・フェーズの一時データ
 * - localStorage: 最後に選択したプレイヤーIDのみ
 * 
 * @example
 * const { gameState, createPlayer, selectMonster, movePlayer, loading } = useGameState();
 * 
 * // プレイヤー作成
 * const success = await createPlayer('新しいプレイヤー');
 * 
 * // モンスター選択
 * selectMonster(gameState.ownedMonsters[0]);
 * 
 * // プレイヤー移動
 * movePlayer(1, 0); // 右に1マス
 */
export const useGameState = (): UseGameStateResult => {
  // 個別フックの使用
  const playerHook = usePlayer();
  const monstersHook = useMonsters();
  const sessionHook = useGameSession();

  // 統合されたゲーム状態（計算値）
  const gameState = useMemo<GameState>(() => ({
    player: playerHook.currentPlayer,
    selectedMonster: monstersHook.selectedMonster,
    ownedMonsters: monstersHook.monsters,
    playerPosition: sessionHook.playerPosition,
    gamePhase: sessionHook.gamePhase,
  }), [
    playerHook.currentPlayer,
    monstersHook.selectedMonster,
    monstersHook.monsters,
    sessionHook.playerPosition,
    sessionHook.gamePhase,
  ]);

  // 統合されたローディング状態
  const loading = playerHook.loading || monstersHook.loading;
  
  // 統合されたエラー状態
  const error = playerHook.error || monstersHook.error;

  // プレイヤー作成
  const createPlayer = useCallback(async (name: string): Promise<boolean> => {
    const player = await playerHook.createPlayer(name);
    if (player) {
      // プレイヤー作成成功時にモンスター一覧を取得
      await monstersHook.fetchMonsters(player.id);
      return true;
    }
    return false;
  }, [playerHook, monstersHook]);

  // プレイヤー選択
  const selectPlayer = useCallback(async (playerId: string): Promise<boolean> => {
    const player = await playerHook.getPlayer(playerId);
    if (player) {
      // プレイヤー選択成功時にモンスター一覧を取得
      await monstersHook.fetchMonsters(player.id);
      return true;
    }
    return false;
  }, [playerHook, monstersHook]);

  // ログアウト
  const logout = useCallback(() => {
    playerHook.logout();
    monstersHook.reset();
    sessionHook.resetSession();
  }, [playerHook, monstersHook, sessionHook]);

  // モンスター一覧を更新
  const refreshMonsters = useCallback(async (): Promise<void> => {
    if (gameState.player) {
      await monstersHook.fetchMonsters(gameState.player.id);
    }
  }, [gameState.player, monstersHook]);

  // モンスターのニックネーム更新
  const updateMonsterNickname = useCallback(async (monsterId: string, nickname: string): Promise<boolean> => {
    return await monstersHook.updateNickname(monsterId, nickname);
  }, [monstersHook]);

  // モンスターを逃がす
  const releaseMonster = useCallback(async (monsterId: string): Promise<boolean> => {
    return await monstersHook.releaseMonster(monsterId);
  }, [monstersHook]);

  // モンスター選択
  const selectMonster = useCallback((monster: Monster | null) => {
    monstersHook.selectMonster(monster);
  }, [monstersHook]);

  // ゲームフェーズ設定
  const setGamePhase = useCallback((phase: GamePhase) => {
    sessionHook.setGamePhase(phase);
  }, [sessionHook]);

  // プレイヤー移動
  const movePlayer = useCallback((deltaX: number, deltaY: number) => {
    sessionHook.movePlayer(deltaX, deltaY);
  }, [sessionHook]);

  // プレイヤー位置設定
  const setPlayerPosition = useCallback((position: { x: number; y: number }) => {
    sessionHook.setPlayerPosition(position);
  }, [sessionHook]);

  // バトル開始
  const startBattle = useCallback(async (action: 'attack' | 'capture'): Promise<unknown> => {
    if (!gameState.player) {
      throw new Error('プレイヤーが選択されていません');
    }
    
    // バトルフェーズに移行
    setGamePhase('battle');
    
    try {
      // バトル実行
      const result = await monstersHook.battle(gameState.player.id, action);
      
      // バトル終了後にプレイフェーズに戻る
      setGamePhase('playing');
      
      return result;
    } catch (error) {
      // エラー時もプレイフェーズに戻る
      setGamePhase('playing');
      throw error;
    }
  }, [gameState.player, monstersHook, setGamePhase]);

  // ゲーム状態をリセット
  const resetGame = useCallback(() => {
    playerHook.reset();
    monstersHook.reset();
    sessionHook.resetSession();
  }, [playerHook, monstersHook, sessionHook]);

  // プレイヤーが選択されている場合、定期的にモンスター一覧を更新
  useEffect(() => {
    if (gameState.player && gameState.gamePhase === 'playing') {
      // 初回取得
      if (monstersHook.monsters.length === 0) {
        monstersHook.fetchMonsters(gameState.player.id);
      }
    }
  }, [gameState.player, gameState.gamePhase, monstersHook]);

  return {
    gameState,
    loading,
    error,
    createPlayer,
    selectPlayer,
    logout,
    refreshMonsters,
    updateMonsterNickname,
    releaseMonster,
    selectMonster,
    setGamePhase,
    movePlayer,
    setPlayerPosition,
    startBattle,
    resetGame,
  };
};

/**
 * 初学者向けメモ：リファクタリングのポイント
 * 
 * 🔄 **Before（localStorage版）**
 * - 全ての状態をlocalStorageで管理
 * - オフラインで動作
 * - データ同期なし
 * - 単一デバイス限定
 * 
 * 🚀 **After（API連携版）**
 * - プレイヤー・モンスターはD1データベース
 * - 位置・フェーズはsessionStorage
 * - リアルタイムデータ同期
 * - 複数デバイス対応
 * 
 * 🏗️ **アーキテクチャの改善**
 * - 関心の分離（プレイヤー、モンスター、セッション）
 * - 再利用可能なカスタムフック
 * - 型安全性の向上
 * - テストしやすい構造
 * 
 * 📝 **使用例の変更**
 * ```typescript
 * // Before
 * const { gameState, updatePlayer } = useGameState();
 * updatePlayer(newPlayer);
 * 
 * // After
 * const { gameState, createPlayer } = useGameState();
 * await createPlayer('プレイヤー名'); // API呼び出し
 * ```
 * 
 * 🎯 **学習効果**
 * - RESTful API の活用
 * - 非同期状態管理
 * - データ永続化戦略の理解
 * - フロントエンド・バックエンド連携
 */

// 後方互換性のためのエイリアス（将来削除予定）
export { GamePhase };