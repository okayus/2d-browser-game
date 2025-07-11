/**
 * プレイヤー管理用のカスタムフック
 * プレイヤーの作成・取得・状態管理を行う
 * 完全API統合版 - LocalStorage依存を排除
 */
import { useState, useCallback, useEffect } from 'react'
import { playerAPI, APIError } from '../api'
import type { PlayerCreationResponse, PlayerResponse } from '../types/api'

/**
 * プレイヤー情報の型定義
 */
interface PlayerData {
  id: string
  name: string
  createdAt: string
  initialMonsterId?: string
  monsters?: Array<{
    id: string
    speciesId: string
    nickname: string
    currentHp: number
    maxHp: number
    capturedAt: string
  }>
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
  createPlayer: (name: string) => Promise<PlayerData | null>
  /** プレイヤー情報取得関数 */
  getPlayer: (id: string) => Promise<PlayerData | null>
  /** 現在のプレイヤーIDをSessionStorageから取得 */
  getCurrentPlayerId: () => string | null
  /** プレイヤーIDをSessionStorageに保存 */
  setCurrentPlayerId: (id: string) => void
  /** プレイヤーセッションをクリア */
  clearSession: () => void
  /** エラーをクリア */
  clearError: () => void
}

/**
 * SessionStorage管理のヘルパー関数
 */
const CURRENT_PLAYER_KEY = 'current_player_id'

/**
 * プレイヤー管理用のカスタムフック
 * 完全API統合版 - SessionStorageでプレイヤーIDのみ管理
 */
export function usePlayer(): UsePlayerReturn {
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 現在のプレイヤーIDをSessionStorageから取得
   */
  const getCurrentPlayerId = useCallback((): string | null => {
    try {
      return sessionStorage.getItem(CURRENT_PLAYER_KEY)
    } catch {
      return null
    }
  }, [])

  /**
   * プレイヤーIDをSessionStorageに保存
   */
  const setCurrentPlayerId = useCallback((id: string): void => {
    try {
      sessionStorage.setItem(CURRENT_PLAYER_KEY, id)
    } catch (error) {
      console.warn('SessionStorageへの保存に失敗:', error)
    }
  }, [])

  /**
   * プレイヤーセッションをクリア
   */
  const clearSession = useCallback((): void => {
    try {
      sessionStorage.removeItem(CURRENT_PLAYER_KEY)
    } catch (error) {
      console.warn('SessionStorageのクリアに失敗:', error)
    }
    setPlayer(null)
    setError(null)
  }, [])

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * プレイヤー作成
   * @param name - プレイヤー名
   * @returns 作成されたプレイヤー情報またはnull
   */
  const createPlayer = useCallback(async (name: string): Promise<PlayerData | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // バックエンドAPIを呼び出し
      const response = await playerAPI.create(name) as unknown as PlayerCreationResponse
      
      if (response.success && response.data) {
        const playerData: PlayerData = {
          id: response.data.id,
          name: response.data.name,
          createdAt: response.data.createdAt,
          initialMonsterId: response.data.initialMonsterId || undefined
        }
        
        // SessionStorageにプレイヤーIDのみ保存
        setCurrentPlayerId(playerData.id)
        
        setPlayer(playerData)
        return playerData
      } else {
        const errorMsg = '予期しないレスポンス形式です'
        setError(errorMsg)
        return null
      }
    } catch (err) {
      let errorMessage = 'プレイヤーの作成に失敗しました'
      
      if (err instanceof APIError) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
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
      // バックエンドAPIを呼び出し
      const response = await playerAPI.get(id) as unknown as PlayerResponse
      
      if (response.success && response.data) {
        const playerData: PlayerData = {
          id: response.data.id,
          name: response.data.name,
          createdAt: response.data.createdAt
        }
        
        setPlayer(playerData)
        return playerData
      } else {
        const errorMsg = 'プレイヤー情報が見つかりませんでした'
        setError(errorMsg)
        return null
      }
    } catch (err) {
      let errorMessage = 'プレイヤー情報の取得に失敗しました'
      
      if (err instanceof APIError) {
        // 404エラーの場合は、プレイヤーが存在しないことを示す
        if (err.status === 404) {
          errorMessage = 'プレイヤーが見つかりませんでした'
        } else {
          errorMessage = err.message
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 初期化時の自動ログイン処理
   * SessionStorageにプレイヤーIDがあれば自動で読み込み
   */
  useEffect(() => {
    const playerId = getCurrentPlayerId()
    if (playerId && !player && !isLoading) {
      getPlayer(playerId)
    }
  }, [getCurrentPlayerId, getPlayer, player, isLoading])

  return {
    player,
    isLoading,
    error,
    createPlayer,
    getPlayer,
    getCurrentPlayerId,
    setCurrentPlayerId,
    clearSession,
    clearError
  }
}