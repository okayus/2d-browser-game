/**
 * Vitest設定ファイル
 * フロントエンドのユニットテスト環境を設定
 */
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: 'react',
      fastRefresh: false,
    })
  ],
  test: {
    /**
     * テスト環境設定
     * jsdom: ブラウザ環境をシミュレート
     */
    environment: 'jsdom',
    
    /**
     * セットアップファイル
     * テスト実行前に共通の設定を読み込み
     */
    setupFiles: ['./src/__tests__/setup.ts'],
    
    /**
     * グローバルAPI
     * describe, it, expect などを自動インポート
     */
    globals: true,
    
    /**
     * カバレッジ設定
     * テストカバレッジの計測設定
     */
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ]
    },
    
    /**
     * ファイルパターン
     * テストファイルの検索パターン
     */
    include: [
      'src/**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    
    /**
     * 除外パターン
     */
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**'
    ]
  },
  
  /**
   * パス解決設定
   * Viteと同じパス設定を使用
   */
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // エラー防止のためにdefineプロパティを明示
  define: {
    'import.meta.vitest': 'undefined',
  },
})