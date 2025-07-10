/**
 * テスト環境セットアップファイル
 * 初学者向け: React Testing Libraryの設定と共通処理
 */

import '@testing-library/jest-dom';

// 初学者向けメモ：
// localStorageのモック実装
// テスト環境ではlocalStorageが利用できないため、モックを作成
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// 初学者向けメモ：
// ResizeObserverのモック（Tailwind CSSなどで使用される）
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 初学者向けメモ：
// matchMediaのモック（レスポンシブ対応のため）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});