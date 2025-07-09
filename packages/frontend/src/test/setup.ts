/**
 * テストセットアップファイル
 * 
 * 初学者向けメモ:
 * - Testing Library のカスタムマッチャーを設定
 * - 全テストで使用する共通設定を定義
 */

import '@testing-library/jest-dom';

// モック関数の設定（必要に応じて追加）
global.console = {
  ...console,
  // テスト中のログを非表示にする場合（デバッグ時は削除）
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};