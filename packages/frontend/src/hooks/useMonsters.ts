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

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * モンスター種族情報を取得（種族名ベース）
   * @param speciesName - 種族名
   * @returns 種族情報
   */
  const getSpeciesInfoByName = (speciesName: string) => {
    return MONSTER_TYPES.find(species => species.name === speciesName)
  }

  /**
   * プレイヤーの所持モンスター一覧を取得
   * @param playerId - プレイヤーID
   */
  const loadMonsters = useCallback(async (playerId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // バックエンドAPIを呼び出し
      const response = await monsterAPI.listByPlayer(playerId) as unknown as MonsterListResponse
      
      if (response.success && response.data) {
        // APIレスポンスをOwnedMonster形式に変換
        const monstersData = Array.isArray(response.data) ? response.data : (response.data as { monsters?: unknown[] }).monsters || [];
        const ownedMonsters: OwnedMonster[] = monstersData.map((monster: unknown) => {
          const monsterData = monster as {
            id: string;
            speciesId: string;
            ニックネーム: string;
            現在hp: number;
            最大hp: number;
            取得日時: number | Date | string;
            種族: {
              id: string;
              名前: string;
              基本hp: number;
            } | null;
          };
          
          // 種族情報の取得（種族名ベース）
          const speciesName = monsterData.種族?.名前 || '不明'
          const species = getSpeciesInfoByName(speciesName)
          
          if (!species) {
            console.warn(`未知の種族名: ${speciesName}`)
            // デフォルトの種族情報を設定
            return {
              id: monsterData.id,
              playerId: playerId,
              speciesId: monsterData.speciesId,
              nickname: monsterData.ニックネーム,
              currentHp: monsterData.現在hp,
              maxHp: monsterData.最大hp,
              capturedAt: monsterData.取得日時 
                ? new Date(typeof monsterData.取得日時 === 'number' 
                    ? monsterData.取得日時 * 1000 
                    : monsterData.取得日時).toISOString()
                : new Date().toISOString(), // フォールバック値
              species: MONSTER_TYPES[0] // フォールバック
            }
          }
          
          return {
            id: monsterData.id,
            playerId: playerId,
            speciesId: monsterData.speciesId,
            nickname: monsterData.ニックネーム,
            currentHp: monsterData.現在hp,
            maxHp: monsterData.最大hp,
            capturedAt: monsterData.取得日時 
              ? new Date(typeof monsterData.取得日時 === 'number' 
                  ? monsterData.取得日時 * 1000 
                  : monsterData.取得日時).toISOString()
              : new Date().toISOString(), // フォールバック値
            species
          }
        })
        
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
   * モンスターのニックネームを更新
   * @param monsterId - モンスターID
   * @param nickname - 新しいニックネーム
   * @returns 更新成功の可否
   */
  const updateNickname = useCallback(async (monsterId: string, nickname: string): Promise<boolean> => {
    setError(null)

    try {
      // バックエンドAPIを呼び出し
      const response = await monsterAPI.updateNickname(monsterId, nickname) as unknown as MonsterUpdateResponse
      
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
      const response = await monsterAPI.release(monsterId) as unknown as MonsterDeleteResponse
      
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
    updateNickname,
    releaseMonster,
    clearError
  }
}