/**
 * プレイヤー作成画面コンポーネント
 * パートナーモンスターの選択を管理
 * API統合版 - usePlayerフック使用
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../hooks/usePlayer'
import { monsterAPI } from '../api'
import { getAllMonsters, type MonsterType } from '../lib/utils'

/**
 * プレイヤー作成画面のメインコンポーネント
 * API統合版 - プレイヤー情報をAPIで管理
 */
export function PlayerCreationPage() {
  const navigate = useNavigate()
  const { player, createPlayer, getCurrentPlayerId, isLoading: playerLoading, error: playerError } = usePlayer()
  
  // 状態管理
  const [playerName, setPlayerName] = useState('')
  const [selectedMonster, setSelectedMonster] = useState<MonsterType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // モンスター種族の一覧を取得
  const monsters = getAllMonsters()

  /**
   * コンポーネント初期化
   * プレイヤー情報の確認
   */
  useEffect(() => {
    console.log('PlayerCreationPage useEffect:', { player, playerLoading, getCurrentPlayerId: getCurrentPlayerId() })
    
    // プレイヤー情報の取得が完了するまで待機
    if (playerLoading) {
      console.log('プレイヤー情報読み込み中...')
      return
    }
    
    if (!player) {
      // プレイヤー情報がない場合はスタート画面に戻る
      console.log('プレイヤー情報なし、スタート画面に遷移')
      navigate('/')
      return
    }
    
    // プレイヤー情報が取得できた場合の処理
    setPlayerName(player.name)
    
    /**
     * 既存プレイヤーの判定と自動遷移
     * 初学者向けメモ：
     * - SessionStorageからプレイヤーIDが読み込まれた場合は既存プレイヤー
     * - 既存プレイヤーはモンスター選択をスキップしてマップ画面に直接遷移
     * - 新規プレイヤーの場合のみモンスター選択画面を表示
     */
    const playerId = getCurrentPlayerId()
    console.log('プレイヤーID確認:', { playerId, playerIdMatch: player.id === playerId })
    
    if (playerId && player.id === playerId) {
      console.log('既存プレイヤー検出、マップ画面に遷移')
      navigate('/map')
    } else {
      console.log('新規プレイヤー、モンスター選択画面を表示')
    }
  }, [player, playerLoading, navigate, getCurrentPlayerId])

  /**
   * モンスター選択処理
   * @param monster - 選択されたモンスター
   */
  const handleMonsterSelect = (monster: MonsterType) => {
    setSelectedMonster(monster)
    setError('')
  }

  /**
   * 冒険開始処理
   * 初期モンスターをAPIで追加してマップ画面に遷移
   */
  const handleStartAdventure = async () => {
    if (!selectedMonster) {
      setError('パートナーモンスターを選択してください')
      return
    }

    if (!player) {
      setError('プレイヤー情報が見つかりません')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // APIで初期モンスターを追加
      await monsterAPI.capture(
        player.id,
        selectedMonster.id, // 種族ID
        selectedMonster.name, // ニックネーム（種族名をデフォルト）
        selectedMonster.baseHp, // 現在HP
        selectedMonster.baseHp // 最大HP
      )

      // 成功メッセージを表示
      setError('') // エラーをクリア

      // 少し遅延してからマップ画面に遷移
      setTimeout(() => {
        navigate('/map')
      }, 1000)

    } catch (err) {
      console.error('初期モンスター追加エラー:', err)
      setError('初期モンスターの追加に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * スタート画面に戻る
   */
  const handleBackToStart = () => {
    if (confirm('スタート画面に戻りますか？変更は保存されません。')) {
      navigate('/')
    }
  }

  return (
    <div className="prototype-background">
      <div className="prototype-card">
        {/* ヘッダー */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎮</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">モンスター収集ゲーム</h1>
                <p className="text-sm text-gray-600">プレイヤー作成</p>
              </div>
            </div>
            <button
              onClick={handleBackToStart}
              className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
              data-testid="back-to-start-button"
            >
              ← スタートに戻る
            </button>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main>
        <div className="space-y-6">
          
          {/* プレイヤー情報表示 */}
          <div className="bg-white/90 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">プレイヤー情報</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-sm text-gray-600">プレイヤー名</p>
                  <p className="font-medium">{playerName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎮</span>
                <div>
                  <p className="text-sm text-gray-600">ゲーム状態</p>
                  <p className="font-medium">準備中</p>
                </div>
              </div>
            </div>
          </div>

          {/* エラーメッセージ */}
          {(error || playerError) && (
            <div className="message-error animate-slide-up" data-testid="error-message">
              {error || playerError}
            </div>
          )}

          {/* モンスター選択エリア */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">パートナーモンスターを選択</h2>
              <p className="text-gray-600 mb-1">あなたと一緒に冒険するパートナーモンスターを選んでください。</p>
              <p className="text-gray-600">それぞれ異なる特徴を持っています。</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {monsters.map((monster) => (
                <button
                  key={monster.id}
                  onClick={() => handleMonsterSelect(monster)}
                  className={`bg-white rounded-lg p-6 border-2 transition-all cursor-pointer hover:shadow-lg ${
                    selectedMonster?.id === monster.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid={`monster-option-${monster.id}`}
                >
                  <div className="text-center">
                    {/* モンスターアイコン */}
                    <div className="text-4xl mb-3">{monster.icon}</div>
                    
                    {/* モンスター情報 */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {monster.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {monster.description}
                    </p>
                    
                    {/* ステータス */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">基本HP:</span>
                        <span className="font-bold">{monster.baseHp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">レア度:</span>
                        <span className={`font-bold ${
                          monster.rarity === 'rare' ? 'text-purple-600' : 'text-blue-600'
                        }`}>
                          {monster.rarity === 'rare' ? 'レア' : 'コモン'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* プレビューと開始エリア */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* 選択されたパートナー */}
            <div className="bg-white/90 rounded-lg p-6" data-testid="selected-partner-panel">
              {selectedMonster ? (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">選択されたパートナー</h3>
                  <div className="text-center">
                    <div className="text-6xl mb-4">{selectedMonster.icon}</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedMonster.name}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {selectedMonster.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">基本HP:</span>
                        <div className="font-bold text-lg">{selectedMonster.baseHp}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">レア度:</span>
                        <div className={`font-bold text-lg ${
                          selectedMonster.rarity === 'rare' ? 'text-purple-600' : 'text-blue-600'
                        }`}>
                          {selectedMonster.rarity === 'rare' ? 'レア' : 'コモン'}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">選択されたパートナー</h3>
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">❓</div>
                    <p className="text-sm">パートナーを選択してください</p>
                  </div>
                </>
              )}
            </div>

            {/* 冒険の準備 */}
            <div className="bg-white/90 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">冒険の準備</h3>
              
              {/* 準備状況チェックリスト */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">プレイヤー作成完了</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    selectedMonster ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <span className={`text-sm ${
                      selectedMonster ? 'text-white' : 'text-gray-600'
                    }`}>
                      {selectedMonster ? '✓' : '?'}
                    </span>
                  </div>
                  <span className={selectedMonster ? 'text-gray-700' : 'text-gray-500'}>
                    パートナーモンスター選択
                  </span>
                </div>
              </div>

              {/* 冒険開始ボタン */}
              <button
                onClick={handleStartAdventure}
                disabled={!selectedMonster || isLoading || playerLoading}
                className={`w-full py-3 px-6 text-lg font-bold rounded-lg transition-all ${
                  selectedMonster && !isLoading && !playerLoading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                data-testid="start-adventure-button"
              >
                <span className="inline-flex items-center space-x-2">
                  <span>🗺️</span>
                  <span>{isLoading || playerLoading ? '準備中...' : '冒険を開始する'}</span>
                </span>
              </button>

              {/* ヒント */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">💡 ヒント</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• モンスターは後からでも仲間にできます</li>
                  <li>• 最初のパートナーは特別な絆を持ちます</li>
                  <li>• 各モンスターに異なる特徴があります</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 学習ポイント */}
          <div className="bg-white/90 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎓 学習ポイント</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">フロントエンド技術</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>状態管理</strong>: useStateによるコンポーネント状態</li>
                  <li>• <strong>イベント処理</strong>: onClick・useEffectの活用</li>
                  <li>• <strong>条件付きレンダリング</strong>: 選択状態による表示切り替え</li>
                  <li>• <strong>データ永続化</strong>: LocalStorageでの状態保存</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">プログラミング概念</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>型安全性</strong>: TypeScriptによる型定義</li>
                  <li>• <strong>配列操作</strong>: map・findによるデータ処理</li>
                  <li>• <strong>関数設計</strong>: ユーザーアクションごとの関数分割</li>
                  <li>• <strong>エラーハンドリング</strong>: try-catchによる例外処理</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}