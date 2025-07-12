/**
 * モンスター管理用のカスタムフック
 * 所持モンスターの取得・更新・削除を行う
 */
import { useState, useCallback } from 'react'
import { monsterAPI, APIError } from '../api'
import type { MonsterListResponse, MonsterUpdateResponse, MonsterDeleteResponse } from '../types/api'
import { MONSTER_TYPES, type MonsterType } from '../lib/utils'

/**
 * 所持モンスター情報の型定義
 */
export interface OwnedMonster {
  id: string
  playerId: string
  speciesId: string
  nickname: string
  currentHp: number
  maxHp: number
  capturedAt: string
  species: MonsterType
}

/**
 * useMonstersフックの戻り値型
 */
interface UseMonstersReturn {
  /** 所持モンスター一覧 */
  monsters: OwnedMonster[]
  /** ローディング状態 */
  isLoading: boolean
  /** エラーメッセージ */
  error: string | null
  /** モンスター一覧取得関数 */
  loadMonsters: (playerId: string) => Promise<void>
  /** モンスター一覧を強制リフレッシュ */
  refreshMonsters: () => Promise<void>
  /** ニックネーム更新関数 */
  updateNickname: (monsterId: string, nickname: string) => Promise<boolean>
  /** モンスター解放関数 */
  releaseMonster: (monsterId: string) => Promise<boolean>
  /** エラーをクリア */
  clearError: () => void
}

/**
 * モンスター管理用のカスタムフック
 * MVPのCRUD操作をAPIクライアントと統合
 */
export function useMonsters(): UseMonstersReturn {
  const [monsters, setMonsters] = useState<OwnedMonster[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null)

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * モンスター種族情報を取得
   * @param speciesId - 種族ID
   * @returns 種族情報
   */
  const getSpeciesInfo = (speciesId: string) => {
    return MONSTER_TYPES.find(species => species.id === speciesId)
  }

  /**
   * プレイヤーの所持モンスター一覧を取得
   * @param playerId - プレイヤーID
   */
  const loadMonsters = useCallback(async (playerId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    setCurrentPlayerId(playerId)

    try {
      // バックエンドAPIを呼び出し
      const response = await monsterAPI.listByPlayer(playerId)
      
      if (response.success && response.data) {
        // APIレスポンス（英語キー）をOwnedMonster形式に変換
        const ownedMonsters: OwnedMonster[] = response.data.monsters?.map((monster: any) => {
          const species = getSpeciesInfo(monster.speciesId || monster.species?.id || '')
          
          if (!species) {
            console.warn(`未知の種族ID: ${monster.speciesId || monster.species?.id}`)
            // デフォルトの種族情報を設定
            return {
              id: monster.id,
              playerId: playerId, // プレイヤーIDは引数から設定
              speciesId: monster.speciesId || monster.species?.id || '',
              nickname: monster.nickname || monster.species?.name || '',
              currentHp: monster.currentHp || 0,
              maxHp: monster.maxHp || 100,
              capturedAt: monster.capturedAt || new Date().toISOString(),
              species: MONSTER_TYPES[0] // フォールバック
            }
          }
          
          return {
            id: monster.id,
            playerId: playerId,
            speciesId: monster.speciesId || monster.species?.id,
            nickname: monster.nickname || monster.species?.name,
            currentHp: monster.currentHp,
            maxHp: monster.maxHp,
            capturedAt: monster.capturedAt,
            species
          }
        }) || []
        
        setMonsters(ownedMonsters)
      } else {
        setError('モンスター情報の取得に失敗しました')
      }
    } catch (err) {
      let errorMessage = 'モンスター一覧の取得に失敗しました'
      
      if (err instanceof APIError) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 現在のプレイヤーIDでモンスター一覧を強制リフレッシュ
   */
  const refreshMonsters = useCallback(async (): Promise<void> => {
    if (currentPlayerId) {
      await loadMonsters(currentPlayerId)
    }
  }, [currentPlayerId, loadMonsters])

  /**
   * モンスターのニックネームを更新
   * @param monsterId - モンスターID
   * @param nickname - 新しいニックネーム
   * @returns 更新成功の可否
   */
  const updateNickname = useCallback(async (monsterId: string, nickname: string): Promise<boolean> => {
    setError(null)

    try {
      // バックエンドAPIを呼び出し
      const response = await monsterAPI.updateNickname(monsterId, nickname)
      
      if (response.success) {
        // ローカル状態を更新
        setMonsters(prev => prev.map(monster =>
          monster.id === monsterId
            ? { ...monster, nickname }
            : monster
        ))
        
        return true
      } else {
        setError('ニックネームの更新に失敗しました')
        return false
      }
    } catch (err) {
      let errorMessage = 'ニックネームの更新に失敗しました'
      
      if (err instanceof APIError) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      return false
    }
  }, [])

  /**
   * モンスターを解放（削除）
   * @param monsterId - モンスターID
   * @returns 解放成功の可否
   */
  const releaseMonster = useCallback(async (monsterId: string): Promise<boolean> => {
    setError(null)

    try {
      // バックエンドAPIを呼び出し
      const response = await monsterAPI.release(monsterId)
      
      if (response.success) {
        // ローカル状態から削除
        setMonsters(prev => prev.filter(monster => monster.id !== monsterId))
        
        return true
      } else {
        setError('モンスターの解放に失敗しました')
        return false
      }
    } catch (err) {
      let errorMessage = 'モンスターの解放に失敗しました'
      
      if (err instanceof APIError) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      return false
    }
  }, [])

  return {
    monsters,
    isLoading,
    error,
    loadMonsters,
    refreshMonsters,
    updateNickname,
    releaseMonster,
    clearError
  }
}