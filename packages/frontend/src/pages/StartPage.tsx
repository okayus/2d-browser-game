/**
 * スタート画面コンポーネント
 * 認証状態に基づいてログイン・ゲーム開始を管理
 */
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getStorageData } from '../lib/utils'
import { usePlayer } from '../hooks'
import { useAuth } from '../contexts/AuthContext'

/**
 * スタート画面のメインコンポーネント
 * 認証状態に応じて適切な画面を表示
 */
export function StartPage() {
  // React Routerのナビゲーション機能
  const navigate = useNavigate()
  
  // 認証状態管理
  const { currentUser, loading: authLoading, logout } = useAuth()
  
  // プレイヤー管理フック
  const { error: playerError, clearError } = usePlayer()
  
  // コンポーネントの状態管理
  const [success, setSuccess] = useState('')
  const [hasExistingGame, setHasExistingGame] = useState(false)
  
  // エラーは usePlayer フックから取得
  const error = playerError

  /**
   * コンポーネント初期化時の処理
   * 認証状態とゲームデータをチェック
   */
  useEffect(() => {
    // 認証済みユーザーの場合、ゲーム状態をチェック
    if (currentUser) {
      const existingPlayerName = getStorageData('player_name')
      const gameState = getStorageData<string>('game_state', 'start')
      const selectedMonster = getStorageData('selected_monster')
      
      if (existingPlayerName && typeof existingPlayerName === 'string') {
        setHasExistingGame(true)
        setSuccess(`おかえりなさい、${currentUser.email || '冒険者'}さん！`)
        
        // ゲームが進行中の場合は自動で適切な画面に遷移
        if (selectedMonster && gameState === 'playing') {
          setTimeout(() => {
            setSuccess('ゲームを再開します...')
            navigate('/map')
          }, 2000)
        } else {
          setTimeout(() => {
            setSuccess('プレイヤー作成画面に移動します...')
            navigate('/player-creation')
          }, 2000)
        }
      }
    }
  }, [currentUser, navigate])

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    try {
      await logout()
      setSuccess('ログアウトしました')
      // ゲームデータをクリア
      localStorage.clear()
      setHasExistingGame(false)
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  /**
   * 既存ゲームの続行処理
   */
  const handleContinueGame = () => {
    const gameState = getStorageData<string>('game_state', 'start')
    const selectedMonster = getStorageData('selected_monster')
    
    if (selectedMonster && gameState === 'playing') {
      // マップ画面に遷移
      setSuccess('ゲームを再開します...')
      setTimeout(() => navigate('/map'), 1000)
    } else {
      // プレイヤー作成画面に遷移
      setSuccess('プレイヤー作成画面に移動します...')
      setTimeout(() => navigate('/player-creation'), 1000)
    }
  }

  /**
   * ゲームリセット処理
   */
  const handleResetGame = () => {
    if (confirm('すべてのゲームデータがリセットされます。本当によろしいですか？')) {
      // LocalStorageをクリア
      localStorage.clear()
      
      // 状態をリセット
      setHasExistingGame(false)
      clearError()
      setSuccess('ゲームデータをリセットしました。')
    }
  }

  // デバッグ情報をコンソールに出力
  React.useEffect(() => {
    console.log('StartPage Debug Info:', {
      currentUser: currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified
      } : null,
      authLoading,
      hasExistingGame,
      gameState: getStorageData<string>('game_state', 'start'),
      selectedMonster: getStorageData('selected_monster'),
      pathname: location.pathname
    })
  }, [currentUser, authLoading, hasExistingGame])

  // 認証状態の確認
  if (authLoading) {
    return (
      <div className="prototype-background">
        <div className="prototype-card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-white">認証状態を確認中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="prototype-background">
      <div className="prototype-card">
        
        {/* ヒーローセクション */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="animate-pulse-slow">
            <h1 className="text-6xl mb-4">🎮</h1>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              モンスター収集ゲーム
            </h1>
          </div>
          <p className="text-white/90 text-lg mb-2">
            プログラミング学習用プロジェクト
          </p>
          <p className="text-white/70 text-sm">
            TypeScript + React + Hono + Cloudflare
          </p>
        </div>

        {/* メッセージエリア */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 animate-slide-up" data-testid="validation-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 animate-slide-up" data-testid="success-message">
            {success}
          </div>
        )}

        {/* 認証状態に応じたコンテンツ */}
        <div style={{ animationDelay: '0.2s' }}>
          {currentUser ? (
            /* 認証済みユーザー向け */
            <div className="space-y-6">
              {/* ユーザー情報 */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">
                  ようこそ、{currentUser.email}さん！
                </h3>
                <p className="text-sm text-green-800">
                  Firebase認証でログイン済みです
                </p>
              </div>

              {/* ゲーム開始・続行ボタン */}
              {hasExistingGame ? (
                <button
                  type="button"
                  onClick={handleContinueGame}
                  className="w-full py-4 px-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center"
                  data-testid="continue-game-button"
                >
                  <span className="inline-flex items-center space-x-2">
                    <span>▶️</span>
                    <span>ゲームを続ける</span>
                  </span>
                </button>
              ) : (
                <Link
                  to="/player-creation"
                  onClick={() => {
                    console.log('ゲーム開始ボタンクリック:', {
                      currentUser: currentUser?.email,
                      targetPath: '/player-creation',
                      hasExistingGame
                    })
                  }}
                  className="w-full py-4 px-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center"
                >
                  <span className="inline-flex items-center space-x-2">
                    <span>🚀</span>
                    <span>ゲーム開始</span>
                  </span>
                </Link>
              )}

              {/* ユーザーオプション */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center space-y-3">
                  <button
                    type="button"
                    onClick={handleResetGame}
                    className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-300"
                    data-testid="reset-game-button"
                  >
                    ゲームデータをリセット
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-red-500 hover:text-red-700 text-sm transition-colors duration-300"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 未認証ユーザー向け */
            <div className="space-y-6">
              {/* ゲーム説明 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">このゲームについて</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• モンスターを集めて育てるゲームです</li>
                  <li>• マップを移動して新しいモンスターを発見</li>
                  <li>• 学習目的で作られたプロトタイプです</li>
                </ul>
              </div>

              {/* 認証ボタン */}
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="w-full py-4 px-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center"
                >
                  <span className="inline-flex items-center space-x-2">
                    <span>🔐</span>
                    <span>ログイン</span>
                  </span>
                </Link>

                <Link
                  to="/register"
                  className="w-full py-4 px-6 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center"
                >
                  <span className="inline-flex items-center space-x-2">
                    <span>✨</span>
                    <span>新規登録</span>
                  </span>
                </Link>
              </div>

              {/* 認証の説明 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">始める前に</h4>
                <p className="text-sm text-gray-700">
                  ゲームを始めるには、ログインまたは新規登録が必要です。
                  Firebase認証を使用して、安全にアカウントを管理します。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* フッター情報 */}
        <div className="text-center mt-8 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p>学習用プロジェクト | 初学者向けプログラミング教材</p>
          <p className="mt-1">React + TypeScript 実装</p>
        </div>
      </div>
    </div>
  )
}