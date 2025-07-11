/**
 * Playwright E2Eテスト設定ファイル
 * モンスター収集ゲームのエンドツーエンドテスト環境を設定
 */

import { defineConfig, devices } from '@playwright/test'

/**
 * PlaywrightのE2Eテスト設定
 * 複数ブラウザでの並列実行、スクリーンショット、動画録画を設定
 */
export default defineConfig({
  // テストディレクトリの指定
  testDir: './e2e',
  
  // テストファイルのパターン
  testMatch: /.*\.spec\.ts/,
  
  // グローバルタイムアウト（30分）
  globalTimeout: 30 * 60 * 1000,
  
  // 個別テストのタイムアウト（30秒）
  timeout: 30 * 1000,
  
  // アサーションのタイムアウト（5秒）
  expect: {
    timeout: 5000
  },
  
  // 失敗時の再試行回数
  retries: process.env.CI ? 2 : 0,
  
  // 並列実行のワーカー数
  workers: process.env.CI ? 2 : undefined,
  
  // 失敗したテストの詳細レポート
  fullyParallel: true,
  
  // 失敗時に他のテストを停止しない
  forbidOnly: !!process.env.CI,
  
  // レポーター設定
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  // テスト成果物の設定
  use: {
    // ベースURL（開発サーバー）
    baseURL: 'http://localhost:5173',
    
    // ブラウザトレース（失敗時のみ）
    trace: 'on-first-retry',
    
    // スクリーンショット（失敗時のみ）
    screenshot: 'only-on-failure',
    
    // 動画録画（失敗時のみ）
    video: 'retain-on-failure',
    
    // ビューポートサイズ
    viewport: { width: 1280, height: 720 },
    
    // アクション前の待機時間
    actionTimeout: 5000,
    
    // ナビゲーションタイムアウト
    navigationTimeout: 10000,
  },

  // プロジェクト設定（Chromiumのみ）
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome固有の設定
        launchOptions: {
          args: [
            '--disable-web-security', 
            '--disable-features=VizDisplayCompositor',
            '--allow-running-insecure-content',
            '--disable-site-isolation-trials'
          ],
        }
      },
    },

    // 他のブラウザは一時的に無効化
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // // モバイルテスト
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },

    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // 開発サーバー設定
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2分
  },
})