/**
 * Vitest設定ファイル
 * バックエンドテスト用の環境設定
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    // CI環境でのCrypto API対応
    globalSetup: './src/__tests__/global-setup.ts'
  },
})