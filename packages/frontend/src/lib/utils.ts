/**
 * ユーティリティ関数
 * アプリケーション全体で使用する共通機能
 */

/**
 * LocalStorageからデータを取得
 * @param key - ストレージキー
 * @param defaultValue - デフォルト値
 * @returns 取得したデータ
 */
export function getStorageData<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (error) {
    console.warn('LocalStorageの読み込みに失敗:', error)
    return defaultValue
  }
}

/**
 * LocalStorageにデータを保存
 * @param key - ストレージキー
 * @param data - 保存するデータ
 * @returns 保存成功の可否
 */
export function setStorageData<T>(key: string, data: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.warn('LocalStorageの保存に失敗:', error)
    return false
  }
}

/**
 * プレイヤー名のバリデーション
 * @param name - プレイヤー名
 * @returns バリデーション結果
 */
export function validatePlayerName(name: string): {
  isValid: boolean
  message: string
  name?: string
} {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      message: 'プレイヤー名を入力してください'
    }
  }
  
  const trimmedName = name.trim()
  
  if (trimmedName.length < 3) {
    return {
      isValid: false,
      message: 'プレイヤー名は3文字以上で入力してください'
    }
  }
  
  if (trimmedName.length > 20) {
    return {
      isValid: false,
      message: 'プレイヤー名は20文字以下で入力してください'
    }
  }
  
  // 特殊文字のチェック（基本的な文字のみ許可）
  const validPattern = /^[a-zA-Z0-9あ-んア-ンー一-龯\s]+$/
  if (!validPattern.test(trimmedName)) {
    return {
      isValid: false,
      message: 'プレイヤー名に使用できない文字が含まれています'
    }
  }
  
  return {
    isValid: true,
    message: '',
    name: trimmedName
  }
}

/**
 * モンスター種族の定義
 */
export const MONSTER_TYPES = [
  {
    id: 'electric_mouse' as const,
    name: 'でんきネズミ',
    description: '電気を操る小さなモンスター',
    icon: '⚡',
    type: 'electric' as const,
    baseHp: 35,
    rarity: 'common' as const,
    imageUrl: '/images/monsters/electric-mouse.png',
    baseStats: { hp: 35, attack: 15, defense: 10 }
  },
  {
    id: 'fire_lizard' as const,
    name: 'ほのおトカゲ',
    description: '炎を吐くトカゲのモンスター',
    icon: '🔥',
    type: 'fire' as const,
    baseHp: 40,
    rarity: 'common' as const,
    imageUrl: '/images/monsters/fire-lizard.png',
    baseStats: { hp: 40, attack: 18, defense: 12 }
  },
  {
    id: 'water_turtle' as const,
    name: 'みずガメ',
    description: '水を操る亀のモンスター',
    icon: '💧',
    type: 'water' as const,
    baseHp: 45,
    rarity: 'rare' as const,
    imageUrl: '/images/monsters/water-turtle.png',
    baseStats: { hp: 45, attack: 16, defense: 20 }
  }
]

export type MonsterType = typeof MONSTER_TYPES[number]

/**
 * モンスター情報を取得
 * @param monsterId - モンスターID
 * @returns モンスター情報またはnull
 */
export function getMonsterById(monsterId: string) {
  return MONSTER_TYPES.find(monster => monster.id === monsterId) || null
}

/**
 * 全モンスター情報を取得
 * @returns モンスター情報の配列
 */
export function getAllMonsters() {
  return [...MONSTER_TYPES]
}

/**
 * マップ設定
 */
export const MAP_CONFIG = {
  width: 10,
  height: 8,
  startPosition: { x: 5, y: 4 }
}

/**
 * ゲーム状態を取得
 * @returns 現在のゲーム状態
 */
export function getGameState() {
  return {
    playerName: getStorageData<string>('player_name'),
    selectedMonster: getStorageData<typeof MONSTER_TYPES[0]>('selected_monster'),
    playerPosition: getStorageData<{ x: number; y: number }>('player_position', MAP_CONFIG.startPosition),
    gameState: getStorageData<string>('game_state', 'start')
  }
}

/**
 * ゲーム状態を更新
 * @param updates - 更新するデータ
 * @returns 更新成功の可否
 */
export function updateGameState(updates: {
  playerName?: string
  selectedMonster?: typeof MONSTER_TYPES[0]
  playerPosition?: { x: number; y: number }
  gameState?: string
}): boolean {
  try {
    if (updates.playerName !== undefined) {
      setStorageData('player_name', updates.playerName)
    }
    if (updates.selectedMonster !== undefined) {
      setStorageData('selected_monster', updates.selectedMonster)
    }
    if (updates.playerPosition !== undefined) {
      setStorageData('player_position', updates.playerPosition)
    }
    if (updates.gameState !== undefined) {
      setStorageData('game_state', updates.gameState)
    }
    return true
  } catch (error) {
    console.error('ゲーム状態の更新に失敗:', error)
    return false
  }
}

/**
 * ゲーム状態をリセット
 */
export function resetGameState(): void {
  const keys = ['player_name', 'selected_monster', 'player_position', 'game_state']
  keys.forEach(key => {
    localStorage.removeItem(key)
  })
}

/**
 * クラス名を条件付きで結合するユーティリティ
 * tailwind-mergeと同様の機能を簡易実装
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * 指定した時間だけ待機するPromise
 * @param ms - 待機時間（ミリ秒）
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}