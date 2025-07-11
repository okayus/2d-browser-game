/**
 * テストユーティリティ
 * テスト間で再利用可能な共通機能を提供
 */
/** @jsxImportSource react */
import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import type { ReactElement, ReactNode } from 'react'

/**
 * React Router付きのレンダリングプロバイダー
 * ページコンポーネントのテストで使用
 */
interface AllTheProvidersProps {
  children: ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

/**
 * カスタムレンダー関数
 * React Routerを含むコンポーネントのテストで使用
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// React Testing Libraryの関数を再エクスポート
export * from '@testing-library/react'

// カスタムレンダー関数をエクスポート
export { customRender as render }

/**
 * テスト用のモックデータ
 */
export const mockData = {
  /**
   * テスト用プレイヤーデータ
   */
  player: {
    id: 'test-player-id',
    name: 'テストプレイヤー',
    createdAt: '2025-07-10T00:00:00.000Z'
  },

  /**
   * テスト用モンスター種族データ
   */
  monsterSpecies: [
    {
      id: '1',
      name: 'でんきネズミ',
      icon: '⚡',
      baseHp: 35,
      rarity: 'common' as const
    },
    {
      id: '2', 
      name: 'ほのおトカゲ',
      icon: '🔥',
      baseHp: 40,
      rarity: 'common' as const
    },
    {
      id: '3',
      name: 'みずガメ',
      icon: '💧',
      baseHp: 45,
      rarity: 'rare' as const
    }
  ],

  /**
   * テスト用所持モンスターデータ
   */
  ownedMonsters: [
    {
      id: 'monster-1',
      playerId: 'test-player-id',
      speciesId: '1',
      nickname: 'ピカ',
      currentHp: 30,
      maxHp: 35,
      capturedAt: '2025-07-10T00:00:00.000Z',
      species: {
        id: '1',
        name: 'でんきネズミ',
        icon: '⚡',
        baseHp: 35,
        rarity: 'common' as const
      }
    },
    {
      id: 'monster-2',
      playerId: 'test-player-id',
      speciesId: '2',
      nickname: null,
      currentHp: 40,
      maxHp: 40,
      capturedAt: '2025-07-09T00:00:00.000Z',
      species: {
        id: '2',
        name: 'ほのおトカゲ',
        icon: '🔥',
        baseHp: 40,
        rarity: 'common' as const
      }
    }
  ]
}

/**
 * API呼び出しのモック関数
 */
export const mockAPI = {
  /**
   * 成功レスポンスのモック
   */
  successResponse: <T,>(data: T) => ({
    success: true,
    data
  }),

  /**
   * エラーレスポンスのモック
   */
  errorResponse: (message: string) => ({
    success: false,
    error: message
  }),

  /**
   * fetchのモック（成功）
   */
  mockFetchSuccess: <T,>(data: T) => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAPI.successResponse(data)
    })
  },

  /**
   * fetchのモック（エラー）
   */
  mockFetchError: (message: string, status = 400) => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status,
      json: async () => mockAPI.errorResponse(message)
    })
  },

  /**
   * fetchのモック（ネットワークエラー）
   */
  mockFetchNetworkError: () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'))
  }
}

/**
 * ローカルストレージのヘルパー関数
 */
export const localStorageHelpers = {
  /**
   * プレイヤーデータを設定
   */
  setPlayerData: (playerName: string, playerId?: string) => {
    localStorage.setItem('player_name', playerName)
    if (playerId) {
      localStorage.setItem('player_id', playerId)
    }
  },

  /**
   * モンスターデータを設定
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setMonstersData: (monsters: any[]) => {
    localStorage.setItem('monsters', JSON.stringify(monsters))
  },

  /**
   * すべてのデータをクリア
   */
  clearAll: () => {
    localStorage.clear()
  }
}

/**
 * 非同期処理の待機ヘルパー
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

/**
 * キーボードイベントのヘルパー
 */
export const createKeyboardEvent = (key: string, type: 'keydown' | 'keyup' = 'keydown') => {
  return new KeyboardEvent(type, {
    key,
    code: `Key${key.toUpperCase()}`,
    keyCode: key.charCodeAt(0),
    which: key.charCodeAt(0),
    bubbles: true
  })
}

/**
 * タッチイベントのヘルパー
 */
export const createTouchEvent = (type: string, touches: { clientX: number; clientY: number }[]) => {
  const touchList = touches.map(touch => ({ ...touch }))
  return new TouchEvent(type, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    touches: touchList as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changedTouches: touchList as any,
    bubbles: true
  })
}