/**
 * ゲームセッション管理のカスタムフック
 * 初学者向け: 一時的なゲーム状態（位置、フェーズ等）をsessionStorageで管理
 */

import { useState, useCallback, useEffect } from 'react';

// ゲームフェーズの型定義
export type GamePhase = 'start' | 'playerCreation' | 'playing' | 'battle' | 'menu';

// プレイヤー位置の型定義
export interface PlayerPosition {
  x: number;
  y: number;
}

// ゲームセッション状態の型定義
export interface GameSessionState {
  // 現在のゲームフェーズ
  gamePhase: GamePhase;
  // プレイヤーの位置
  playerPosition: PlayerPosition;
  // 最後にアクセスした時刻
  lastAccess: Date;
  // セッション開始時刻
  sessionStart: Date;
}

// ゲームセッションフックの戻り値型
export interface UseGameSessionResult {
  // 現在のゲームフェーズ
  gamePhase: GamePhase;
  // プレイヤーの位置
  playerPosition: PlayerPosition;
  // セッション開始時刻
  sessionStart: Date;
  // ゲームフェーズを更新
  setGamePhase: (phase: GamePhase) => void;
  // プレイヤー位置を更新
  setPlayerPosition: (position: PlayerPosition) => void;
  // プレイヤーを移動
  movePlayer: (deltaX: number, deltaY: number) => void;
  // セッションをリセット
  resetSession: () => void;
  // セッション時間を取得（分単位）
  getSessionDuration: () => number;
  // セッションが有効かチェック
  isSessionValid: () => boolean;
}

// デフォルト値
const DEFAULT_POSITION: PlayerPosition = { x: 5, y: 4 };
const DEFAULT_PHASE: GamePhase = 'start';
const SESSION_TIMEOUT_HOURS = 24; // 24時間でセッションタイムアウト

/**
 * ゲームセッション管理カスタムフック
 * 
 * 初学者向けメモ：
 * - sessionStorage を使用してブラウザセッション内でのみ状態を保持
 * - プレイヤーの位置やゲームフェーズなど、一時的な状態を管理
 * - D1データベースには保存しない軽量な状態管理
 * 
 * @example
 * const { gamePhase, playerPosition, setGamePhase, movePlayer } = useGameSession();
 * 
 * // ゲーム開始時
 * setGamePhase('playing');
 * 
 * // プレイヤー移動
 * movePlayer(1, 0); // 右に1マス移動
 */
export const useGameSession = (): UseGameSessionResult => {
  // セッション状態をsessionStorageから復元
  const [sessionState, setSessionState] = useState<GameSessionState>(() => {
    try {
      const saved = sessionStorage.getItem('game-session');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // セッションタイムアウトチェック
        const lastAccess = new Date(parsed.lastAccess);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < SESSION_TIMEOUT_HOURS) {
          return {
            ...parsed,
            lastAccess: new Date(parsed.lastAccess),
            sessionStart: new Date(parsed.sessionStart),
          };
        }
      }
    } catch (error) {
      console.warn('セッション復元エラー:', error);
    }
    
    // デフォルト状態
    const now = new Date();
    return {
      gamePhase: DEFAULT_PHASE,
      playerPosition: DEFAULT_POSITION,
      lastAccess: now,
      sessionStart: now,
    };
  });

  // sessionStorageに状態を保存
  const saveToStorage = useCallback((state: GameSessionState) => {
    try {
      sessionStorage.setItem('game-session', JSON.stringify(state));
    } catch (error) {
      console.warn('セッション保存エラー:', error);
    }
  }, []);

  // 状態更新とsessionStorage同期
  const updateSessionState = useCallback((updates: Partial<GameSessionState>) => {
    const newState = {
      ...sessionState,
      ...updates,
      lastAccess: new Date(),
    };
    
    setSessionState(newState);
    saveToStorage(newState);
  }, [sessionState, saveToStorage]);

  // ゲームフェーズを更新
  const setGamePhase = useCallback((phase: GamePhase) => {
    updateSessionState({ gamePhase: phase });
  }, [updateSessionState]);

  // プレイヤー位置を更新
  const setPlayerPosition = useCallback((position: PlayerPosition) => {
    updateSessionState({ playerPosition: position });
  }, [updateSessionState]);

  // プレイヤーを移動
  const movePlayer = useCallback((deltaX: number, deltaY: number) => {
    const newPosition = {
      x: sessionState.playerPosition.x + deltaX,
      y: sessionState.playerPosition.y + deltaY,
    };
    
    // 初学者向けメモ: 簡単な境界チェック（マップサイズは10x10と仮定）
    newPosition.x = Math.max(0, Math.min(9, newPosition.x));
    newPosition.y = Math.max(0, Math.min(9, newPosition.y));
    
    setPlayerPosition(newPosition);
  }, [sessionState.playerPosition, setPlayerPosition]);

  // セッションをリセット
  const resetSession = useCallback(() => {
    const now = new Date();
    const newState: GameSessionState = {
      gamePhase: DEFAULT_PHASE,
      playerPosition: DEFAULT_POSITION,
      lastAccess: now,
      sessionStart: now,
    };
    
    setSessionState(newState);
    saveToStorage(newState);
  }, [saveToStorage]);

  // セッション時間を取得（分単位）
  const getSessionDuration = useCallback((): number => {
    const now = new Date();
    const durationMs = now.getTime() - sessionState.sessionStart.getTime();
    return Math.floor(durationMs / (1000 * 60));
  }, [sessionState.sessionStart]);

  // セッションが有効かチェック
  const isSessionValid = useCallback((): boolean => {
    const now = new Date();
    const hoursDiff = (now.getTime() - sessionState.lastAccess.getTime()) / (1000 * 60 * 60);
    return hoursDiff < SESSION_TIMEOUT_HOURS;
  }, [sessionState.lastAccess]);

  // 定期的にlastAccessを更新
  useEffect(() => {
    const interval = setInterval(() => {
      if (isSessionValid()) {
        updateSessionState({});
      }
    }, 60000); // 1分ごと

    return () => clearInterval(interval);
  }, [updateSessionState, isSessionValid]);

  return {
    gamePhase: sessionState.gamePhase,
    playerPosition: sessionState.playerPosition,
    sessionStart: sessionState.sessionStart,
    setGamePhase,
    setPlayerPosition,
    movePlayer,
    resetSession,
    getSessionDuration,
    isSessionValid,
  };
};

/**
 * ゲームフェーズ管理のヘルパーフック
 * 
 * 初学者向けメモ：
 * - 特定のフェーズでのみ使用する機能を提供
 * - フェーズ遷移のロジックを簡潔に記述
 */
export const useGamePhaseHelpers = () => {
  const { gamePhase, setGamePhase } = useGameSession();

  // ゲーム開始
  const startGame = useCallback(() => {
    setGamePhase('playing');
  }, [setGamePhase]);

  // バトル開始
  const startBattle = useCallback(() => {
    setGamePhase('battle');
  }, [setGamePhase]);

  // バトル終了
  const endBattle = useCallback(() => {
    setGamePhase('playing');
  }, [setGamePhase]);

  // メニューを開く
  const openMenu = useCallback(() => {
    setGamePhase('menu');
  }, [setGamePhase]);

  // メニューを閉じる
  const closeMenu = useCallback(() => {
    setGamePhase('playing');
  }, [setGamePhase]);

  // プレイヤー作成画面に移動
  const goToPlayerCreation = useCallback(() => {
    setGamePhase('playerCreation');
  }, [setGamePhase]);

  // 各フェーズの状態チェック
  const isInPhase = useCallback((phase: GamePhase) => {
    return gamePhase === phase;
  }, [gamePhase]);

  return {
    gamePhase,
    startGame,
    startBattle,
    endBattle,
    openMenu,
    closeMenu,
    goToPlayerCreation,
    isInPhase,
    // 便利なブール値
    isPlaying: gamePhase === 'playing',
    isBattle: gamePhase === 'battle',
    isMenu: gamePhase === 'menu',
    isStart: gamePhase === 'start',
    isPlayerCreation: gamePhase === 'playerCreation',
  };
};

/**
 * 初学者向けメモ：セッション管理の設計思想
 * 
 * 🎮 **sessionStorage の使用理由**
 * - ページリロード時の状態復元
 * - ブラウザタブ間での独立性
 * - ブラウザ終了時の自動クリア
 * - サーバー負荷の軽減
 * 
 * ⏱️ **セッションタイムアウト**
 * - 24時間で自動的にセッションを無効化
 * - セキュリティとメモリ使用量の最適化
 * - 長時間放置への対策
 * 
 * 🗺️ **位置情報の管理**
 * - マップ上でのプレイヤー位置
 * - 境界チェックの実装
 * - 移動履歴の追跡（将来拡張）
 * 
 * 📝 **使用例**
 * ```typescript
 * function GameMap() {
 *   const { 
 *     playerPosition, 
 *     movePlayer, 
 *     gamePhase,
 *     setGamePhase 
 *   } = useGameSession();
 *   
 *   const { isPlaying, startBattle } = useGamePhaseHelpers();
 *   
 *   const handleKeyPress = (key: string) => {
 *     if (!isPlaying) return;
 *     
 *     switch (key) {
 *       case 'ArrowUp': movePlayer(0, -1); break;
 *       case 'ArrowDown': movePlayer(0, 1); break;
 *       case 'ArrowLeft': movePlayer(-1, 0); break;
 *       case 'ArrowRight': movePlayer(1, 0); break;
 *       case ' ': startBattle(); break;
 *     }
 *   };
 *   
 *   return (
 *     <div className="game-map">
 *       <PlayerSprite position={playerPosition} />
 *     </div>
 *   );
 * }
 * ```
 */