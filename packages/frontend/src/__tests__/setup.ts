/**
 * Vitestテストセットアップファイル
 * 全てのテストで共通の設定とモックを初期化
 */
import '@testing-library/jest-dom'

/**
 * LocalStorageのモック実装
 * ブラウザ環境のLocalStorageをシミュレート
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    /**
     * アイテムを取得
     */
    getItem: (key: string): string | null => {
      return store[key] || null
    },

    /**
     * アイテムを設定
     */
    setItem: (key: string, value: string): void => {
      store[key] = value.toString()
    },

    /**
     * アイテムを削除
     */
    removeItem: (key: string): void => {
      delete store[key]
    },

    /**
     * すべてのアイテムをクリア
     */
    clear: (): void => {
      store = {}
    },

    /**
     * キーの数を取得
     */
    get length(): number {
      return Object.keys(store).length
    },

    /**
     * インデックスでキーを取得
     */
    key: (index: number): string | null => {
      const keys = Object.keys(store)
      return keys[index] || null
    }
  }
})()

// グローバルオブジェクトにLocalStorageモックを設定
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

/**
 * Window.confirmのモック
 * テスト中の確認ダイアログをシミュレート
 */
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true), // デフォルトで「OK」を返す
  writable: true
})

/**
 * Window.alertのモック
 * テスト中のアラートダイアログをシミュレート
 */
Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true
})

/**
 * matchMediaのモック
 * レスポンシブデザインのテストに必要
 */
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // 互換性のため
    removeListener: vi.fn(), // 互換性のため
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  writable: true
})

/**
 * ResizeObserverのモック
 * 要素のサイズ変更監視をシミュレート
 */
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

/**
 * IntersectionObserverのモック
 * 要素の表示状態監視をシミュレート
 */
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))

/**
 * console.errorのモック
 * React Testing Libraryの警告を抑制
 */
const originalError = console.error
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

/**
 * 各テスト後のクリーンアップ
 * LocalStorageとモックをリセット
 */
afterEach(() => {
  // LocalStorageをクリア
  localStorage.clear()
  
  // すべてのモックをクリア
  vi.clearAllMocks()
  
  // LocalStorageモックをリセット
  localStorageMock.clear()
})