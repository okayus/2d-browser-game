/**
 * プレイヤー管理用のカスタムフック
 * プレイヤーの作成・取得・状態管理を行う
 */
import { useState, useCallback } from 'react'
import { playerApi, handleApiError } from '../lib/api'
import { setStorageData } from '../lib/utils'

/**
 * プレイヤー情報の型定義
 */
interface PlayerData {
  id: string
  name: string
  createdAt: string
  initialMonsterId?: string
}

/**
 * usePlayerフックの戻り値型
 */
interface UsePlayerReturn {
  /** プレイヤー情報 */
  player: PlayerData | null
  /** ローディング状態 */
  isLoading: boolean
  /** エラーメッセージ */
  error: string | null
  /** プレイヤー作成関数 */
  createPlayer: (name: string, selectedMonsterSpecies?: string) => Promise<PlayerData | null>
  /** プレイヤー情報取得関数 */
  getPlayer: (id: string) => Promise<PlayerData | null>
  /** エラーをクリア */
  clearError: () => void
}

/**
 * プレイヤー管理用のカスタムフック
 * プロトタイプのLocalStorage管理とAPIクライアントを統合
 */
export function usePlayer(): UsePlayerReturn {
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * プレイヤー作成
   * @param name - プレイヤー名
   * @param selectedMonsterSpecies - 選択されたモンスター種族名
   * @returns 作成されたプレイヤー情報またはnull
   */
  const createPlayer = useCallback(async (name: string, selectedMonsterSpecies?: string): Promise<PlayerData | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // 新しいAPIクライアントを使用
      const requestBody: { name: string; selectedMonsterSpecies?: string } = { name }
      if (selectedMonsterSpecies) {
        requestBody.selectedMonsterSpecies = selectedMonsterSpecies
      }
      const response = await playerApi.create(requestBody)
      
      const apiResponse = response as {
        id: string;
        name: string;
        createdAt: string;
        initialMonster?: { id: string };
      };
      
      const playerData: PlayerData = {
        id: apiResponse.id,
        name: apiResponse.name,
        createdAt: apiResponse.createdAt,
        initialMonsterId: apiResponse.initialMonster?.id || undefined
      }
      
      // ローカルストレージに保存
      setStorageData('player_id', playerData.id)
      setStorageData('player_name', playerData.name)
      
      setPlayer(playerData)
      return playerData
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * プレイヤー情報取得
   * @param id - プレイヤーID
   * @returns プレイヤー情報またはnull
   */
  const getPlayer = useCallback(async (id: string): Promise<PlayerData | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // 新しいAPIクライアントを使用
      const response = await playerApi.getById(id)
      
      const apiResponse = response as {
        id: string;
        name: string;
        createdAt: string;
      };
      
      const playerData: PlayerData = {
        id: apiResponse.id,
        name: apiResponse.name,
        createdAt: apiResponse.createdAt
      }
      
      setPlayer(playerData)
      return playerData
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    player,
    isLoading,
    error,
    createPlayer,
    getPlayer,
    clearError
  }
}