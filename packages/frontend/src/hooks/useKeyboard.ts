import { useEffect, useRef } from 'react';

// 初学者向けメモ：
// キーボードイベントのハンドラー型
// key: 押されたキー
// event: キーボードイベントオブジェクト
type KeyHandler = (key: string, event: KeyboardEvent) => void;

// キーマップの型定義
// キー名をキーに、ハンドラー関数を値に持つオブジェクト
type KeyMap = Record<string, KeyHandler>;

interface UseKeyboardOptions {
  // 特定の要素でのみキーボードイベントを処理する場合
  targetElement?: HTMLElement | null;
  // イベントを有効にするかどうか
  enabled?: boolean;
  // 入力フィールドでのイベントを無視するかどうか
  ignoreInputFields?: boolean;
}

/**
 * キーボードイベントを処理するカスタムフック
 * 
 * @example
 * // 矢印キーとWASDキーで移動
 * useKeyboard({
 *   'ArrowUp': () => movePlayer(0, -1),
 *   'ArrowDown': () => movePlayer(0, 1),
 *   'ArrowLeft': () => movePlayer(-1, 0),
 *   'ArrowRight': () => movePlayer(1, 0),
 *   'w': () => movePlayer(0, -1),
 *   's': () => movePlayer(0, 1),
 *   'a': () => movePlayer(-1, 0),
 *   'd': () => movePlayer(1, 0),
 *   'Escape': () => closeModal(),
 * });
 */
export const useKeyboard = (
  keyMap: KeyMap,
  options: UseKeyboardOptions = {}
) => {
  const {
    targetElement,
    enabled = true,
    ignoreInputFields = true,
  } = options;

  // keyMapの参照を保持（再レンダリングによる再登録を防ぐ）
  const keyMapRef = useRef(keyMap);
  keyMapRef.current = keyMap;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 入力フィールドでのイベントを無視
      if (ignoreInputFields) {
        const target = event.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        
        // input, textarea, select要素、またはcontentEditableな要素の場合は無視
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          target.contentEditable === 'true'
        ) {
          return;
        }
      }

      // キーに対応するハンドラーを実行
      const handler = keyMapRef.current[event.key];
      if (handler) {
        event.preventDefault();
        handler(event.key, event);
      }

      // 修飾キー付きのキー（例：Ctrl+S）も処理
      if (event.ctrlKey || event.metaKey || event.altKey) {
        const modifiedKey = [
          event.ctrlKey && 'Ctrl',
          event.metaKey && 'Meta',
          event.altKey && 'Alt',
          event.key,
        ].filter(Boolean).join('+');

        const modifiedHandler = keyMapRef.current[modifiedKey];
        if (modifiedHandler) {
          event.preventDefault();
          modifiedHandler(modifiedKey, event);
        }
      }
    };

    // イベントリスナーを追加
    const element = targetElement || document;
    element.addEventListener('keydown', handleKeyDown as EventListener);

    // クリーンアップ
    return () => {
      element.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [targetElement, enabled, ignoreInputFields]);
};

// 初学者向けメモ：
// よく使うキーボードショートカットのプリセット
export const KEYBOARD_SHORTCUTS = {
  // 移動系
  MOVE_UP: ['ArrowUp', 'w', 'W'],
  MOVE_DOWN: ['ArrowDown', 's', 'S'],
  MOVE_LEFT: ['ArrowLeft', 'a', 'A'],
  MOVE_RIGHT: ['ArrowRight', 'd', 'D'],
  
  // アクション系
  CONFIRM: ['Enter', ' '],
  CANCEL: ['Escape'],
  
  // その他
  OPEN_MENU: ['m', 'M'],
  TOGGLE_FULLSCREEN: ['F11'],
} as const;

/**
 * 複数のキーに同じハンドラーを割り当てるヘルパー関数
 * 
 * @example
 * const keyMap = createKeyMap({
 *   [KEYBOARD_SHORTCUTS.MOVE_UP]: () => moveUp(),
 *   [KEYBOARD_SHORTCUTS.MOVE_DOWN]: () => moveDown(),
 *   [KEYBOARD_SHORTCUTS.CONFIRM]: () => confirm(),
 * });
 */
export const createKeyMap = (
  shortcuts: { [key: string]: KeyHandler | { keys: readonly string[]; handler: KeyHandler } }
): KeyMap => {
  const keyMap: KeyMap = {};

  Object.entries(shortcuts).forEach(([key, value]) => {
    if (typeof value === 'function') {
      // 単一のキーに対するハンドラー
      keyMap[key] = value;
    } else {
      // 複数のキーに対するハンドラー
      value.keys.forEach(k => {
        keyMap[k] = value.handler;
      });
    }
  });

  // KEYBOARD_SHORTCUTSを使った場合の処理
  Object.entries(KEYBOARD_SHORTCUTS).forEach(([_name, keys]) => {
    const handler = shortcuts[keys.join(',')] as KeyHandler | undefined;
    if (handler && typeof handler === 'function') {
      keys.forEach(key => {
        keyMap[key] = handler;
      });
    }
  });

  return keyMap;
};