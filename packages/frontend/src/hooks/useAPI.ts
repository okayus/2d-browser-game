/**
 * API呼び出しのカスタムフック
 * 
 * 初学者向けメモ：
 * - APIの呼び出し状態を管理
 * - ローディング、エラー、データを一元管理
 * - React Queryの代わりに基本的な実装
 */

import { useState, useCallback } from 'react';
import { APIError } from '../api/client';

// APIフック の戻り値の型
interface UseAPIResult<T, Args extends unknown[]> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

/**
 * API呼び出しを管理するカスタムフック
 * 
 * @param apiFunction API関数
 * @returns API呼び出しの状態と実行関数
 * 
 * 使用例：
 * ```typescript
 * const { data, loading, error, execute } = useAPI(playerAPI.create);
 * 
 * const handleSubmit = async () => {
 *   const result = await execute('プレイヤー名');
 *   if (result) {
 *     console.log('作成成功:', result);
 *   }
 * };
 * ```
 */
export function useAPI<T, Args extends unknown[]>(
  apiFunction: (...args: Args) => Promise<T>
): UseAPIResult<T, Args> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  // API実行関数
  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      if (err instanceof APIError) {
        setError(err);
      } else {
        setError(new APIError(
          '予期しないエラーが発生しました',
          0,
          'UNKNOWN_ERROR',
          err
        ));
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  // 状態のリセット
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * 自動実行版のAPIフック
 * 
 * 初学者向けメモ：
 * - コンポーネントのマウント時に自動でAPI呼び出し
 * - 依存配列の変更時に再実行
 */
import { useEffect } from 'react';

export function useAPIEffect<T>(
  apiFunction: () => Promise<T>,
  deps: React.DependencyList = []
): UseAPIResult<T, []> {
  const api = useAPI(apiFunction);

  useEffect(() => {
    api.execute();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return api;
}

/**
 * 初学者向けメモ：カスタムフックの利点
 * 
 * 1. 状態管理の簡略化
 *    - loading, error, dataを一元管理
 *    - 各コンポーネントで同じコードを書く必要がない
 * 
 * 2. エラーハンドリング
 *    - APIErrorの型を活用
 *    - エラー表示の統一
 * 
 * 3. 再利用性
 *    - どのAPI関数でも使える汎用的な設計
 *    - テストしやすい
 * 
 * 使用例：
 * ```typescript
 * function PlayerList() {
 *   const { data, loading, error } = useAPIEffect(playerAPI.list);
 * 
 *   if (loading) return <div>読み込み中...</div>;
 *   if (error) return <div>エラー: {error.message}</div>;
 *   if (!data) return null;
 * 
 *   return (
 *     <ul>
 *       {data.データ.プレイヤー.map(player => (
 *         <li key={player.id}>{player.名前}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */