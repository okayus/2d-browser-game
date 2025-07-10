/**
 * スタート画面コンポーネント
 * プレイヤー名入力とゲーム開始を管理
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { validatePlayerName, getStorageData, setStorageData } from '../lib/utils'
import { usePlayer } from '../hooks'

/**
 * スタート画面のメインコンポーネント
 * プロトタイプのindex.htmlの機能をReactで再実装
 */
export function StartPage() {
  // React Routerのナビゲーション機能
  const navigate = useNavigate()
  
  // プレイヤー管理フック
  const { isLoading: playerLoading, error: playerError, createPlayer, getPlayer, clearError } = usePlayer()
  
  // コンポーネントの状態管理
  const [playerName, setPlayerName] = useState('')
  const [success, setSuccess] = useState('')
  const [hasExistingGame, setHasExistingGame] = useState(false)
  
  // エラーは usePlayer フックから取得
  const error = playerError
  const isLoading = playerLoading

  /**
   * コンポーネント初期化時の処理
   * 既存のゲームデータをチェック
   */
  useEffect(() => {
    const existingPlayerName = getStorageData('player_name')
    const existingPlayerId = getStorageData('player_id')
    
    if (existingPlayerName && typeof existingPlayerName === 'string') {
      setPlayerName(existingPlayerName)
      setHasExistingGame(true)
      setSuccess(`既存のプレイヤー「${existingPlayerName}」が見つかりました`)
      
      // バックエンドからプレイヤー情報を取得（オプション）
      if (existingPlayerId && typeof existingPlayerId === 'string') {
        getPlayer(existingPlayerId).catch(() => {
          // エラーが発生しても続行（オフライン対応）
          console.warn('プレイヤー情報の取得に失敗しましたが、続行します')
        })
      }
    }
  }, [getPlayer])

  /**
   * プレイヤー名のリアルタイムバリデーション
   * 入力時に呼び出される
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPlayerName(value)
    
    // エラーメッセージをクリア（入力中は表示しない）
    if (error && value.length > 0) {
      clearError()
    }
  }

  /**
   * フォーム送信処理
   * プレイヤー名を検証し、プレイヤー作成画面に遷移
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // バリデーション実行
    const validation = validatePlayerName(playerName)
    if (!validation.isValid) {
      return // エラーは usePlayer フックで管理
    }

    // 成功メッセージを表示
    setSuccess('プレイヤーを作成中...')
    
    try {
      // バックエンドAPIでプレイヤーを作成
      const createdPlayer = await createPlayer(validation.name!)
      
      if (createdPlayer) {
        // ローカルストレージにも保存（プロトタイプ互換性のため）
        setStorageData('player_name', createdPlayer.name)
        setStorageData('game_state', 'player_creation')
        
        // 少し遅延してからプレイヤー作成画面に遷移
        setTimeout(() => {
          navigate('/player-creation')
        }, 1500)
      }
      
    } catch (err) {
      // エラーは usePlayer フックで管理されるため、ここでは何もしない
      console.error('プレイヤー作成エラー:', err)
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
      setPlayerName('')
      setHasExistingGame(false)
      clearError()
      setSuccess('ゲームデータをリセットしました。')
    }
  }

  /**
   * プレイヤー名のバリデーション結果を取得
   */
  const validation = validatePlayerName(playerName)
  const isSubmitDisabled = !validation.isValid || isLoading

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

        {/* プレイヤー作成フォーム */}
        <div style={{ animationDelay: '0.2s' }}>
          
          {/* メッセージエリア */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 animate-slide-up">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 animate-slide-up">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* プレイヤー名入力 */}
            <div>
              <label htmlFor="player-name" className="block text-sm font-semibold text-gray-700 mb-2">
                プレイヤー名を入力してください
              </label>
              <input
                type="text"
                id="player-name"
                value={playerName}
                onChange={handleNameChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="例: 太郎"
                maxLength={20}
                autoComplete="off"
                required
                aria-describedby="name-help"
              />
              <div id="name-help" className="mt-2 text-sm text-gray-500">
                3文字以上20文字以下で入力してください
              </div>
              <div className="mt-1 text-xs text-gray-400 text-right">
                {playerName.length} / 20文字
              </div>
            </div>

            {/* ゲーム説明 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">このゲームについて</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• モンスターを集めて育てるゲームです</li>
                <li>• マップを移動して新しいモンスターを発見</li>
                <li>• 学習目的で作られたプロトタイプです</li>
              </ul>
            </div>

            {/* 開始ボタン */}
            <button
              type="submit"
              className="w-full py-4 px-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
              disabled={isSubmitDisabled}
            >
              <span className="inline-flex items-center space-x-2">
                <span>🚀</span>
                <span>{isLoading ? '準備中...' : 'ゲーム開始'}</span>
              </span>
            </button>
          </form>

          {/* 追加オプション */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center space-y-3">
              {hasExistingGame && (
                <button
                  type="button"
                  onClick={handleContinueGame}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-300"
                >
                  既存のゲームを続ける
                </button>
              )}
              
              <button
                type="button"
                onClick={handleResetGame}
                className="block w-full text-gray-500 hover:text-gray-700 text-sm transition-colors duration-300"
              >
                ゲームデータをリセット
              </button>
            </div>
          </div>
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