/**
 * フロントエンド用型定義
 * 
 * 初学者向けメモ：
 * - 共通の型定義を一箇所に集約
 * - バックエンドとの整合性を保つ
 */

/**
 * プレイヤー情報
 */
export interface Player {
  id: string
  name: string
  createdAt: string
  monsters?: Monster[]
}

/**
 * モンスター情報
 * バックエンドのスキーマに合わせて基本HPのみ使用
 */
export interface Monster {
  id: string
  name: string
  type: 'fire' | 'water' | 'grass' | 'electric'
  level?: number
  hp: number
  maxHp: number
  imageUrl?: string
  nickname?: string
}

/**
 * バトルアクション
 */
export interface BattleAction {
  type: 'attack' | 'capture' | 'run'
}

/**
 * バトル結果
 */
export interface BattleResult {
  success: boolean
  message: string
  captured?: boolean
  playerMonsterHp?: number
  wildMonsterHp?: number
}