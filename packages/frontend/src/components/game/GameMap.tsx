/**
 * ゲームマップコンポーネント
 * 2Dグリッドベースのマップとキャラクター移動を管理
 */
import React, { useEffect, useState, useCallback } from 'react'
import { cn } from '../../lib/utils'

/**
 * マップタイルの種類定義
 */
type TileType = 'grass' | 'town' | 'mountain' | 'water'

/**
 * プレイヤーの位置情報
 */
interface Position {
  x: number
  y: number
}

/**
 * マップタイルのデータ構造
 */
interface MapTile {
  type: TileType
  walkable: boolean
  icon: string
  name: string
}

/**
 * GameMapコンポーネントのプロパティ
 */
interface GameMapProps {
  /** マップの幅（タイル数） */
  width: number
  /** マップの高さ（タイル数） */
  height: number
  /** プレイヤーの現在位置 */
  playerPosition: Position
  /** プレイヤー移動時のコールバック */
  onPlayerMove: (newPosition: Position, tile: MapTile) => void
  /** タイル選択時のコールバック */
  onTileSelect?: (position: Position, tile: MapTile) => void
}

/**
 * タイルタイプの定義
 */
const TILE_TYPES: Record<TileType, MapTile> = {
  grass: {
    type: 'grass',
    walkable: true,
    icon: '🌱',
    name: '草原'
  },
  town: {
    type: 'town',
    walkable: true,
    icon: '🏘️',
    name: '街'
  },
  mountain: {
    type: 'mountain',
    walkable: false,
    icon: '⛰️',
    name: '山'
  },
  water: {
    type: 'water',
    walkable: false,
    icon: '🌊',
    name: '水辺'
  }
}

/**
 * ゲームマップコンポーネント
 * プロトタイプのマップ機能をReactで再実装
 */
export function GameMap({
  width,
  height,
  playerPosition,
  onPlayerMove,
  onTileSelect
}: GameMapProps) {
  // マップデータの状態管理
  const [mapData, setMapData] = useState<TileType[][]>([])

  /**
   * マップデータを生成
   * 簡単なアルゴリズムでランダムなマップを作成
   */
  const generateMap = useCallback(() => {
    const newMap: TileType[][] = []
    
    for (let y = 0; y < height; y++) {
      const row: TileType[] = []
      for (let x = 0; x < width; x++) {
        // 境界は山または水にする
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          row.push(Math.random() > 0.5 ? 'mountain' : 'water')
        }
        // 中央付近は街にする
        else if (Math.abs(x - width / 2) < 2 && Math.abs(y - height / 2) < 2) {
          row.push('town')
        }
        // その他はランダムで草原または山
        else {
          const random = Math.random()
          if (random > 0.8) {
            row.push('mountain')
          } else if (random > 0.7) {
            row.push('water')
          } else {
            row.push('grass')
          }
        }
      }
      newMap.push(row)
    }
    
    setMapData(newMap)
  }, [width, height])

  /**
   * コンポーネント初期化時にマップを生成
   */
  useEffect(() => {
    generateMap()
  }, [generateMap])

  /**
   * キーボード入力による移動処理
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // フォーカスが入力要素にある場合は無視
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      let deltaX = 0
      let deltaY = 0

      switch (event.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          deltaY = -1
          break
        case 'arrowdown':
        case 's':
          deltaY = 1
          break
        case 'arrowleft':
        case 'a':
          deltaX = -1
          break
        case 'arrowright':
        case 'd':
          deltaX = 1
          break
        case ' ':
          // スペースキーで現在地の情報を表示
          event.preventDefault()
          if (onTileSelect && mapData[playerPosition.y]) {
            const tile = TILE_TYPES[mapData[playerPosition.y][playerPosition.x]]
            onTileSelect(playerPosition, tile)
          }
          return
        default:
          return
      }

      if (deltaX !== 0 || deltaY !== 0) {
        event.preventDefault()
        movePlayer(deltaX, deltaY)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playerPosition, mapData, onTileSelect])

  /**
   * タッチジェスチャー処理の初期化
   */
  useEffect(() => {
    if (typeof window === 'undefined') return

    let startX = 0
    let startY = 0
    let startTime = 0

    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent
      const touch = touchEvent.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
    }

    const handleTouchEnd = (e: Event) => {
      const touchEvent = e as TouchEvent
      if (!touchEvent.changedTouches.length) return
      
      const touch = touchEvent.changedTouches[0]
      const endX = touch.clientX
      const endY = touch.clientY
      const endTime = Date.now()
      
      const deltaX = endX - startX
      const deltaY = endY - startY
      const deltaTime = endTime - startTime
      
      // スワイプとして認識する条件
      const minSwipeDistance = 50
      const maxSwipeTime = 500
      
      if (deltaTime > maxSwipeTime) return
      
      // より遠い方向を優先
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 横方向のスワイプ
        if (Math.abs(deltaX) > minSwipeDistance) {
          e.preventDefault()
          if (deltaX > 0) {
            movePlayer(1, 0) // 右
          } else {
            movePlayer(-1, 0) // 左
          }
        }
      } else {
        // 縦方向のスワイプ
        if (Math.abs(deltaY) > minSwipeDistance) {
          e.preventDefault()
          if (deltaY > 0) {
            movePlayer(0, 1) // 下
          } else {
            movePlayer(0, -1) // 上
          }
        }
      }
    }

    const mapElement = document.querySelector('[data-game-map]')
    if (mapElement) {
      mapElement.addEventListener('touchstart', handleTouchStart, { passive: false })
      mapElement.addEventListener('touchend', handleTouchEnd, { passive: false })
      
      return () => {
        mapElement.removeEventListener('touchstart', handleTouchStart)
        mapElement.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [])

  /**
   * プレイヤー移動処理
   * @param deltaX - X方向の移動量
   * @param deltaY - Y方向の移動量
   */
  const movePlayer = (deltaX: number, deltaY: number) => {
    const newX = playerPosition.x + deltaX
    const newY = playerPosition.y + deltaY

    // 境界チェック
    if (newX < 0 || newX >= width || newY < 0 || newY >= height) {
      return
    }

    // マップデータが存在しない場合は移動しない
    if (!mapData[newY] || !mapData[newY][newX]) {
      return
    }

    // 移動先のタイルが歩行可能かチェック
    const targetTile = TILE_TYPES[mapData[newY][newX]]
    if (!targetTile.walkable) {
      return
    }

    // 移動実行
    const newPosition = { x: newX, y: newY }
    const moveTile = TILE_TYPES[mapData[newY][newX]]
    onPlayerMove(newPosition, moveTile)
  }

  /**
   * タイルクリック処理
   */
  const handleTileClick = (x: number, y: number) => {
    if (mapData[y] && mapData[y][x]) {
      const tile = TILE_TYPES[mapData[y][x]]
      onTileSelect?.(({ x, y }), tile)
    }
  }

  /**
   * マップが生成されていない場合のローディング表示
   */
  if (mapData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">マップを生成中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* マップグリッド */}
      <div
        data-game-map
        data-testid="game-map"
        className="grid gap-0.5 bg-gray-300 p-2 rounded-lg mx-auto overflow-x-auto select-none"
        style={{
          gridTemplateColumns: `repeat(${width}, 1fr)`,
          maxWidth: 'fit-content',
          minWidth: `${width * 40}px`, // モバイルでの最小幅を確保
        }}
        role="application"
        aria-label="ゲームマップ"
        tabIndex={0}
      >
        {mapData.map((row, y) =>
          row.map((tileType, x) => {
            const tile = TILE_TYPES[tileType]
            const isPlayerHere = playerPosition.x === x && playerPosition.y === y

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => handleTileClick(x, y)}
                className={cn(
                  // ベーススタイル
                  'map-tile relative cursor-pointer transition-all duration-200',
                  
                  // タイルタイプ別のスタイル
                  `tile-${tile.type}`,
                  
                  // プレイヤーがいる場合の強調表示
                  isPlayerHere && 'tile-current ring-2 ring-yellow-400',
                  
                  // ホバー効果
                  'hover:brightness-110',
                  
                  // フォーカス対応
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
                title={`${tile.name} (${x}, ${y})`}
                role="button"
                aria-label={`${tile.name}、座標${x}, ${y}${isPlayerHere ? '、現在位置' : ''}`}
                tabIndex={-1}
                data-testid={`map-tile-${x}-${y}`}
              >
                {/* タイルアイコン */}
                <div className="absolute inset-0 flex items-center justify-center text-xs opacity-50">
                  {tile.icon}
                </div>
                
                {/* プレイヤーキャラクター */}
                {isPlayerHere && (
                  <div className="character absolute inset-0.5 flex items-center justify-center text-lg" data-testid="player-character">
                    🧙‍♂️
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      
      {/* 操作説明 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          <span className="hidden md:inline">矢印キーまたはWASDで移動 | スペースキーで現在地情報</span>
          <span className="md:hidden">マップをスワイプして移動 | タイルをタップで情報表示</span>
        </p>
      </div>
    </div>
  )
}