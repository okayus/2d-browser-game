/**
 * E2Eテスト用のテストデータ定義
 * テストで使用する一貫したデータを管理
 */

/**
 * テスト用プレイヤーデータ
 */
export const testPlayers = {
  /** 有効なプレイヤーデータ */
  valid: {
    name: 'テストプレイヤー',
    nameEn: 'TestPlayer',
    nameShort: 'TP1',
    nameLong: 'とても長いプレイヤー名前テスト'
  },
  
  /** 無効なプレイヤーデータ */
  invalid: {
    tooShort: 'ab',
    tooLong: 'a'.repeat(21),
    empty: '',
    onlySpaces: '   ',
    specialChars: '!@#$%'
  }
} as const

/**
 * テスト用モンスターデータ
 */
export const testMonsters = {
  /** サンプルモンスター */
  sampleMonster: {
    name: 'ファイアドラゴン',
    type: 'fire',
    hp: 100,
    attack: 80,
    defense: 60,
    speed: 70
  },
  
  /** テスト用ニックネーム */
  nicknames: {
    valid: 'ポチ',
    long: 'とても長いニックネーム',
    empty: '',
    special: '★ポチ★'
  }
} as const

/**
 * テスト用マップデータ
 */
export const testMapData = {
  /** 初期位置 */
  initialPosition: { x: 5, y: 5 },
  
  /** 移動テスト用の座標 */
  movePositions: [
    { x: 4, y: 5, direction: 'left' },
    { x: 6, y: 5, direction: 'right' },
    { x: 5, y: 4, direction: 'up' },
    { x: 5, y: 6, direction: 'down' }
  ]
} as const

/**
 * テスト用のエラーメッセージ
 */
export const errorMessages = {
  playerName: {
    required: 'プレイヤー名を入力してください',
    tooShort: 'プレイヤー名は3文字以上で入力してください',
    tooLong: 'プレイヤー名は20文字以下で入力してください'
  },
  
  monster: {
    notFound: 'モンスターが見つかりません',
    deleteConfirm: 'このモンスターを逃がしますか？'
  },
  
  network: {
    connectionError: 'サーバーに接続できません',
    timeoutError: 'リクエストがタイムアウトしました'
  }
} as const

/**
 * テスト用のURL
 */
export const testUrls = {
  start: '/',
  monsterList: '/monsters',
  map: '/map',
  playerCreation: '/player-creation'
} as const

/**
 * テスト用の待機時間（ミリ秒）
 */
export const waitTimes = {
  short: 500,
  medium: 1000,
  long: 3000,
  animation: 2000
} as const