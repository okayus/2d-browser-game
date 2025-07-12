/**
 * API レスポンス型定義
 * バックエンドの英語レスポンス形式に対応
 * 
 * 初学者向けメモ：
 * - バックエンドAPIが返す実際のレスポンス形式に合わせた型定義
 * - success, data, message, error の英語キーを使用
 * - JSDocで詳細な説明を日本語で記載
 */

/**
 * API基本レスポンス型
 * @description 全てのAPIレスポンスの基本構造
 */
export interface APIResponse<T> {
  /** 成功フラグ */
  success: boolean
  /** レスポンスデータ（成功時のみ） */
  data?: T
  /** メッセージ（成功・エラー時の説明） */
  message?: string
  /** エラー詳細（エラー時のみ） */
  error?: string
}

/**
 * プレイヤーの基本データ型
 * @description プレイヤー情報の基本構造
 */
export interface PlayerData {
  /** プレイヤーID */
  id: string
  /** プレイヤー名 */
  name: string
  /** 作成日時（ISO 8601形式） */
  createdAt: string
}

/**
 * 初期モンスター情報型
 * @description プレイヤー作成時に付与される初期モンスターの情報
 */
export interface InitialMonsterData {
  /** モンスターID */
  id: string
  /** 種族名 */
  speciesName: string
  /** ニックネーム */
  nickname: string
  /** 現在HP */
  currentHp: number
  /** 最大HP */
  maxHp: number
}

/**
 * プレイヤー作成時のレスポンスデータ型
 * @description プレイヤー作成API成功時のデータ構造
 */
export interface PlayerCreationData extends PlayerData {
  /** 初期モンスター情報（付与された場合のみ） */
  initialMonster: InitialMonsterData | null
}

/**
 * モンスターの基本データ型
 * @description モンスター情報の基本構造
 */
export interface MonsterData {
  /** モンスターID */
  id: string
  /** 所有プレイヤーID */
  playerId: string
  /** 種族ID */
  speciesId: string
  /** ニックネーム */
  nickname: string
  /** 現在HP */
  currentHp: number
  /** 最大HP */
  maxHp: number
  /** 捕獲日時（ISO 8601形式） */
  capturedAt: string
}

// === APIレスポンス型定義 ===

/**
 * プレイヤー作成APIのレスポンス型
 * @description POST /api/players のレスポンス
 */
export interface PlayerCreationResponse extends APIResponse<PlayerCreationData> {}

/**
 * プレイヤー取得APIのレスポンス型
 * @description GET /api/players/:id のレスポンス
 */
export interface PlayerResponse extends APIResponse<PlayerData> {}

/**
 * プレイヤー一覧取得APIのレスポンス型
 * @description GET /api/players のレスポンス
 */
export interface PlayerListResponse extends APIResponse<PlayerData[]> {
  /** 取得件数 */
  count?: number
}

/**
 * モンスター一覧取得APIのレスポンス型
 * @description GET /api/players/:id/monsters のレスポンス
 */
export interface MonsterListResponse extends APIResponse<{ monsters: MonsterData[] }> {}

/**
 * モンスター更新APIのレスポンス型
 * @description PUT /api/monsters/:id のレスポンス
 */
export interface MonsterUpdateResponse extends APIResponse<{ id: string; nickname: string }> {}

/**
 * モンスター削除APIのレスポンス型
 * @description DELETE /api/monsters/:id のレスポンス
 */
export interface MonsterDeleteResponse extends APIResponse<{ message: string }> {}

// === 型エイリアス（後方互換性のため） ===

/** @deprecated PlayerCreationData を使用してください */
export type PlayerCreationResponseData = PlayerCreationData

/** @deprecated PlayerData を使用してください */
export type PlayerResponseData = PlayerData