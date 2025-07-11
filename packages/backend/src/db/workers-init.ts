/**
 * Cloudflare Workers対応データベース初期化
 * 
 * 初学者向けメモ：
 * - Cloudflare Workersではファイルシステムアクセスができないため、
 *   マイグレーションファイルを使わずに直接テーブルを作成
 * - 初期データの投入も含む
 */

import { drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import { 初期データ投入 } from './seed';
import type { データベース型, D1データベース型 } from './types';
import { ロガー } from '../utils/logger';

/**
 * Workers環境でのデータベース初期化
 * 
 * @param d1Database - Cloudflare D1データベースインスタンス
 * @returns 型安全なDrizzle ORMインスタンス
 */
export async function Workers対応データベース初期化(
  d1Database: D1データベース型
): Promise<データベース型> {
  // Drizzle ORMでD1データベースに接続
  const db = drizzle(d1Database, { schema });
  
  try {
    // テーブルが存在するかチェック（簡易版）
    // SQLiteのマスターテーブルを確認
    const tablesCheck = await db.all(sql`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('players', 'monster_species', 'owned_monsters')
    `);
    
    // 必要なテーブルがすべて存在するかチェック
    const requiredTables = ['players', 'monster_species', 'owned_monsters'];
    const existingTables = tablesCheck.map((row: any) => row.name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      ロガー.情報('データベーステーブルを作成中...', { missingTables });
      await createTables(db);
      ロガー.情報('データベーステーブル作成完了');
    } else {
      ロガー.デバッグ('データベーステーブルは既に存在します');
    }
    
    // 初期データを投入（重複チェック付き）
    await 初期データ投入(db);
    
    ロガー.情報('Workers対応データベース初期化完了');
    return db;
  } catch (error) {
    ロガー.エラー('Workers対応データベース初期化エラー', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * テーブル作成関数
 * マイグレーションファイルの内容を直接実行
 */
async function createTables(db: データベース型) {
  // プレイヤーテーブル作成
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS players (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )
  `);
  
  // モンスター種族テーブル作成
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS monster_species (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      base_hp integer NOT NULL,
      description text,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )
  `);
  
  // 所持モンスターテーブル作成
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS owned_monsters (
      id text PRIMARY KEY NOT NULL,
      player_id text NOT NULL,
      species_id text NOT NULL,
      nickname text,
      current_hp integer NOT NULL,
      max_hp integer NOT NULL,
      obtained_at integer NOT NULL,
      updated_at integer NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id) ON UPDATE no action ON DELETE no action,
      FOREIGN KEY (species_id) REFERENCES monster_species(id) ON UPDATE no action ON DELETE no action
    )
  `);
  
  ロガー.情報('すべてのテーブルを作成しました');
}

/**
 * 初学者向けメモ：Workers環境での制約と対策
 * 
 * 1. ファイルシステムアクセス不可
 *    - マイグレーションファイルが読めない
 *    - 直接SQL文を実行して解決
 * 
 * 2. Node.jsモジュールの制限
 *    - fsモジュールなどは使用不可
 *    - Workers APIを使用
 * 
 * 3. テーブル作成の冪等性
 *    - CREATE TABLE IF NOT EXISTS を使用
 *    - 重複実行を防止
 * 
 * 4. エラーハンドリング
 *    - Workers環境特有のエラーに対応
 *    - 適切なログ出力
 */