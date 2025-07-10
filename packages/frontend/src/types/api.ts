/**
 * API レスポンス型定義（暫定版）
 * バックエンドの実際の型定義に合わせる必要があります
 */

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PlayerData {
  id: string
  name: string
  createdAt: string
  initialMonsterId?: string
}

export interface MonsterData {
  id: string
  playerId: string
  speciesId: string
  nickname: string
  currentHp: number
  maxHp: number
  capturedAt: string
}

export interface PlayerCreationResponse extends APIResponse<PlayerData> {}
export interface PlayerResponse extends APIResponse<PlayerData> {}
export interface MonsterListResponse extends APIResponse<{ monsters: MonsterData[] }> {}
export interface MonsterUpdateResponse extends APIResponse<{ id: string; nickname: string }> {}
export interface MonsterDeleteResponse extends APIResponse<{ message: string }> {}