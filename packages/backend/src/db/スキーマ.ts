/**
 * データベーススキーマ定義
 * 
 * 初学者向けメモ：
 * - Drizzle ORMを使用してTypeScriptでデータベーススキーマを定義
 * - 型安全性が保証され、SQLクエリもTypeScriptで書ける
 * - CloudflareのD1データベース（SQLite）を使用
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * プレイヤー情報テーブル
 * 
 * 基本的なプレイヤー情報を格納
 */
export const プレイヤー = sqliteTable('players', {
  id: text('id').primaryKey(), // UUID形式のプレイヤーID
  名前: text('name').notNull(), // プレイヤー名
  作成日時: integer('created_at', { mode: 'timestamp' }).notNull(), // アカウント作成日時
  更新日時: integer('updated_at', { mode: 'timestamp' }).notNull(), // 最終更新日時
});

/**
 * モンスター種族情報テーブル
 * 
 * ゲーム内のモンスターの基本情報を定義
 * 初学者向けメモ：マスターデータとして使用
 */
export const モンスター種族 = sqliteTable('monster_species', {
  id: text('id').primaryKey(), // 種族ID（例：'fire_dragon'）
  名前: text('name').notNull(), // 種族名（例：'火竜'）
  基本hp: integer('base_hp').notNull(), // 基本HP値
  説明: text('description'), // 種族の説明
  作成日時: integer('created_at', { mode: 'timestamp' }).notNull(),
  更新日時: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

/**
 * プレイヤーの所持モンスターテーブル
 * 
 * プレイヤーが所持している個別のモンスター情報
 * 初学者向けメモ：同じ種族でも個体差があるため、個別管理が必要
 */
export const 所持モンスター = sqliteTable('owned_monsters', {
  id: text('id').primaryKey(), // 所持モンスターの一意ID
  プレイヤーid: text('player_id').notNull().references(() => プレイヤー.id), // 外部キー：プレイヤーID
  種族id: text('species_id').notNull().references(() => モンスター種族.id), // 外部キー：種族ID
  ニックネーム: text('nickname'), // プレイヤーが付けたニックネーム（null可）
  現在hp: integer('current_hp').notNull(), // 現在のHP
  最大hp: integer('max_hp').notNull(), // 最大HP
  取得日時: integer('obtained_at', { mode: 'timestamp' }).notNull(), // 取得日時
  更新日時: integer('updated_at', { mode: 'timestamp' }).notNull(), // 最終更新日時
});

/**
 * 初学者向けメモ：データベース設計のポイント
 * 
 * 1. 正規化
 *    - モンスターの種族情報は別テーブルで管理（重複データを避ける）
 *    - プレイヤー情報も別テーブルで管理
 * 
 * 2. 外部キー制約
 *    - references()を使用してデータの整合性を保つ
 *    - 削除時の制約も考慮が必要（今回は基本実装のため省略）
 * 
 * 3. 日時の管理
 *    - 作成日時と更新日時を分けて管理
 *    - timestampモードを使用してDateオブジェクトとして扱う
 * 
 * 4. NULL許可の設計
 *    - ニックネームは必須ではないため、NULL許可
 *    - 基本情報は必須項目として設定
 */