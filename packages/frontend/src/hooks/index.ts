/**
 * カスタムフックのエクスポート
 * 
 * 初学者向けメモ：
 * - カスタムフックの再エクスポート
 * - 使いやすいインポートパスを提供
 */

// API関連フック
export * from './useAPI';

// ゲーム状態管理フック（D1データベース連携）
export * from './useGameState';
export * from './usePlayer';
export * from './useMonsters';
export * from './useGameSession';

// ユーティリティフック
export * from './useLocalStorage';
export * from './useMessage';
export * from './useKeyboard';

// 使用例：
// import { useGameState, usePlayer, useMonsters } from '@/hooks';