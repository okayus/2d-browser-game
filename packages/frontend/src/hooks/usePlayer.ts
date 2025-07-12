/**
 * プレイヤー管理用のカスタムフック
 * プレイヤーの作成・取得・状態管理を行う
 * SessionManager統合版 - 将来の認証認可機能に対応
 * 
 * 初学者向けメモ：
 * - バックエンドAPIの英語レスポンス形式に対応
 * - 型安全性を確保しながらプレイヤー情報を管理
 * - SessionManagerでセッション管理を抽象化
 * - 将来のFirebase Auth等への対応を考慮した設計
 * - エラーハンドリングを統合
 */
import { useState, useCallback, useEffect } from 'react'
import { playerAPI, APIError } from '../api'
import { sessionManager } from '../lib/sessionManager'
import type { 
  PlayerCreationResponse, 
  PlayerResponse, 
  PlayerCreationData,
  InitialMonsterData 
} from '../types/api'

/**
 * プレイヤー情報の型定義
 */
interface PlayerData {
  id: string
  name: string
  createdAt: string
  initialMonster?: InitialMonsterData
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
 * SessionManager統合により、直接的なSessionStorage操作は不要
 * 代わりにsessionManagerインスタンスを使用してセッション管理を抽象化
 * 
 * 初学者向けメモ：
 * - sessionManagerが認証方式の詳細を隠蔽
 * - 将来の認証プロバイダー変更時も影響を受けない
 * - テスト時のモック化が容易
 */

/**
 * プレイヤー管理用のカスタムフック
 * SessionManager統合版 - 将来の認証認可機能に対応
 */
export function usePlayer(): UsePlayerReturn {
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attemptedPlayerId, setAttemptedPlayerId] = useState<string | null>(null)

  /**
   * 現在のプレイヤーIDをSessionManagerから取得
   * 
   * 初学者向けメモ：
   * - sessionManagerが実際のストレージ操作を抽象化
   * - LocalSessionManager、FirebaseSessionManager等の実装詳細を隠蔽
   * - 認証方式の変更時も呼び出し元コードは変更不要
   */
  const getCurrentPlayerId = useCallback((): string | null => {
    return sessionManager.getCurrentPlayerId()
  }, [])

  /**
   * プレイヤーIDをSessionManagerに保存
   * 
   * 初学者向けメモ：
   * - sessionManagerが適切なストレージ方式を選択
   * - Firebase Authの場合はユーザー情報と関連付け
   * - エラーハンドリングはSessionManager内で実装
   */
  const setCurrentPlayerId = useCallback((id: string): void => {
    sessionManager.setCurrentPlayerId(id)
  }, [])

  /**
   * プレイヤーセッションをクリア
   * 
   * 初学者向けメモ：
   * - sessionManagerがセッション情報を適切にクリア
   * - Firebase Authの場合はサインアウト処理も実行
   * - ローカル状態も併せてリセット
   */
  const clearSession = useCallback((): void => {
    sessionManager.clearSession()
    setPlayer(null)
    setError(null)
    setAttemptedPlayerId(null)
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
      /**
       * バックエンドAPIを呼び出し
       * 初学者向けメモ：英語レスポンス形式に対応した処理
       */
      const response = await playerAPI.create(name)
      
      if (response.success && response.data) {
        const playerData: PlayerData = {
          id: response.data.id,
          name: response.data.name,
          createdAt: response.data.createdAt,
          initialMonster: response.data.initialMonster || undefined
        }
        
        // SessionStorageにプレイヤーIDのみ保存
        setCurrentPlayerId(playerData.id)
        
        setPlayer(playerData)
        return playerData
      } else {
        const errorMsg = response.message || '予期しないレスポンス形式です'
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
      /**
       * バックエンドAPIを呼び出し
       * 初学者向けメモ：英語レスポンス形式に対応した処理
       */
      const response = await playerAPI.get(id)
      
      if (response.success && response.data) {
        const playerData: PlayerData = {
          id: response.data.id,
          name: response.data.name,
          createdAt: response.data.createdAt
        }
        
        setPlayer(playerData)
        return playerData
      } else {
        const errorMsg = response.message || 'プレイヤー情報が見つかりませんでした'
        setError(errorMsg)
        return null
      }
    } catch (err) {
      let errorMessage = 'プレイヤー情報の取得に失敗しました'
      
      if (err instanceof APIError) {
        // 404エラーの場合は、プレイヤーが存在しないことを示す
        if (err.status === 404) {
          errorMessage = 'プレイヤーが見つかりませんでした'
          // 存在しないプレイヤーIDはSessionStorageから削除
          try {
            sessionStorage.removeItem(CURRENT_PLAYER_KEY)
          } catch (error) {
            console.warn('SessionStorageのクリアに失敗:', error)
          }
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
    // 既に試行済みのIDか、現在ロード中の場合はスキップ
    if (playerId && playerId !== attemptedPlayerId && !player && !isLoading) {
      setAttemptedPlayerId(playerId)
      getPlayer(playerId)
    }
  }, [getCurrentPlayerId, getPlayer, player, isLoading, attemptedPlayerId])

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