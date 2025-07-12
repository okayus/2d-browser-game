/**
 * 認証状態管理の抽象化フック
 * 
 * 初学者向けメモ：
 * - 現在はシンプルなセッション管理
 * - 将来のFirebase Auth、Auth0等への拡張を考慮した設計
 * - 認証状態の変更を全コンポーネントに通知するReact Context機能
 * - ログイン・ログアウト・認証状態確認の統一インターフェース
 */

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react'
import { sessionManager } from '../lib/sessionManager'

/**
 * 認証状態の型定義
 */
export interface AuthState {
  /** 認証済みかどうか */
  isAuthenticated: boolean
  /** 現在のプレイヤーID（認証済みの場合） */
  playerId: string | null
  /** 認証トークン（将来用） */
  authToken: string | null
  /** 認証処理中フラグ */
  isLoading: boolean
  /** 認証エラー */
  error: string | null
}

/**
 * 認証アクションの型定義
 */
export interface AuthActions {
  /** ログイン処理（現在はプレイヤーID設定） */
  login: (playerId: string) => Promise<void>
  /** ログアウト処理 */
  logout: () => Promise<void>
  /** 認証状態の更新 */
  refreshAuth: () => Promise<void>
  /** エラーのクリア */
  clearError: () => void
}

/**
 * useAuthフックの戻り値型
 */
export type UseAuthReturn = AuthState & AuthActions

/**
 * 認証コンテキストの型定義
 */
type AuthContextType = UseAuthReturn | null

/**
 * 認証コンテキストの作成
 * アプリケーション全体で認証状態を共有
 */
const AuthContext = createContext<AuthContextType>(null)

/**
 * 認証状態管理の内部実装
 * 
 * 初学者向けメモ：
 * - SessionManagerを使用してストレージ操作を抽象化
 * - 認証状態の変更時に関連するコンポーネントを自動更新
 * - エラーハンドリングと読み込み状態の管理
 */
function useAuthImpl(): UseAuthReturn {
  // 認証状態の管理
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    playerId: null,
    authToken: null,
    isLoading: true, // 初期化時は読み込み中
    error: null
  })

  /**
   * セッション状態の初期化
   * アプリケーション起動時に既存のセッションを確認
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const playerId = sessionManager.getCurrentPlayerId()
        const isValid = sessionManager.isSessionValid()
        const authToken = sessionManager.getAuthToken()

        setAuthState({
          isAuthenticated: isValid && playerId !== null,
          playerId: isValid ? playerId : null,
          authToken,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('認証状態の初期化に失敗:', error)
        setAuthState({
          isAuthenticated: false,
          playerId: null,
          authToken: null,
          isLoading: false,
          error: error instanceof Error ? error.message : '認証エラーが発生しました'
        })
      }
    }

    initializeAuth()
  }, [])

  /**
   * ログイン処理
   * 現在の実装ではプレイヤーIDの設定のみ
   * 将来：Firebase Authのサインイン、JWTトークンの取得等
   */
  const login = useCallback(async (playerId: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // SessionManagerを使用してプレイヤーIDを保存
      sessionManager.setCurrentPlayerId(playerId)
      
      // 認証トークンの取得（将来用）
      const authToken = sessionManager.getAuthToken()

      setAuthState({
        isAuthenticated: true,
        playerId,
        authToken,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('ログインに失敗:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'ログインに失敗しました'
      }))
      throw error
    }
  }, [])

  /**
   * ログアウト処理
   * セッション情報のクリアと認証状態のリセット
   */
  const logout = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // SessionManagerを使用してセッションをクリア
      sessionManager.clearSession()

      setAuthState({
        isAuthenticated: false,
        playerId: null,
        authToken: null,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('ログアウトに失敗:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'ログアウトに失敗しました'
      }))
      throw error
    }
  }, [])

  /**
   * 認証状態の更新
   * トークンの有効期限確認や最新状態の取得
   */
  const refreshAuth = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const playerId = sessionManager.getCurrentPlayerId()
      const isValid = sessionManager.isSessionValid()
      const authToken = sessionManager.getAuthToken()

      setAuthState({
        isAuthenticated: isValid && playerId !== null,
        playerId: isValid ? playerId : null,
        authToken,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('認証状態の更新に失敗:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '認証状態の更新に失敗しました'
      }))
    }
  }, [])

  /**
   * エラーのクリア
   */
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...authState,
    login,
    logout,
    refreshAuth,
    clearError
  }
}

/**
 * 認証プロバイダーコンポーネント
 * アプリケーションのルートで使用し、全体に認証状態を提供
 * 
 * @param children - 子コンポーネント
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthImpl()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * 認証フックの公開インターフェース
 * コンポーネントから認証状態とアクションにアクセス
 * 
 * 初学者向けメモ：
 * - 任意のコンポーネントで認証状態を取得・操作可能
 * - AuthProviderの内部で使用する必要がある
 * - 認証状態の変更は自動的に全コンポーネントに反映
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext)
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * 認証が必要なページ用のガードフック
 * 認証されていない場合の処理を統一
 * 
 * @param redirectTo - 認証されていない場合のリダイレクト先
 * @returns 認証状態とリダイレクト関数
 */
export function useRequireAuth(redirectTo: string = '/') {
  const auth = useAuth()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // 認証されていない場合はリダイレクト
      // 実際のリダイレクト処理は呼び出し元で実装
      console.warn(`認証が必要です。${redirectTo}にリダイレクトしてください。`)
    }
  }, [auth.isAuthenticated, auth.isLoading, redirectTo])

  return {
    ...auth,
    shouldRedirect: !auth.isLoading && !auth.isAuthenticated
  }
}

/**
 * 初学者向けメモ：useAuth設計の利点
 * 
 * 1. **状態の一元管理**
 *    - 認証状態をアプリケーション全体で共有
 *    - 複数コンポーネントでの状態同期が自動化
 *    - 状態の不整合を防止
 * 
 * 2. **将来の拡張性**
 *    - Firebase Authの導入時は内部実装のみ変更
 *    - コンポーネント側のAPIは変更不要
 *    - 段階的な認証機能強化が可能
 * 
 * 3. **テスタビリティ**
 *    - AuthProviderをモックして単体テスト
 *    - 認証状態を制御したインテグレーションテスト
 *    - ストーリーブックでの認証状態別表示確認
 * 
 * 4. **エラーハンドリング**
 *    - 認証エラーの統一的な処理
 *    - 自動リトライやフォールバック機能
 *    - ユーザーフレンドリーなエラーメッセージ
 * 
 * 5. **パフォーマンス最適化**
 *    - useCallbackによる不要な再レンダリング防止
 *    - 認証状態の効率的な更新
 *    - メモ化による計算結果のキャッシュ
 */