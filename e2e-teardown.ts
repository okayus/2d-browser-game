/**
 * E2Eテスト用グローバルティアダウン
 * 
 * 初学者向けメモ：
 * - 全E2Eテスト実行後のクリーンアップ処理
 * - リソースの解放
 * - ログファイルの整理
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * グローバルティアダウン関数
 * 
 * 初学者向けメモ：
 * - 全テスト完了後に一度だけ実行される
 * - テスト結果の整理とクリーンアップ
 * - 開発環境への影響を最小化
 */
async function globalTeardown() {
  console.log('\n🧹 E2Eテスト環境をクリーンアップ中...');
  
  try {
    // 1. テスト結果ファイルの整理
    await テスト結果整理();
    
    // 2. 一時ファイルのクリーンアップ
    await 一時ファイルクリーンアップ();
    
    // 3. データベースの最終クリーンアップ（必要に応じて）
    if (process.env.CI) {
      console.log('📊 CI環境でのデータベースクリーンアップ...');
      await execAsync('cd packages/backend && pnpm seed:reset', {
        timeout: 15000,
      });
    }
    
    // 4. ログ情報の出力
    await ログ情報出力();
    
    console.log('✅ E2Eテスト環境のクリーンアップが完了しました');
    
  } catch (error) {
    console.error('⚠️  クリーンアップ中にエラーが発生しましたが、処理を続行します:', error);
    // ティアダウンのエラーは致命的ではないため、処理を続行
  }
}

/**
 * テスト結果ファイルの整理
 * 
 * 初学者向けメモ：
 * - スクリーンショットやレポートファイルの整理
 * - 古いテスト結果の削除
 * - CI用ファイルの保持
 */
async function テスト結果整理() {
  console.log('📁 テスト結果ファイルを整理中...');
  
  try {
    const testResultsDir = 'test-results';
    const playwrightReportDir = 'playwright-report';
    
    // ディレクトリの存在確認
    const ディレクトリ一覧 = [testResultsDir, playwrightReportDir];
    
    for (const dir of ディレクトリ一覧) {
      try {
        const stats = await fs.stat(dir);
        if (stats.isDirectory()) {
          const files = await fs.readdir(dir);
          console.log(`   ${dir}: ${files.length}ファイル`);
        }
      } catch (error) {
        // ディレクトリが存在しない場合は無視
      }
    }
    
    // CI環境以外では古いファイルを削除（7日以上前）
    if (!process.env.CI) {
      await 古いファイル削除(testResultsDir, 7);
    }
    
  } catch (error) {
    console.warn('テスト結果整理でエラーが発生:', error);
  }
}

/**
 * 古いファイルの削除
 */
async function 古いファイル削除(ディレクトリ: string, 日数: number) {
  try {
    const files = await fs.readdir(ディレクトリ);
    const 現在時刻 = new Date().getTime();
    const 保持期間ms = 日数 * 24 * 60 * 60 * 1000;
    
    let 削除ファイル数 = 0;
    
    for (const filename of files) {
      const filePath = path.join(ディレクトリ, filename);
      const stats = await fs.stat(filePath);
      
      if (現在時刻 - stats.mtime.getTime() > 保持期間ms) {
        await fs.unlink(filePath);
        削除ファイル数++;
      }
    }
    
    if (削除ファイル数 > 0) {
      console.log(`   ${削除ファイル数}個の古いファイルを削除しました`);
    }
    
  } catch (error) {
    // エラーが発生しても処理は続行
  }
}

/**
 * 一時ファイルのクリーンアップ
 * 
 * 初学者向けメモ：
 * - テスト実行中に作成された一時ファイルを削除
 * - メモリ上のリソースを解放
 */
async function 一時ファイルクリーンアップ() {
  console.log('🗂️  一時ファイルをクリーンアップ中...');
  
  try {
    // ブラウザのキャッシュファイル削除
    const 一時ディレクトリ一覧 = [
      '.tmp',
      'tmp',
      '.cache',
    ];
    
    for (const dir of 一時ディレクトリ一覧) {
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch (error) {
        // ディレクトリが存在しない場合は無視
      }
    }
    
    // Node.jsのプロセス情報をクリア
    if (global.gc) {
      global.gc();
    }
    
  } catch (error) {
    console.warn('一時ファイルクリーンアップでエラーが発生:', error);
  }
}

/**
 * ログ情報の出力
 * 
 * 初学者向けメモ：
 * - テスト実行のサマリー情報を出力
 * - パフォーマンス情報の記録
 * - 次回実行のための情報提供
 */
async function ログ情報出力() {
  console.log('📋 テスト実行サマリー:');
  
  try {
    // メモリ使用量の確認
    const memoryUsage = process.memoryUsage();
    console.log(`   メモリ使用量: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    
    // 実行時間の確認
    const uptime = process.uptime();
    console.log(`   総実行時間: ${Math.floor(uptime / 60)}分${Math.floor(uptime % 60)}秒`);
    
    // 環境情報
    console.log(`   Node.js: ${process.version}`);
    console.log(`   プラットフォーム: ${process.platform}`);
    
    // CI環境での追加情報
    if (process.env.CI) {
      console.log(`   CI環境: ${process.env.CI}`);
      console.log(`   ビルド番号: ${process.env.GITHUB_RUN_NUMBER || 'N/A'}`);
    }
    
    // テスト結果ファイルの場所
    console.log('\n📊 テスト結果:');
    console.log('   - HTMLレポート: playwright-report/index.html');
    console.log('   - JUnitレポート: test-results/e2e-results.xml');
    console.log('   - スクリーンショット: test-results/');
    
  } catch (error) {
    console.warn('ログ情報出力でエラーが発生:', error);
  }
}

export default globalTeardown;

/**
 * 初学者向けメモ：E2Eテストティアダウンのポイント
 * 
 * 1. クリーンアップの重要性
 *    - テスト実行後の環境をクリーンな状態に戻す
 *    - 次回実行時の一貫性を保証
 *    - CI/CD環境でのリソース効率化
 * 
 * 2. エラー耐性
 *    - ティアダウン処理の失敗は致命的ではない
 *    - 部分的な失敗でも処理を続行
 *    - エラーログは出力するが例外は投げない
 * 
 * 3. 環境別の処理
 *    - CI環境と開発環境での処理の使い分け
 *    - 本番環境への影響回避
 *    - リソース制約に応じた最適化
 * 
 * 4. 可視性の向上
 *    - 実行結果の要約表示
 *    - ファイルの保存場所案内
 *    - パフォーマンス情報の提供
 * 
 * 5. 保守性の配慮
 *    - 古いファイルの自動削除
 *    - ディスク容量の効率的使用
 *    - デバッグ情報の適切な保持
 */