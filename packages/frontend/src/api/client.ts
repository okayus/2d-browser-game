/**
 * APIクライアント
 * 
 * 初学者向けメモ：
 * - バックエンドAPIとの通信を管理
 * - 型安全なAPI呼び出しを提供
 * - エラーハンドリングを一元化
 */

import type { 
  プレイヤー作成レスポンス,
  プレイヤー一覧応答,
  モンスター一覧レスポンス,
  APIエラーレスポンス,
  プレイヤー応答,
  API応答,
} from '@monster-game/shared';

// API基本設定
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

/**
 * APIエラークラス
 * 
 * 初学者向けメモ：
 * - APIからのエラーレスポンスを扱うためのカスタムエラークラス
 * - エラーの詳細情報を保持
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * fetch関数のラッパー
 * 
 * 初学者向けメモ：
 * - 共通のエラーハンドリング
 * - JSONの自動パース
 * - 型安全なレスポンス
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // バックエンドの実際のエラーレスポンス形式に合わせる
      const errorData = data as { success: boolean; error: string } | APIエラーレスポンス;
      
      if ('error' in errorData && typeof errorData.error === 'string') {
        // シンプルなエラー形式の場合
        throw new APIError(
          errorData.error,
          response.status,
          'API_ERROR'
        );
      } else if ('エラー' in errorData && errorData.エラー && typeof errorData.エラー === 'object') {
        // 構造化エラー形式の場合
        const errorDetail = errorData.エラー as { メッセージ?: string; コード?: string };
        throw new APIError(
          errorDetail.メッセージ || 'APIエラーが発生しました',
          response.status,
          errorDetail.コード || 'UNKNOWN_ERROR',
          errorData.エラー
        );
      } else {
        // その他の場合
        throw new APIError(
          'APIエラーが発生しました',
          response.status,
          'UNKNOWN_ERROR'
        );
      }
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // ネットワークエラーなど
    throw new APIError(
      'ネットワークエラーが発生しました',
      0,
      'NETWORK_ERROR',
      error
    );
  }
}

/**
 * プレイヤーAPI
 */
export const playerAPI = {
  /**
   * プレイヤー作成
   * 
   * @param name プレイヤー名（1-20文字）
   * @returns 作成されたプレイヤー情報
   */
  async create(name: string): Promise<プレイヤー作成レスポンス> {
    return fetchAPI<プレイヤー作成レスポンス>('/players', {
      method: 'POST',
      body: JSON.stringify({ 名前: name }),
    });
  },

  /**
   * プレイヤー一覧取得
   * 
   * @returns プレイヤー一覧
   */
  async list(): Promise<プレイヤー一覧応答> {
    return fetchAPI<プレイヤー一覧応答>('/players');
  },

  /**
   * プレイヤー情報取得
   * 
   * @param id プレイヤーID
   * @returns プレイヤー情報
   */
  async get(id: string): Promise<プレイヤー応答> {
    return fetchAPI<プレイヤー応答>(`/players/${id}`);
  },
};

/**
 * モンスターAPI
 */
export const monsterAPI = {
  /**
   * プレイヤーの所持モンスター一覧取得
   * 
   * @param playerId プレイヤーID
   * @returns 所持モンスター一覧
   */
  async listByPlayer(playerId: string): Promise<モンスター一覧レスポンス> {
    return fetchAPI<モンスター一覧レスポンス>(`/players/${playerId}/monsters`);
  },

  /**
   * モンスターのニックネーム変更
   * 
   * @param monsterId モンスターID
   * @param nickname 新しいニックネーム
   * @returns 更新後のモンスター情報
   */
  async updateNickname(monsterId: string, nickname: string): Promise<API応答<{ id: string; ニックネーム: string }>> {
    return fetchAPI<API応答<{ id: string; ニックネーム: string }>>(`/monsters/${monsterId}`, {
      method: 'PUT',
      body: JSON.stringify({ ニックネーム: nickname }),
    });
  },

  /**
   * モンスターを逃がす
   * 
   * @param monsterId モンスターID
   * @returns 削除結果
   */
  async release(monsterId: string): Promise<API応答<{ message: string }>> {
    return fetchAPI<API応答<{ message: string }>>(`/monsters/${monsterId}`, {
      method: 'DELETE',
    });
  },

  /**
   * モンスターのHP更新
   * 
   * 初学者向けメモ：
   * - バトル後のHP更新用
   * - 最大HP以下の値のみ許可
   * 
   * @param monsterId モンスターID
   * @param currentHp 現在のHP
   * @returns 更新結果
   */
  async updateHp(monsterId: string, currentHp: number): Promise<API応答<{ id: string; 現在hp: number; 最大hp: number }>> {
    return fetchAPI<API応答<{ id: string; 現在hp: number; 最大hp: number }>>(`/monsters/${monsterId}/hp`, {
      method: 'PUT',
      body: JSON.stringify({ 現在hp: currentHp }),
    });
  },

  /**
   * モンスター捕獲
   * 
   * 初学者向けメモ：
   * - バトル勝利後の捕獲用
   * - 新しいモンスターを追加
   * 
   * @param playerId プレイヤーID
   * @param speciesId 種族ID（フレイムビースト）
   * @param nickname ニックネーム（任意）
   * @param currentHp 現在HP（任意、デフォルトは基本HP）
   * @param maxHp 最大HP（任意、デフォルトは基本HP）
   * @returns 捕獲されたモンスター情報
   */
  async capture(
    playerId: string, 
    speciesId: string, 
    nickname?: string,
    currentHp?: number,
    maxHp?: number
  ): Promise<API応答<{
    id: string;
    プレイヤーID: string;
    種族: { id: string; 名前: string; 基礎HP: number };
    ニックネーム: string;
    現在HP: number;
    最大HP: number;
    捕獲日時: string;
  }>> {
    return fetchAPI<API応答<{
      id: string;
      プレイヤーID: string;
      種族: { id: string; 名前: string; 基礎HP: number };
      ニックネーム: string;
      現在HP: number;
      最大HP: number;
      捕獲日時: string;
    }>>('/monsters/capture', {
      method: 'POST',
      body: JSON.stringify({
        プレイヤーid: playerId,
        種族id: speciesId,
        ...(nickname && { ニックネーム: nickname }),
        ...(currentHp && { 現在hp: currentHp }),
        ...(maxHp && { 最大hp: maxHp }),
      }),
    });
  },

  /**
   * 野生のモンスターとのバトル
   * 
   * @param playerId プレイヤーID
   * @param action アクション（'attack' | 'capture'）
   * @returns バトル結果
   */
  async battle(playerId: string, action: 'attack' | 'capture'): Promise<API応答<unknown>> {
    return fetchAPI<API応答<unknown>>('/battle', {
      method: 'POST',
      body: JSON.stringify({
        プレイヤーid: playerId,
        アクション: action,
      }),
    });
  },
};

/**
 * 初学者向けメモ：APIクライアントの使用例
 * 
 * ```typescript
 * // プレイヤー作成
 * try {
 *   const response = await playerAPI.create('太郎');
 *   console.log('作成されたプレイヤー:', response.データ);
 * } catch (error) {
 *   if (error instanceof APIError) {
 *     console.error('APIエラー:', error.message);
 *   }
 * }
 * 
 * // モンスター一覧取得
 * try {
 *   const response = await monsterAPI.listByPlayer('player123');
 *   console.log('所持モンスター:', response.データ.モンスター);
 * } catch (error) {
 *   if (error instanceof APIError) {
 *     console.error('APIエラー:', error.message);
 *   }
 * }
 * ```
 */