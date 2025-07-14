/**
 * APIクライアント
 * 
 * 初学者向けメモ：
 * - Firebase認証トークンを自動的にヘッダーに付与
 * - エラーハンドリングを一元化
 * - TypeScriptで型安全なAPI通信を実現
 */

import { auth } from './firebase';

/**
 * APIレスポンスの基本型
 * 
 * 初学者向けメモ：
 * - バックエンドAPIのレスポンス形式に合わせた型定義
 * - 成功時はdata、失敗時はerrorプロパティを使用
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * APIエラークラス
 * 
 * 初学者向けメモ：
 * - HTTP ステータスコードとメッセージを含む
 * - カスタムエラー処理のために拡張
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Firebase Auth トークンを取得
 * 
 * 初学者向けメモ：
 * - 現在ログイン中のユーザーのJWTトークンを取得
 * - このトークンをAPIのAuthorizationヘッダーに設定
 * - トークンが無効な場合はエラーを投げる
 */
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  try {
    // Firebase Authから最新のトークンを取得
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('トークン取得エラー:', error);
    throw new ApiError(401, '認証トークンの取得に失敗しました');
  }
};

/**
 * APIリクエストのオプション型
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  requireAuth?: boolean; // 認証が必要かどうか
}

/**
 * 基本的なAPI通信関数
 * 
 * 初学者向けメモ：
 * - fetch APIのラッパー関数
 * - 認証ヘッダーの自動付与
 * - エラーハンドリングとレスポンス解析を一元化
 */
const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    method = 'GET',
    headers = {},
    body,
    requireAuth = true,
  } = options;

  // リクエストヘッダーの構築
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // 認証が必要な場合はトークンを付与
  if (requireAuth) {
    const token = await getAuthToken();
    if (!token) {
      throw new ApiError(401, 'ログインが必要です');
    }
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // APIのベースURL（環境変数から取得）
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
  const url = `${baseUrl}${endpoint}`;

  try {
    // APIリクエスト実行
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // レスポンスのJSON解析
    let responseData: ApiResponse<T>;
    try {
      responseData = await response.json();
    } catch (parseError) {
      // JSONパースエラーの場合
      throw new ApiError(
        response.status,
        `レスポンスの解析に失敗しました: ${response.statusText}`
      );
    }

    // HTTPエラーステータスのチェック
    if (!response.ok) {
      throw new ApiError(
        response.status,
        responseData.message || responseData.error || `HTTP Error: ${response.status}`,
        responseData
      );
    }

    // レスポンスの成功フラグチェック
    if (!responseData.success) {
      throw new ApiError(
        response.status,
        responseData.message || responseData.error || 'APIエラーが発生しました',
        responseData
      );
    }

    // 成功時はdataプロパティを返す
    return responseData.data as T;
  } catch (error) {
    // ネットワークエラーまたはその他のエラー
    if (error instanceof ApiError) {
      throw error;
    }

    console.error('API通信エラー:', error);
    throw new ApiError(0, 'ネットワークエラーが発生しました');
  }
};

/**
 * プレイヤー管理API
 * 
 * 初学者向けメモ：
 * - プレイヤーの作成、取得、更新の機能
 * - 型安全性を保つためにインターフェースを定義
 */
export const playerApi = {
  /**
   * プレイヤー作成
   * 
   * 初学者向けメモ：
   * - POST /api/players エンドポイントを呼び出し
   * - Firebase UIDは認証ミドルウェアで自動取得されるため不要
   */
  create: async (data: { name: string }) => {
    return await apiRequest('/api/players', {
      method: 'POST',
      body: data,
      requireAuth: true,
    });
  },

  /**
   * プレイヤー情報取得
   * 
   * 初学者向けメモ：
   * - GET /api/players/:id エンドポイントを呼び出し
   * - プレイヤーIDを指定して特定のプレイヤー情報を取得
   */
  getById: async (playerId: string) => {
    return await apiRequest(`/api/players/${playerId}`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  /**
   * 現在のユーザーのプレイヤー情報取得
   * 
   * 初学者向けメモ：
   * - Firebase UIDを基にプレイヤー情報を取得
   * - ログイン後の初期画面で使用
   */
  getCurrent: async () => {
    return await apiRequest('/api/players/me', {
      method: 'GET',
      requireAuth: true,
    });
  },
};

/**
 * モンスター管理API
 * 
 * 初学者向けメモ：
 * - モンスターのCRUD操作
 * - プレイヤーに紐づいたモンスター管理
 */
export const monsterApi = {
  /**
   * プレイヤーの所持モンスター一覧取得
   */
  getByPlayerId: async (playerId: string) => {
    return await apiRequest(`/api/players/${playerId}/monsters`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  /**
   * モンスター獲得（作成）
   */
  create: async (playerId: string, data: { speciesId: string; nickname?: string }) => {
    return await apiRequest(`/api/players/${playerId}/monsters`, {
      method: 'POST',
      body: data,
      requireAuth: true,
    });
  },

  /**
   * モンスター情報更新（ニックネーム変更等）
   */
  update: async (monsterId: string, data: { nickname?: string }) => {
    return await apiRequest(`/api/monsters/${monsterId}`, {
      method: 'PUT',
      body: data,
      requireAuth: true,
    });
  },

  /**
   * モンスター削除（逃がす）
   */
  delete: async (monsterId: string) => {
    return await apiRequest(`/api/monsters/${monsterId}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  },
};

/**
 * バトル管理API（将来実装予定）
 * 
 * 初学者向けメモ：
 * - Week5で実装予定のバトル機能
 * - 現在は基本的な構造のみ定義
 */
export const battleApi = {
  /**
   * バトル開始
   */
  start: async () => {
    return await apiRequest('/api/battles', {
      method: 'POST',
      requireAuth: true,
    });
  },

  /**
   * バトルアクション実行
   */
  action: async (battleId: string, action: string) => {
    return await apiRequest(`/api/battles/${battleId}/action`, {
      method: 'PUT',
      body: { action },
      requireAuth: true,
    });
  },
};

/**
 * 認証不要のパブリックAPI
 * 
 * 初学者向けメモ：
 * - ログイン前でもアクセス可能な情報
 * - モンスター種族情報など
 */
export const publicApi = {
  /**
   * モンスター種族一覧取得
   */
  getMonsterSpecies: async () => {
    return await apiRequest('/api/species', {
      method: 'GET',
      requireAuth: false,
    });
  },

  /**
   * ゲーム統計情報取得
   */
  getGameStats: async () => {
    return await apiRequest('/api/stats', {
      method: 'GET',
      requireAuth: false,
    });
  },
};

/**
 * APIエラーハンドリングのヘルパー関数
 * 
 * 初学者向けメモ：
 * - APIエラーを適切にユーザーに表示するための関数
 * - UIコンポーネントで使用
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    // 認証エラーの場合
    if (error.status === 401) {
      return 'ログインが必要です。再度ログインしてください。';
    }
    
    // 権限エラーの場合
    if (error.status === 403) {
      return 'この操作を行う権限がありません。';
    }
    
    // サーバーエラーの場合
    if (error.status >= 500) {
      return 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。';
    }
    
    // その他のAPIエラー
    return error.message;
  }
  
  // 不明なエラー
  console.error('予期しないエラー:', error);
  return '予期しないエラーが発生しました。';
};

/**
 * 初学者向けメモ：APIクライアントの使用例
 * 
 * 1. プレイヤー作成
 * ```typescript
 * try {
 *   const player = await playerApi.create({ name: 'プレイヤー名' });
 *   console.log('プレイヤー作成成功:', player);
 * } catch (error) {
 *   const errorMessage = handleApiError(error);
 *   alert(errorMessage);
 * }
 * ```
 * 
 * 2. モンスター一覧取得
 * ```typescript
 * const loadMonsters = async (playerId: string) => {
 *   try {
 *     const monsters = await monsterApi.getByPlayerId(playerId);
 *     setMonsters(monsters);
 *   } catch (error) {
 *     console.error('モンスター取得エラー:', handleApiError(error));
 *   }
 * };
 * ```
 * 
 * 3. 認証エラーのハンドリング
 * ```typescript
 * const { currentUser } = useAuth();
 * 
 * useEffect(() => {
 *   if (!currentUser) {
 *     // ユーザーがログアウトしている場合はAPIを呼ばない
 *     return;
 *   }
 *   
 *   loadPlayerData();
 * }, [currentUser]);
 * ```
 */