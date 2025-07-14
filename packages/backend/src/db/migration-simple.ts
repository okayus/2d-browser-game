/**
 * シンプルなデータベース初期化（マイグレーションなし）
 * 
 * 初学者向けメモ：
 * - Cloudflare Workers環境でのシンプルな初期化
 * - マイグレーションは別途wranglerコマンドで実行
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import type { データベース型, D1データベース型 } from './types';
import { ロガー } from '../utils/logger';

/**
 * データベース接続の初期化（マイグレーションなし）
 * 
 * @param d1Database - Cloudflare D1データベースインスタンス
 * @returns 型安全なDrizzle ORMインスタンス
 */
export async function データベース初期化(
  d1Database: D1データベース型
): Promise<データベース型> {
  // Drizzle ORMでD1データベースに接続
  const db = drizzle(d1Database, { schema });
  
  ロガー.情報('データベース接続初期化完了');
  return db;
}