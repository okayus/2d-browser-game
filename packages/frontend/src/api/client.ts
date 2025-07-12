/**
 * APIクライアント
 * 
 * 初学者向けメモ：
 * - バックエンドAPIとの通信を管理
 * - 型安全なAPI呼び出しを提供
 * - エラーハンドリングを一元化
 * - 英語キーに統一したレスポンス処理
 */

import type { 
  PlayerCreationResponse,
  PlayerResponse,
  MonsterListResponse,
  APIResponse
} from '../types/api';

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
      // 英語キーのエラーレスポンス形式に統一
      const errorData = data as { success: boolean; error: string; message?: string };
      
      if ('error' in errorData && typeof errorData.error === 'string') {
        // 標準的なエラー形式
        throw new APIError(
          errorData.error,
          response.status,
          'API_ERROR'
        );
      } else if ('message' in errorData && typeof errorData.message === 'string') {
        // メッセージ形式のエラー
        throw new APIError(
          errorData.message,
          response.status,
          'API_ERROR'
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
  async create(name: string): Promise<PlayerCreationResponse> {
    return fetchAPI<PlayerCreationResponse>('/players', {
      method: 'POST',
      body: JSON.stringify({ 名前: name }),
    });
  },

  /**
   * プレイヤー一覧取得
   * 
   * @returns プレイヤー一覧
   */
  async list(): Promise<PlayerResponse[]> {
    return fetchAPI<PlayerResponse[]>('/players');
  },

  /**
   * プレイヤー情報取得
   * 
   * @param id プレイヤーID
   * @returns プレイヤー情報
   */
  async get(id: string): Promise<PlayerResponse> {
    return fetchAPI<PlayerResponse>(`/players/${id}`);
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
  async listByPlayer(playerId: string): Promise<MonsterListResponse> {
    return fetchAPI<MonsterListResponse>(`/players/${playerId}/monsters`);
  },

  /**
   * モンスターのニックネーム変更
   * 
   * @param monsterId モンスターID
   * @param nickname 新しいニックネーム
   * @returns 更新後のモンスター情報
   */
  async updateNickname(monsterId: string, nickname: string): Promise<APIResponse<{ id: string; nickname: string }>> {
    return fetchAPI<APIResponse<{ id: string; nickname: string }>>(`/monsters/${monsterId}`, {
      method: 'PUT',
      body: JSON.stringify({ nickname: nickname }),
    });
  },

  /**
   * モンスターを逃がす
   * 
   * @param monsterId モンスターID
   * @returns 削除結果
   */
  async release(monsterId: string): Promise<APIResponse<{ message: string }>> {
    return fetchAPI<APIResponse<{ message: string }>>(`/monsters/${monsterId}`, {
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
  async updateHp(monsterId: string, currentHp: number): Promise<APIResponse<{ id: string; currentHp: number; maxHp: number }>> {
    return fetchAPI<APIResponse<{ id: string; currentHp: number; maxHp: number }>>(`/monsters/${monsterId}/hp`, {
      method: 'PUT',
      body: JSON.stringify({ currentHp: currentHp }),
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
  /**
   * モンスター捕獲API
   * 初学者向けメモ：英語キーに統一したリクエスト・レスポンス形式
   */
  async capture(
    playerId: string, 
    speciesId: string, 
    nickname?: string,
    currentHp?: number,
    maxHp?: number
  ): Promise<APIResponse<{
    id: string;
    playerId: string;
    species: { id: string; name: string; baseHp: number };
    nickname: string;
    currentHp: number;
    maxHp: number;
    capturedAt: string;
  }>> {
    return fetchAPI<APIResponse<{
      id: string;
      playerId: string;
      species: { id: string; name: string; baseHp: number };
      nickname: string;
      currentHp: number;
      maxHp: number;
      capturedAt: string;
    }>>('/monsters/capture', {
      method: 'POST',
      body: JSON.stringify({
        playerId: playerId,
        speciesId: speciesId,
        ...(nickname && { nickname: nickname }),
        ...(currentHp && { currentHp: currentHp }),
        ...(maxHp && { maxHp: maxHp }),
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
  async battle(playerId: string, action: 'attack' | 'capture'): Promise<APIResponse<unknown>> {
    return fetchAPI<APIResponse<unknown>>('/battle', {
      method: 'POST',
      body: JSON.stringify({
        playerId: playerId,
        action: action,
      }),
    });
  },
};

/**
 * 初学者向けメモ：APIクライアントの使用例（英語キー統一版）
 * 
 * ```typescript
 * // プレイヤー作成
 * try {
 *   const response = await playerAPI.create('太郎');
 *   console.log('作成されたプレイヤー:', response.data);
 * } catch (error) {
 *   if (error instanceof APIError) {
 *     console.error('APIエラー:', error.message);
 *   }
 * }
 * 
 * // モンスター一覧取得
 * try {
 *   const response = await monsterAPI.listByPlayer('player123');
 *   console.log('所持モンスター:', response.data?.monsters);
 * } catch (error) {
 *   if (error instanceof APIError) {
 *     console.error('APIエラー:', error.message);
 *   }
 * }
 * ```
 */