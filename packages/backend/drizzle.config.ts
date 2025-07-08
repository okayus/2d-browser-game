/**
 * Drizzle Kit設定ファイル
 * 
 * 初学者向けメモ：
 * - Drizzle Kitはマイグレーションファイル生成と管理を行うCLIツール
 * - TypeScriptのスキーマ定義からSQLマイグレーションを自動生成
 * - 開発中のスキーマ変更を効率的に管理
 */

import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/スキーマ.ts', // スキーマ定義ファイルのパス
  out: './migrations', // マイグレーションファイルの出力先
  driver: 'd1', // Cloudflare D1データベースを使用
  dbCredentials: {
    // 初学者向けメモ：wrangler.jsoncから設定を読み込む
    wranglerConfigPath: './wrangler.jsonc',
    dbName: 'monster-game-dev',
  },
} satisfies Config;

/**
 * 初学者向けメモ：Drizzle Kitの使用方法
 * 
 * 1. マイグレーションファイルの生成
 *    - `npx drizzle-kit generate:sqlite`
 *    - スキーマ変更時に実行
 * 
 * 2. マイグレーションの適用
 *    - `npx drizzle-kit push:sqlite`
 *    - 開発環境での即座な適用
 * 
 * 3. データベースの状態確認
 *    - `npx drizzle-kit introspect:sqlite`
 *    - 既存のデータベースからスキーマを逆生成
 * 
 * 4. Drizzle Studio（GUI）
 *    - `npx drizzle-kit studio`
 *    - Webベースのデータベース管理画面
 */