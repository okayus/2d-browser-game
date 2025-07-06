/**
 * E2Eテスト用グローバルセットアップ
 * 
 * 初学者向けメモ：
 * - 全E2Eテスト実行前の準備処理
 * - データベースの初期化
 * - テスト環境の構築
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * グローバルセットアップ関数
 * 
 * 初学者向けメモ：
 * - テスト実行前に一度だけ実行される
 * - データベースのリセットと初期データ投入
 * - 環境変数の設定確認
 */
async function globalSetup() {
  console.log('🔧 E2Eテスト環境をセットアップ中...');
  
  try {
    // 1. データベースのリセットと初期データ投入
    console.log('📊 データベースを初期化中...');
    await execAsync('cd packages/backend && pnpm seed:reset', {
      timeout: 30000, // 30秒タイムアウト
    });
    
    console.log('✅ データベースの初期化が完了しました');
    
    // 2. 環境変数の確認
    console.log('🔍 環境設定を確認中...');
    
    const 必要な環境変数 = [
      'NODE_ENV',
    ];
    
    for (const 変数名 of 必要な環境変数) {
      if (!process.env[変数名]) {
        console.warn(`⚠️  環境変数 ${変数名} が設定されていません`);
      }
    }
    
    // 3. テスト用の設定情報出力
    console.log('📋 テスト環境情報:');
    console.log(`   - Node.js: ${process.version}`);
    console.log(`   - 環境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - テストURL: http://localhost:5173`);
    
    console.log('✅ E2Eテスト環境のセットアップが完了しました\n');
    
  } catch (error) {
    console.error('❌ E2Eテスト環境のセットアップに失敗しました:', error);
    throw error;
  }
}

export default globalSetup;

/**
 * 初学者向けメモ：E2Eテストセットアップのポイント
 * 
 * 1. 環境の一貫性
 *    - 全テスト共通の初期状態を保証
 *    - データベースのクリーンな状態からスタート
 *    - 環境変数の適切な設定確認
 * 
 * 2. 依存関係の準備
 *    - 外部サービスの起動確認
 *    - 必要なファイルの存在確認
 *    - ネットワーク接続の確認
 * 
 * 3. パフォーマンス配慮
 *    - 重い処理はセットアップで一度だけ実行
 *    - テスト間で共有可能なリソースの準備
 *    - タイムアウト設定による無限待機の回避
 * 
 * 4. エラーハンドリング
 *    - セットアップ失敗時の明確なエラーメッセージ
 *    - 部分的な失敗でも続行可能な設計
 *    - ログ出力による問題の特定支援
 * 
 * 5. 開発体験
 *    - 進捗状況の可視化
 *    - 有用な情報の出力
 *    - デバッグしやすい構造
 */