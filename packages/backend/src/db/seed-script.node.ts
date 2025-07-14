/**
 * シード実行スクリプト
 * 
 * 初学者向けメモ：
 * - このファイルはCLIから直接実行される
 * - 開発環境のSQLiteデータベースに接続
 * - 初期データを投入する
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { 初期データ投入, データリセット } from './seed';
import type { データベース型 } from './types';

/**
 * メイン実行関数
 * 
 * 初学者向けメモ：
 * - process.argvでコマンドライン引数を取得
 * - --resetオプションでデータリセット
 * - エラーハンドリングで異常終了を防ぐ
 */
async function main() {
  // データベース接続
  const sqlite = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite');
  const db = drizzle(sqlite, { schema }) as unknown as データベース型;

  try {
    // コマンドライン引数の確認
    const リセットフラグ = process.argv.includes('--reset');

    if (リセットフラグ) {
      // データリセット実行
      await データリセット(db);
    }

    // 初期データ投入
    await 初期データ投入(db);

    console.log('✨ シード処理が正常に完了しました');
    process.exit(0);
  } catch (error) {
    console.error('❌ シード処理中にエラーが発生しました:', error);
    process.exit(1);
  } finally {
    // データベース接続のクリーンアップ
    sqlite.close();
  }
}

// スクリプト実行
main().catch(console.error);

/**
 * 初学者向けメモ：実行方法
 * 
 * 1. 通常の実行（既存データがあればスキップ）
 *    ```
 *    pnpm tsx packages/backend/src/db/seedスクリプト.ts
 *    ```
 * 
 * 2. リセット付き実行（全データ削除後に投入）
 *    ```
 *    pnpm tsx packages/backend/src/db/seedスクリプト.ts --reset
 *    ```
 * 
 * 3. package.jsonにスクリプトを追加済み
 *    - `pnpm seed`: 通常実行
 *    - `pnpm seed:reset`: リセット実行
 */