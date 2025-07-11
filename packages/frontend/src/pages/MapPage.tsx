/**
 * マップ画面コンポーネント
 * プレイヤーの移動と探索を管理
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameMap, PlayerPanel } from '../components/game'
import { Button, Card, CardContent } from '../components/ui'
import { getGameState, updateGameState, MAP_CONFIG, MONSTER_TYPES } from '../lib/utils'

/**
 * メッセージの型定義
 */
interface GameMessage {
  id: string
  text: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
}

/**
 * タイル情報の型定義
 */
interface TileInfo {
  type: string
  walkable: boolean
  icon: string
  name: string
}

/**
 * マップ画面のメインコンポーネント
 * プロトタイプのmap.htmlの機能をReactで再実装
 */
export function MapPage() {
  const navigate = useNavigate()
  
  // 状態管理
  const [playerPosition, setPlayerPosition] = useState(MAP_CONFIG.startPosition)
  const [playerInfo, setPlayerInfo] = useState<{
    name: string
    selectedMonster?: typeof MONSTER_TYPES[0]
  }>({ name: '' })
  const [messages, setMessages] = useState<GameMessage[]>([])
  const [selectedTileInfo, setSelectedTileInfo] = useState<TileInfo | null>(null)

  /**
   * コンポーネント初期化
   * ゲーム状態を確認し、必要に応じてリダイレクト
   */
  useEffect(() => {
    const gameState = getGameState()
    
    // プレイヤー名またはモンスターが選択されていない場合の処理
    if (!gameState.playerName) {
      navigate('/')
      return
    }
    
    if (!gameState.selectedMonster) {
      navigate('/player-creation')
      return
    }
    
    // プレイヤー情報を設定
    setPlayerInfo({
      name: gameState.playerName,
      selectedMonster: gameState.selectedMonster
    })
    
    // 保存されている位置があれば復元
    if (gameState.playerPosition) {
      setPlayerPosition(gameState.playerPosition)
    }
    
    // 初期メッセージを追加
    addMessage('冒険を開始しました！矢印キーまたはWASDで移動できます。', 'info')
  }, [navigate])

  /**
   * メッセージを追加
   * @param text - メッセージテキスト
   * @param type - メッセージタイプ
   */
  const addMessage = (text: string, type: GameMessage['type'] = 'info') => {
    const newMessage: GameMessage = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: Date.now()
    }
    
    setMessages(prev => {
      const updated = [newMessage, ...prev]
      // 最新の10件のみ保持
      return updated.slice(0, 10)
    })
  }

  /**
   * プレイヤー移動処理
   * @param newPosition - 新しい位置
   */
  const handlePlayerMove = (newPosition: { x: number; y: number }) => {
    setPlayerPosition(newPosition)
    
    // 移動を保存
    updateGameState({ playerPosition: newPosition })
    
    // 移動メッセージを追加
    addMessage(`座標 (${newPosition.x}, ${newPosition.y}) に移動しました`, 'info')
    
    // ランダムイベントの判定（10%の確率）
    if (Math.random() < 0.1) {
      handleRandomEvent()
    }
  }

  /**
   * ランダムイベント処理
   * 移動時に発生する可能性があるイベント
   */
  const handleRandomEvent = () => {
    const events = [
      {
        type: 'monster_encounter',
        message: '野生のモンスターが現れた！',
        messageType: 'warning' as const
      },
      {
        type: 'item_found',
        message: '何かアイテムを見つけた！',
        messageType: 'success' as const
      },
      {
        type: 'nothing',
        message: 'この辺りは静かだ...',
        messageType: 'info' as const
      }
    ]
    
    const randomEvent = events[Math.floor(Math.random() * events.length)]
    addMessage(randomEvent.message, randomEvent.messageType)
  }

  /**
   * タイル選択処理
   * @param position - 選択された位置
   * @param tile - タイル情報
   */
  const handleTileSelect = (position: { x: number; y: number }, tile: TileInfo) => {
    setSelectedTileInfo(tile)
    addMessage(`座標 (${position.x}, ${position.y}) の${tile.name}を調べました`, 'info')
  }

  /**
   * プレイヤー作成画面に戻る
   */
  const handleBackToCreation = () => {
    if (confirm('プレイヤー作成画面に戻りますか？')) {
      navigate('/player-creation')
    }
  }

  /**
   * ゲームリスタート
   */
  const handleRestartGame = () => {
    if (confirm('ゲームを最初からやり直しますか？すべてのデータが削除されます。')) {
      localStorage.clear()
      navigate('/')
    }
  }

  /**
   * モンスター一覧画面に移動
   */
  const handleOpenMonsterList = () => {
    navigate('/monsters')
  }

  return (
    <div className="prototype-background">
      <div className="prototype-card max-w-7xl">
        {/* ヘッダー */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">モンスター収集ゲーム</h1>
                <p className="text-sm text-gray-600">マップ探索</p>
              </div>
            </div>
            
            {/* ナビゲーションボタン */}
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBackToCreation}
                data-testid="back-to-creation-button"
              >
                ← プレイヤー作成
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRestartGame}
                data-testid="restart-game-button"
              >
                🔄 最初から
              </Button>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* マップエリア（メイン） */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* マップコンテナ */}
            <Card data-testid="game-map-container">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">🗺️ ワールドマップ</h2>
                  <div className="text-sm text-gray-600">
                    矢印キーまたはWASDで移動
                  </div>
                </div>
                
                <GameMap
                  width={MAP_CONFIG.width}
                  height={MAP_CONFIG.height}
                  playerPosition={playerPosition}
                  onPlayerMove={handlePlayerMove}
                  onTileSelect={handleTileSelect}
                />
              </CardContent>
            </Card>

            {/* メッセージエリア */}
            <Card data-testid="message-area">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3">📝 メッセージ</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`px-3 py-2 rounded-lg text-sm border ${
                        message.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                        message.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-red-50 border-red-200 text-red-700'
                      }`}
                      data-testid={`message-${message.type}`}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* タイル情報エリア */}
            {selectedTileInfo && (
              <Card data-testid="tile-info">
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900 mb-3">🔍 地形情報</h3>
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{selectedTileInfo.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedTileInfo.name}</h4>
                      <p className="text-sm text-gray-600">
                        {selectedTileInfo.walkable ? '移動可能な地形です' : '移動できない地形です'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* サイドパネル */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* プレイヤー情報パネル */}
            <div data-testid="player-panel">
              <PlayerPanel
                player={{
                  name: playerInfo.name,
                  selectedMonster: playerInfo.selectedMonster,
                  position: playerPosition
                }}
              />
            </div>

            {/* マップ凡例 */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3">🗺️ マップ凡例</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 tile-grass rounded border"></div>
                    <span>🌱 草原（移動可能）</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 tile-town rounded border"></div>
                    <span>🏘️ 街（移動可能）</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 tile-mountain rounded border"></div>
                    <span>⛰️ 山（移動不可）</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 tile-water rounded border"></div>
                    <span>🌊 水辺（移動不可）</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="character w-6 h-6 rounded border scale-75"></div>
                    <span>🧙‍♂️ あなた</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* コントロールパネル */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3">🎮 コントロール</h3>
                <div className="space-y-3">
                  
                  {/* キーボードショートカット */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">キーボード操作:</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• 矢印キー: 移動</div>
                      <div>• WASD: 移動</div>
                      <div>• スペース: 現在地情報</div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleOpenMonsterList}
                      className="w-full"
                      data-testid="open-monster-list-button"
                    >
                      🎒 モンスター一覧
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addMessage(`現在位置: (${playerPosition.x}, ${playerPosition.y})`, 'info')}
                      className="w-full"
                      data-testid="check-position-button"
                    >
                      📍 現在地を確認
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 学習ポイント */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">🎓 学習ポイント</h3>
                <div className="text-xs text-gray-700 space-y-2">
                  <div>
                    <strong>2Dゲーム開発</strong>
                    <ul className="mt-1 space-y-1 text-gray-600">
                      <li>• グリッドベースマップ</li>
                      <li>• キャラクター移動制御</li>
                      <li>• 当たり判定システム</li>
                    </ul>
                  </div>
                  <div>
                    <strong>UI/UX設計</strong>
                    <ul className="mt-1 space-y-1 text-gray-600">
                      <li>• レスポンシブレイアウト</li>
                      <li>• キーボード操作対応</li>
                      <li>• リアルタイム状態更新</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}