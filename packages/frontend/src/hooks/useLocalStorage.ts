import { useState, useCallback, useEffect } from 'react';

// 初学者向けメモ：
// ローカルストレージを使った状態管理のカスタムフック
// Reactの状態とローカルストレージを同期させる

/**
 * ローカルストレージと同期する状態を管理するフック
 * 
 * @param key - ローカルストレージのキー
 * @param defaultValue - デフォルト値
 * @returns [値, 更新関数, 削除関数]
 * 
 * @example
 * const [userName, setUserName, removeUserName] = useLocalStorage('userName', '');
 * 
 * // 値を更新
 * setUserName('太郎');
 * 
 * // 値を削除
 * removeUserName();
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // 初期値を取得
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // ローカルストレージから値を取得
      const item = window.localStorage.getItem(key);
      
      // 値が存在すれば解析して返す
      if (item !== null) {
        return JSON.parse(item);
      }
      
      // 関数の場合は実行して結果を返す
      if (defaultValue instanceof Function) {
        return defaultValue();
      }
      
      return defaultValue;
    } catch (error) {
      console.error(`ローカルストレージの読み込みエラー (key: ${key}):`, error);
      return defaultValue;
    }
  });

  // 値を更新する関数
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // 関数の場合は前の値を渡して実行
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // 状態を更新
        setStoredValue(valueToStore);
        
        // ローカルストレージに保存
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // カスタムイベントを発火（他のタブやウィンドウに通知）
        window.dispatchEvent(
          new CustomEvent('localStorageChange', {
            detail: { key, value: valueToStore },
          })
        );
      } catch (error) {
        console.error(`ローカルストレージの書き込みエラー (key: ${key}):`, error);
      }
    },
    [key, storedValue]
  );

  // 値を削除する関数
  const removeValue = useCallback(() => {
    try {
      // 状態をデフォルト値に戻す
      setStoredValue(defaultValue);
      
      // ローカルストレージから削除
      window.localStorage.removeItem(key);
      
      // カスタムイベントを発火
      window.dispatchEvent(
        new CustomEvent('localStorageChange', {
          detail: { key, value: null },
        })
      );
    } catch (error) {
      console.error(`ローカルストレージの削除エラー (key: ${key}):`, error);
    }
  }, [key, defaultValue]);

  // 他のタブやウィンドウでの変更を監視
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.error(`ローカルストレージの同期エラー (key: ${key}):`, error);
        }
      }
    };

    // カスタムイベントの処理（同じタブ内での変更）
    const handleCustomStorageChange = (event: CustomEvent) => {
      if (event.detail.key === key) {
        setStoredValue(event.detail.value);
      }
    };

    // イベントリスナーを追加
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(
      'localStorageChange',
      handleCustomStorageChange as EventListener
    );

    // クリーンアップ
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'localStorageChange',
        handleCustomStorageChange as EventListener
      );
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}

// 初学者向けメモ：
// 複数のローカルストレージキーを管理するヘルパーフック
interface LocalStorageKeys {
  [key: string]: unknown;
}

/**
 * 複数のローカルストレージキーを一括管理するフック
 * 
 * @example
 * const storage = useMultipleLocalStorage({
 *   userName: '',
 *   theme: 'light',
 *   settings: { notifications: true },
 * });
 * 
 * // 値を取得
 * console.log(storage.userName.value);
 * 
 * // 値を更新
 * storage.userName.set('太郎');
 * 
 * // すべてクリア
 * storage.clearAll();
 */
export function useMultipleLocalStorage<T extends LocalStorageKeys>(
  keysAndDefaults: T
) {
  const entries = Object.entries(keysAndDefaults);
  const hooks = entries.map(([key, defaultValue]) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue, removeValue] = useLocalStorage(key, defaultValue);
    return { key, value, setValue, removeValue };
  });

  // オブジェクト形式で返す
  const result = hooks.reduce(
    (acc, { key, value, setValue, removeValue }) => {
      acc[key as keyof T] = {
        value,
        set: setValue,
        remove: removeValue,
      } as never;
      return acc;
    },
    {} as {
      [K in keyof T]: {
        value: T[K];
        set: (value: T[K] | ((prev: T[K]) => T[K])) => void;
        remove: () => void;
      };
    }
  );

  // すべてのキーをクリアする関数
  const clearAll = useCallback(() => {
    hooks.forEach(({ removeValue }) => removeValue());
  }, [hooks]);

  return { ...result, clearAll };
}