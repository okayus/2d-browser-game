/**
 * Playwright設定ファイル
 * 
 * 初学者向けメモ：
 * - E2Eテストの実行環境を設定
 * - 複数ブラウザでのテスト実行
 * - レポート生成とスクリーンショット設定
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright設定
 * 
 * 初学者向けメモ：
 * - 各種ブラウザでのテスト実行設定
 * - 開発サーバーの自動起動設定
 * - エラー時のスクリーンショット保存
 */
export default defineConfig({
  // テストファイルの場所
  testDir: './packages/frontend/src/__tests__/e2e',
  
  // テストの並行実行数（CPUコア数に基づく）
  fullyParallel: true,
  
  // CIでのfail-fast設定
  forbidOnly: !!process.env.CI,
  
  // 失敗時のリトライ回数
  retries: process.env.CI ? 2 : 0,
  
  // ワーカープロセス数
  workers: process.env.CI ? 1 : undefined,
  
  // レポーター設定
  reporter: [
    // HTML形式のレポート（ローカル開発用）
    ['html', { outputFolder: 'playwright-report' }],
    // CI用のライン表示
    ['line'],
    // JUnit形式（CI統合用）
    ['junit', { outputFile: 'test-results/e2e-results.xml' }],
  ],
  
  // グローバル設定
  use: {
    // ベースURL（開発サーバー）
    baseURL: 'http://localhost:5173',
    
    // エラー時のスクリーンショット保存
    screenshot: 'only-on-failure',
    
    // エラー時の動画録画
    video: 'retain-on-failure',
    
    // ネットワークログの記録
    trace: 'on-first-retry',
    
    // デフォルトのタイムアウト
    actionTimeout: 10 * 1000, // 10秒
    navigationTimeout: 30 * 1000, // 30秒
  },

  // テストプロジェクト設定（異なるブラウザ・デバイス）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // モバイルブラウザテスト
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // タブレットテスト
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // 開発サーバーの自動起動設定
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2分でタイムアウト
    
    // 開発サーバーの出力を表示（デバッグ用）
    stdout: 'pipe',
    stderr: 'pipe',
  },
  
  // 出力ディレクトリ設定
  outputDir: 'test-results/',
  
  // グローバルセットアップ・ティアダウン
  globalSetup: require.resolve('./e2e-setup.ts'),
  globalTeardown: require.resolve('./e2e-teardown.ts'),
  
  // テスト設定のカスタマイズ
  expect: {
    // アサーションのタイムアウト
    timeout: 5 * 1000, // 5秒
    
    // スクリーンショット比較の閾値
    threshold: 0.2,
  },
  
  // テストファイルのパターン
  testMatch: '**/*.spec.ts',
  
  // テストの実行順序設定
  testIgnore: [
    // パフォーマンステストは通常のE2Eと分離
    '**/performance.spec.ts',
  ],
});

/**
 * 初学者向けメモ：Playwright設定のポイント
 * 
 * 1. ブラウザサポート
 *    - Chromium, Firefox, WebKit（Safari）の3大エンジン
 *    - モバイルブラウザのエミュレーション
 *    - 実際のデバイス特性の再現
 * 
 * 2. CI/CD統合
 *    - 環境変数による設定の切り替え
 *    - リトライ機能による安定性向上
 *    - レポート形式の多様化
 * 
 * 3. デバッグ支援
 *    - スクリーンショット・動画の自動保存
 *    - ネットワークトレースの記録
 *    - 詳細なHTMLレポート
 * 
 * 4. パフォーマンス配慮
 *    - 並行実行による高速化
 *    - 開発サーバーの再利用
 *    - 適切なタイムアウト設定
 * 
 * 5. 保守性
 *    - 設定の一元管理
 *    - プロジェクト単位での設定分離
 *    - テストファイルの整理
 */