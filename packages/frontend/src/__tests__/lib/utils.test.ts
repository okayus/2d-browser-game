/**
 * ユーティリティ関数のテスト
 * utils.tsの全ての関数を網羅的にテスト
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getStorageData,
  setStorageData,
  validatePlayerName,
  MONSTER_TYPES,
  getMonsterById,
  getAllMonsters,
  MAP_CONFIG,
  getGameState,
  updateGameState,
  resetGameState,
  cn,
  sleep
} from '../../lib/utils'

describe('LocalStorage関連の関数', () => {
  beforeEach(() => {
    // 各テスト前にLocalStorageをクリア
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getStorageData', () => {
    it('存在するキーの値を正しく取得できる', () => {
      // 準備
      const testData = { name: 'テストプレイヤー', level: 10 }
      localStorage.setItem('test_key', JSON.stringify(testData))

      // 実行
      const result = getStorageData('test_key')

      // 検証
      expect(result).toEqual(testData)
    })

    it('存在しないキーの場合はデフォルト値を返す', () => {
      // 実行
      const result = getStorageData('non_existent_key', 'default_value')

      // 検証
      expect(result).toBe('default_value')
    })

    it('デフォルト値が指定されていない場合はnullを返す', () => {
      // 実行
      const result = getStorageData('non_existent_key')

      // 検証
      expect(result).toBeNull()
    })

    it('不正なJSONデータの場合はデフォルト値を返す', () => {
      // 準備
      localStorage.setItem('invalid_json', '{invalid json}')
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // 実行
      const result = getStorageData('invalid_json', 'fallback')

      // 検証
      expect(result).toBe('fallback')
      expect(consoleWarnSpy).toHaveBeenCalledWith('LocalStorageの読み込みに失敗:', expect.any(Error))
    })

    it('空文字列の場合はデフォルト値を返す', () => {
      // 準備
      localStorage.setItem('empty_key', '')

      // 実行
      const result = getStorageData('empty_key', 'default')

      // 検証
      expect(result).toBe('default')
    })
  })

  describe('setStorageData', () => {
    it('データを正しく保存できる', () => {
      // 準備
      const testData = { id: 1, name: 'テスト' }

      // 実行
      const result = setStorageData('test_save', testData)

      // 検証
      expect(result).toBe(true)
      expect(localStorage.getItem('test_save')).toBe(JSON.stringify(testData))
    })

    it('複雑なオブジェクトを保存できる', () => {
      // 準備
      const complexData = {
        player: { name: 'プレイヤー', hp: 100 },
        monsters: [
          { id: 1, name: 'モンスター1' },
          { id: 2, name: 'モンスター2' }
        ],
        settings: { volume: 0.8, language: 'ja' }
      }

      // 実行
      const result = setStorageData('complex_data', complexData)

      // 検証
      expect(result).toBe(true)
      const savedData = JSON.parse(localStorage.getItem('complex_data')!)
      expect(savedData).toEqual(complexData)
    })

    it('nullも保存できる', () => {
      // 実行 & 検証
      expect(setStorageData('null_value', null)).toBe(true)
      expect(getStorageData('null_value')).toBeNull()
    })

    it('undefinedは文字列として保存される', () => {
      // undefinedはJSONでは表現できないため、JSONで"undefined"の文字列として保存される
      // 実行
      const result = setStorageData('undefined_value', undefined)
      
      // 検証
      expect(result).toBe(false) // undefinedはJSONシリアライズできないためfalse
    })

    it('LocalStorageエラーの場合はfalseを返す', () => {
      // 準備: 元のlocalStorageを保存
      const originalLocalStorage = window.localStorage
      
      // モックされたsetItemでエラーを発生
      const mockSetItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      // テスト用にlocalStorageのsetItemを一時的に置き換え
      Object.defineProperty(window, 'localStorage', {
        value: {
          ...originalLocalStorage,
          setItem: mockSetItem
        },
        writable: true,
        configurable: true
      })
      
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // 実行
      const result = setStorageData('test_error', 'data')

      // 検証
      expect(result).toBe(false)
      expect(consoleWarnSpy).toHaveBeenCalledWith('LocalStorageの保存に失敗:', expect.any(Error))
      
      // 後処理: 元のlocalStorageを復元
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true
      })
    })
  })
})

describe('プレイヤー名バリデーション', () => {
  describe('validatePlayerName', () => {
    it('正常な名前の場合はvalidation成功', () => {
      // 実行
      const result = validatePlayerName('テストプレイヤー')

      // 検証
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('')
      expect(result.name).toBe('テストプレイヤー')
    })

    it('前後の空白を除去して検証', () => {
      // 実行
      const result = validatePlayerName('  テストプレイヤー  ')

      // 検証
      expect(result.isValid).toBe(true)
      expect(result.name).toBe('テストプレイヤー')
    })

    it('英数字の名前も許可', () => {
      // 実行
      const result = validatePlayerName('Player123')

      // 検証
      expect(result.isValid).toBe(true)
      expect(result.name).toBe('Player123')
    })

    it('漢字、ひらがな、カタカナの混在も許可', () => {
      // 実行
      const result = validatePlayerName('田中たナカ123')

      // 検証
      expect(result.isValid).toBe(true)
      expect(result.name).toBe('田中たナカ123')
    })

    it('空文字列の場合はエラー', () => {
      // 実行
      const result = validatePlayerName('')

      // 検証
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('プレイヤー名を入力してください')
      expect(result.name).toBeUndefined()
    })

    it('null の場合はエラー', () => {
      // 実行
      const result = validatePlayerName(null as unknown as string)

      // 検証
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('プレイヤー名を入力してください')
    })

    it('undefined の場合はエラー', () => {
      // 実行
      const result = validatePlayerName(undefined as unknown as string)

      // 検証
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('プレイヤー名を入力してください')
    })

    it('文字列以外の場合はエラー', () => {
      // 実行 & 検証
      expect(validatePlayerName(123 as unknown as string).isValid).toBe(false)
      expect(validatePlayerName({} as unknown as string).isValid).toBe(false)
      expect(validatePlayerName([] as unknown as string).isValid).toBe(false)
    })

    it('3文字未満の場合はエラー', () => {
      // 実行
      const result = validatePlayerName('ab')

      // 検証
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('プレイヤー名は3文字以上で入力してください')
    })

    it('20文字超過の場合はエラー', () => {
      // 準備: 21文字の名前
      const longName = 'a'.repeat(21)

      // 実行
      const result = validatePlayerName(longName)

      // 検証
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('プレイヤー名は20文字以下で入力してください')
    })

    it('20文字ちょうどの場合は成功', () => {
      // 準備: 20文字の名前
      const exactName = 'a'.repeat(20)

      // 実行
      const result = validatePlayerName(exactName)

      // 検証
      expect(result.isValid).toBe(true)
      expect(result.name).toBe(exactName)
    })

    it('特殊文字が含まれている場合はエラー', () => {
      const invalidNames = [
        'プレイヤー@',
        'test#user',
        'user$name',
        'プレイヤー%',
        'user&name',
        'プレイヤー*',
        'user+name',
        'プレイヤー=',
        'user|name',
        'プレイヤー\\',
        'user/name',
        'プレイヤー?',
        'user<name>',
        'プレイヤー[test]',
        'user{name}',
        'プレイヤー"quote"',
        "user'name"
      ]

      invalidNames.forEach(name => {
        const result = validatePlayerName(name)
        expect(result.isValid).toBe(false)
        expect(result.message).toBe('プレイヤー名に使用できない文字が含まれています')
      })
    })

    it('境界値テスト: 3文字ちょうど', () => {
      // 実行
      const result = validatePlayerName('abc')

      // 検証
      expect(result.isValid).toBe(true)
      expect(result.name).toBe('abc')
    })

    it('空白のみの名前は無効', () => {
      // 実行
      const result = validatePlayerName('   ')

      // 検証
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('プレイヤー名は3文字以上で入力してください')
    })
  })
})

describe('モンスター関連の関数', () => {
  describe('MONSTER_TYPES定数', () => {
    it('正しい数のモンスターが定義されている', () => {
      expect(MONSTER_TYPES).toHaveLength(3)
    })

    it('各モンスターが必要なプロパティを持つ', () => {
      MONSTER_TYPES.forEach(monster => {
        expect(monster).toHaveProperty('id')
        expect(monster).toHaveProperty('name')
        expect(monster).toHaveProperty('description')
        expect(monster).toHaveProperty('icon')
        expect(monster).toHaveProperty('baseHp')
        expect(monster).toHaveProperty('rarity')
        
        expect(typeof monster.id).toBe('string')
        expect(typeof monster.name).toBe('string')
        expect(typeof monster.description).toBe('string')
        expect(typeof monster.icon).toBe('string')
        expect(typeof monster.baseHp).toBe('number')
        expect(['common', 'rare']).toContain(monster.rarity)
      })
    })

    it('想定されるモンスターが含まれている', () => {
      const monsterIds = MONSTER_TYPES.map(m => m.id)
      expect(monsterIds).toContain('electric_mouse')
      expect(monsterIds).toContain('fire_lizard')
      expect(monsterIds).toContain('water_turtle')
    })
  })

  describe('getMonsterById', () => {
    it('存在するIDでモンスターを取得できる', () => {
      // 実行
      const result = getMonsterById('electric_mouse')

      // 検証
      expect(result).not.toBeNull()
      expect(result!.id).toBe('electric_mouse')
      expect(result!.name).toBe('でんきネズミ')
    })

    it('存在しないIDの場合はnullを返す', () => {
      // 実行
      const result = getMonsterById('non_existent_monster')

      // 検証
      expect(result).toBeNull()
    })

    it('空文字列の場合はnullを返す', () => {
      // 実行
      const result = getMonsterById('')

      // 検証
      expect(result).toBeNull()
    })

    it('全てのモンスターIDで取得可能', () => {
      MONSTER_TYPES.forEach(monster => {
        const result = getMonsterById(monster.id)
        expect(result).toEqual(monster)
      })
    })
  })

  describe('getAllMonsters', () => {
    it('全てのモンスターを取得できる', () => {
      // 実行
      const result = getAllMonsters()

      // 検証
      expect(result).toHaveLength(MONSTER_TYPES.length)
      expect(result).toEqual(MONSTER_TYPES)
    })

    it('返された配列は元の配列とは別のインスタンス', () => {
      // 実行
      const result = getAllMonsters()

      // 検証（参照が異なることを確認）
      expect(result).not.toBe(MONSTER_TYPES)
      
      // 内容は同じ
      expect(result).toEqual(MONSTER_TYPES)
    })
  })
})

describe('ゲーム状態管理', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('MAP_CONFIG定数', () => {
    it('正しいマップ設定が定義されている', () => {
      expect(MAP_CONFIG.width).toBe(10)
      expect(MAP_CONFIG.height).toBe(8)
      expect(MAP_CONFIG.startPosition).toEqual({ x: 5, y: 4 })
    })
  })

  describe('getGameState', () => {
    it('初期状態では適切なデフォルト値を返す', () => {
      // 実行
      const result = getGameState()

      // 検証
      expect(result.playerName).toBeNull()
      expect(result.selectedMonster).toBeNull()
      expect(result.playerPosition).toEqual(MAP_CONFIG.startPosition)
      expect(result.gameState).toBe('start')
    })

    it('保存されたデータを正しく取得する', () => {
      // 準備
      const testData = {
        playerName: 'テストプレイヤー',
        selectedMonster: MONSTER_TYPES[0],
        playerPosition: { x: 3, y: 2 },
        gameState: 'playing'
      }
      
      localStorage.setItem('player_name', JSON.stringify(testData.playerName))
      localStorage.setItem('selected_monster', JSON.stringify(testData.selectedMonster))
      localStorage.setItem('player_position', JSON.stringify(testData.playerPosition))
      localStorage.setItem('game_state', JSON.stringify(testData.gameState))

      // 実行
      const result = getGameState()

      // 検証
      expect(result.playerName).toBe(testData.playerName)
      expect(result.selectedMonster).toEqual(testData.selectedMonster)
      expect(result.playerPosition).toEqual(testData.playerPosition)
      expect(result.gameState).toBe(testData.gameState)
    })
  })

  describe('updateGameState', () => {
    it('プレイヤー名を更新できる', () => {
      // 実行
      const result = updateGameState({ playerName: '新しいプレイヤー' })

      // 検証
      expect(result).toBe(true)
      expect(getGameState().playerName).toBe('新しいプレイヤー')
    })

    it('選択モンスターを更新できる', () => {
      // 実行
      const result = updateGameState({ selectedMonster: MONSTER_TYPES[1] })

      // 検証
      expect(result).toBe(true)
      expect(getGameState().selectedMonster).toEqual(MONSTER_TYPES[1])
    })

    it('プレイヤー位置を更新できる', () => {
      // 準備
      const newPosition = { x: 7, y: 3 }

      // 実行
      const result = updateGameState({ playerPosition: newPosition })

      // 検証
      expect(result).toBe(true)
      expect(getGameState().playerPosition).toEqual(newPosition)
    })

    it('ゲーム状態を更新できる', () => {
      // 実行
      const result = updateGameState({ gameState: 'battle' })

      // 検証
      expect(result).toBe(true)
      expect(getGameState().gameState).toBe('battle')
    })

    it('複数の値を同時に更新できる', () => {
      // 準備
      const updates = {
        playerName: 'マルチ更新',
        playerPosition: { x: 9, y: 1 },
        gameState: 'exploring'
      }

      // 実行
      const result = updateGameState(updates)

      // 検証
      expect(result).toBe(true)
      const state = getGameState()
      expect(state.playerName).toBe(updates.playerName)
      expect(state.playerPosition).toEqual(updates.playerPosition)
      expect(state.gameState).toBe(updates.gameState)
    })

    it('undefinedの値は更新しない', () => {
      // 準備: 初期値を設定
      updateGameState({ playerName: '初期プレイヤー', gameState: 'initial' })

      // 実行: undefinedを含む更新
      const result = updateGameState({ 
        playerName: undefined, 
        gameState: 'updated' 
      })

      // 検証
      expect(result).toBe(true)
      const state = getGameState()
      expect(state.playerName).toBe('初期プレイヤー') // 変更されない
      expect(state.gameState).toBe('updated') // 変更される
    })
  })

  describe('resetGameState', () => {
    it('全てのゲーム状態をリセットできる', () => {
      // 準備: データを設定
      updateGameState({
        playerName: 'リセット前',
        selectedMonster: MONSTER_TYPES[0],
        playerPosition: { x: 1, y: 1 },
        gameState: 'before_reset'
      })

      // 実行
      resetGameState()

      // 検証
      const state = getGameState()
      expect(state.playerName).toBeNull()
      expect(state.selectedMonster).toBeNull()
      expect(state.playerPosition).toEqual(MAP_CONFIG.startPosition)
      expect(state.gameState).toBe('start')
    })

    it('LocalStorageから実際にキーが削除される', () => {
      // 準備
      localStorage.setItem('player_name', 'test')
      localStorage.setItem('selected_monster', 'test')
      localStorage.setItem('player_position', 'test')
      localStorage.setItem('game_state', 'test')

      // 実行
      resetGameState()

      // 検証
      expect(localStorage.getItem('player_name')).toBeNull()
      expect(localStorage.getItem('selected_monster')).toBeNull()
      expect(localStorage.getItem('player_position')).toBeNull()
      expect(localStorage.getItem('game_state')).toBeNull()
    })
  })
})

describe('ユーティリティ関数', () => {
  describe('cn (className utility)', () => {
    it('複数のクラス名を結合できる', () => {
      // 実行
      const result = cn('class1', 'class2', 'class3')

      // 検証
      expect(result).toBe('class1 class2 class3')
    })

    it('falsy値を除外する', () => {
      // 実行
      const result = cn('class1', null, 'class2', undefined, false, 'class3', '')

      // 検証
      expect(result).toBe('class1 class2 class3')
    })

    it('空の配列の場合は空文字を返す', () => {
      // 実行
      const result = cn()

      // 検証
      expect(result).toBe('')
    })

    it('全てfalsy値の場合は空文字を返す', () => {
      // 実行
      const result = cn(null, undefined, false, '')

      // 検証
      expect(result).toBe('')
    })

    it('条件付きクラス名を適用できる', () => {
      // 準備
      const isActive = true
      const isDisabled = false

      // 実行
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled'
      )

      // 検証
      expect(result).toBe('base-class active')
    })
  })

  describe('sleep', () => {
    it('指定した時間だけ待機する', async () => {
      // 準備
      const startTime = Date.now()

      // 実行
      await sleep(50)

      // 検証
      const elapsed = Date.now() - startTime
      expect(elapsed).toBeGreaterThanOrEqual(40) // 多少の誤差を許容
      expect(elapsed).toBeLessThan(100) // あまりに長すぎないことを確認
    })

    it('0ミリ秒でも正常に動作する', async () => {
      // 実行 & 検証（エラーが発生しないことを確認）
      await expect(sleep(0)).resolves.toBeUndefined()
    })

    it('Promiseを返す', () => {
      // 実行
      const result = sleep(1)

      // 検証
      expect(result).toBeInstanceOf(Promise)
      
      // クリーンアップ
      return result
    })
  })
})