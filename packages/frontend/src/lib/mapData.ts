/**
 * マップデータ定義
 * 将来的にデータベースから読み込む準備として型定義とモックデータを作成
 */

/**
 * マップタイルの種類定義
 */
export type TileType = 'grass' | 'town' | 'mountain' | 'water'

/**
 * マップデータの型定義
 * 将来的にデータベースのmapsテーブルの構造に対応
 */
export interface MapData {
  /** マップID（将来的にデータベースのプライマリキー） */
  id: string
  /** マップ名 */
  name: string
  /** マップの説明 */
  description: string
  /** マップの幅（タイル数） */
  width: number
  /** マップの高さ（タイル数） */
  height: number
  /** タイルデータの2次元配列 */
  tiles: TileType[][]
  /** プレイヤーの初期位置 */
  startPosition: {
    x: number
    y: number
  }
  /** 作成日時（将来的にデータベースフィールド） */
  createdAt?: string
  /** 更新日時（将来的にデータベースフィールド） */
  updatedAt?: string
}

/**
 * モックマップデータ
 * 固定のマップレイアウトを定義
 */
export const MOCK_MAP_DATA: MapData = {
  id: 'default-map-001',
  name: 'はじまりの大地',
  description: 'プレイヤーが最初に冒険する基本的なマップ',
  width: 20,
  height: 15,
  startPosition: { x: 10, y: 7 },
  tiles: [
    // Y=0 (上端)
    ['water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water'],
    // Y=1
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'mountain', 'grass', 'grass', 'grass', 'grass', 'mountain', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=2
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'mountain', 'grass', 'grass', 'grass', 'grass', 'mountain', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=3
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=4
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=5
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'town', 'town', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=6
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'town', 'town', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=7 (プレイヤー開始位置を含む)
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'town', 'town', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=8
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'town', 'town', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=9
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=10
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=11
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=12
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'mountain', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'mountain', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=13
    ['water', 'grass', 'grass', 'grass', 'grass', 'grass', 'mountain', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'mountain', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
    // Y=14 (下端)
    ['water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water', 'water']
  ],
  createdAt: '2025-07-15T00:00:00Z',
  updatedAt: '2025-07-15T00:00:00Z'
}

/**
 * マップデータを取得する関数
 * 将来的にはAPIから取得するが、現在はモックデータを返す
 * 
 * @param mapId - マップID
 * @returns マップデータ
 */
export function getMapData(mapId: string = 'default-map-001'): MapData {
  // TODO: 将来的にはAPIから取得
  // return await fetch(`/api/maps/${mapId}`).then(res => res.json())
  
  console.log(`マップデータを取得中: ${mapId}`)
  return MOCK_MAP_DATA
}

/**
 * マップデータを検証する関数
 * データの整合性をチェック
 * 
 * @param mapData - 検証するマップデータ
 * @returns 検証結果
 */
export function validateMapData(mapData: MapData): boolean {
  // 基本的な検証
  if (!mapData.tiles || !Array.isArray(mapData.tiles)) {
    console.error('マップデータ: tilesが配列ではありません')
    return false
  }
  
  // 高さの検証
  if (mapData.tiles.length !== mapData.height) {
    console.error(`マップデータ: 高さが一致しません。期待値: ${mapData.height}, 実際: ${mapData.tiles.length}`)
    return false
  }
  
  // 幅の検証
  for (let y = 0; y < mapData.tiles.length; y++) {
    if (mapData.tiles[y].length !== mapData.width) {
      console.error(`マップデータ: 行${y}の幅が一致しません。期待値: ${mapData.width}, 実際: ${mapData.tiles[y].length}`)
      return false
    }
  }
  
  // 開始位置の検証
  if (mapData.startPosition.x < 0 || mapData.startPosition.x >= mapData.width ||
      mapData.startPosition.y < 0 || mapData.startPosition.y >= mapData.height) {
    console.error('マップデータ: 開始位置がマップの範囲外です')
    return false
  }
  
  // 開始位置が歩行可能かチェック
  const startTile = mapData.tiles[mapData.startPosition.y][mapData.startPosition.x]
  if (startTile === 'water' || startTile === 'mountain') {
    console.error('マップデータ: 開始位置が歩行不可能なタイルです')
    return false
  }
  
  console.log('マップデータの検証が完了しました')
  return true
}

/**
 * 初学者向けメモ：マップデータの設計思想
 * 
 * 1. 将来性を考慮した設計
 *    - データベースのテーブル構造を想定した型定義
 *    - APIから取得することを前提とした関数設計
 * 
 * 2. 保守性の向上
 *    - 固定データによる予測可能な動作
 *    - 検証関数による データ整合性の確保
 * 
 * 3. 開発効率の向上
 *    - モックデータによる開発・テストの容易さ
 *    - 型安全性による バグの早期発見
 * 
 * 4. 拡張性
 *    - 複数のマップデータに対応可能
 *    - 新しいタイルタイプの追加が容易
 */