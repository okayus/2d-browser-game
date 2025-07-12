/**
 * スタート画面コンポーネント
 * プレイヤー名入力とゲーム開始を管理
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { validatePlayerName } from '../lib/utils'
import { usePlayer } from '../hooks'

/**
 * スタート画面のメインコンポーネント
 * プロトタイプのindex.htmlの機能をReactで再実装
 */
export function StartPage() {
  // React Routerのナビゲーション機能
  const navigate = useNavigate()
  
  // プレイヤー管理フック
  const { 
    player, 
    isLoading: playerLoading, 
    error: playerError, 
    createPlayer, 
    getCurrentPlayerId,
    clearSession,
    clearError 
  } = usePlayer()
  
  // コンポーネントの状態管理
  const [playerName, setPlayerName] = useState('')
  const [success, setSuccess] = useState('')
  const [hasExistingGame, setHasExistingGame] = useState(false)
  const [gameMode, setGameMode] = useState<'new' | 'continue' | 'choose'>('choose')
  
  // エラーは usePlayer フックから取得
  const error = playerError
  const isLoading = playerLoading

  /**
   * コンポーネント初期化時の処理
   * 既存のプレイヤーをチェックし、適切なモードを設定
   * 
   * 初学者向けメモ：
   * - 既存プレイヤーがいる場合は選択肢を表示
   * - 新規作成と継続を明確に分離
   */
  useEffect(() => {
    // usePlayerフックが自動的にSessionStorageからロードするため、
    // player情報が取得できた場合は既存ゲーム扱い
    if (player) {
      setHasExistingGame(true)
      setGameMode('choose')
      setSuccess(`既存のプレイヤー「${player.name}」が見つかりました`)
    } else {
      // プレイヤーIDがあるがロードに失敗した場合の処理
      const playerId = getCurrentPlayerId()
      if (playerId && !playerError) {
        // 404エラーの場合はSessionStorageがクリアされるので、エラーは表示しない
        setHasExistingGame(false)
        setGameMode('new')
      } else {
        // 完全に新規の場合
        setHasExistingGame(false)
        setGameMode('new')
      }
    }
  }, [player, getCurrentPlayerId, playerError])

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
   * 新規プレイヤー作成処理
   * 既存データをクリアしてから新しいプレイヤーを作成
   */
  const handleCreateNewPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // バリデーション実行
    const validation = validatePlayerName(playerName)
    if (!validation.isValid) {
      return // エラーは usePlayer フックで管理
    }

    // 既存データをクリアしてから新規作成
    if (hasExistingGame) {
      clearSession()
      setHasExistingGame(false)
    }

    // 成功メッセージを表示
    setSuccess('プレイヤーを作成中...')
    
    try {
      // バックエンドAPIでプレイヤーを作成
      const createdPlayer = await createPlayer(validation.name!)
      
      if (createdPlayer) {
        setSuccess(`プレイヤー「${createdPlayer.name}」を作成しました！`)
        
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
   * 既存プレイヤーの場合はプレイヤー作成画面経由でマップに遷移
   * 
   * 初学者向けメモ：
   * - PlayerCreationPageで適切な条件分岐を行い、自動的にマップに遷移
   * - SessionStorageのプレイヤーIDを保持したまま遷移
   */
  const handleContinueGame = () => {
    if (player) {
      setSuccess(`プレイヤー「${player.name}」で続行します...`)
      setTimeout(() => navigate('/player-creation'), 1000)
    }
  }

  /**
   * 新規プレイヤー作成モードに切り替え
   */
  const handleSwitchToNewMode = () => {
    setGameMode('new')
    setPlayerName('')
    setSuccess('')
    clearError()
  }

  /**
   * モード選択に戻る
   */
  const handleBackToChoose = () => {
    setGameMode('choose')
    setPlayerName('')
    setSuccess('')
    clearError()
  }

  /**
   * ゲームリセット処理
   */
  const handleResetGame = () => {
    if (confirm('プレイヤーセッションがリセットされます。本当によろしいですか？')) {
      // プレイヤーセッションをクリア
      clearSession()
      
      // 状態をリセット
      setPlayerName('')
      setHasExistingGame(false)
      setSuccess('プレイヤーセッションをリセットしました。')
    }
  }

  /**
   * プレイヤー名のバリデーション結果を取得
   */
  const validation = validatePlayerName(playerName)
  const isSubmitDisabled = !validation.isValid || isLoading

  /**
   * 現在のゲームモードに応じた表示制御
   */
  const shouldShowForm = gameMode === 'new'
  const shouldShowChoiceButtons = gameMode === 'choose' && hasExistingGame
  const shouldShowContinueOption = hasExistingGame && gameMode !== 'new'

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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 animate-slide-up" data-testid="validation-error">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 animate-slide-up" data-testid="success-message">
              {success}
            </div>
          )}

          {shouldShowChoiceButtons && (
            <div className="space-y-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                既存のプレイヤーが見つかりました
              </h2>
              <p className="text-gray-600 text-center">
                プレイヤー「{player?.name}」で続行しますか？
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleContinueGame}
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                  data-testid="continue-existing-button"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>🔄</span>
                    <span>続行する</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSwitchToNewMode}
                  className="py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200"
                  data-testid="create-new-button"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>✨</span>
                    <span>新規作成</span>
                  </span>
                </button>
              </div>
            </div>
          )}

          {shouldShowForm && (
            <form onSubmit={handleCreateNewPlayer} className="space-y-6" data-testid="player-form">
            
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
                data-testid="player-name-input"
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
              <div className="flex space-x-4">
                {shouldShowContinueOption && (
                  <button
                    type="button"
                    onClick={handleBackToChoose}
                    className="flex-1 py-4 px-6 text-lg bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200"
                    data-testid="back-button"
                  >
                    <span className="inline-flex items-center space-x-2">
                      <span>←</span>
                      <span>戻る</span>
                    </span>
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-4 px-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                  disabled={isSubmitDisabled}
                  data-testid="start-game-button"
                >
                  <span className="inline-flex items-center space-x-2">
                    <span>🚀</span>
                    <span>{isLoading ? '準備中...' : 'ゲーム開始'}</span>
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* 追加オプション */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={handleResetGame}
                className="block w-full text-gray-500 hover:text-gray-700 text-sm transition-colors duration-300"
                data-testid="reset-game-button"
              >
                すべてのゲームデータをリセット
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