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
 * プレイヤー情報テーブル（Player information table）
 * 
 * 基本的なプレイヤー情報を格納（Stores basic player information）
 */
export const players = sqliteTable('players', {
  /** UUID形式のプレイヤーID（Player ID in UUID format） */
  id: text('id').primaryKey(),
  /** プレイヤー名（Player name） */
  name: text('name').notNull(),
  /** Firebase認証UID（Firebase Authentication UID） */
  firebaseUid: text('firebase_uid').unique(),
  /** アカウント作成日時（Account creation timestamp） */
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  /** 最終更新日時（Last update timestamp） */
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

/**
 * モンスター種族情報テーブル（Monster species information table）
 * 
 * ゲーム内のモンスターの基本情報を定義（Defines basic information for monsters in the game）
 * 初学者向けメモ：マスターデータとして使用（For beginners: Used as master data）
 */
export const monsterSpecies = sqliteTable('monster_species', {
  /** 種族ID（例：'fire_dragon'）（Species ID, e.g. 'fire_dragon'） */
  id: text('id').primaryKey(),
  /** 種族名（例：'火竜'）（Species name, e.g. 'Fire Dragon'） */
  name: text('name').notNull(),
  /** 基本HP値（Base HP value） */
  baseHp: integer('base_hp').notNull(),
  /** 種族の説明（Species description） */
  description: text('description'),
  /** 作成日時（Creation timestamp） */
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  /** 更新日時（Update timestamp） */
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

/**
 * プレイヤーの所持モンスターテーブル（Player owned monsters table）
 * 
 * プレイヤーが所持している個別のモンスター情報（Individual monster information owned by players）
 * 初学者向けメモ：同じ種族でも個体差があるため、個別管理が必要（For beginners: Individual management needed due to differences even within same species）
 */
export const ownedMonsters = sqliteTable('owned_monsters', {
  /** 所持モンスターの一意ID（Unique ID of owned monster） */
  id: text('id').primaryKey(),
  /** 外部キー：プレイヤーID（Foreign key: Player ID） */
  playerId: text('player_id').notNull().references(() => players.id),
  /** 外部キー：種族ID（Foreign key: Species ID） */
  speciesId: text('species_id').notNull().references(() => monsterSpecies.id),
  /** プレイヤーが付けたニックネーム（null可）（Player-assigned nickname, nullable） */
  nickname: text('nickname'),
  /** 現在のHP（Current HP） */
  currentHp: integer('current_hp').notNull(),
  /** 最大HP（Maximum HP） */
  maxHp: integer('max_hp').notNull(),
  /** 取得日時（Obtained timestamp） */
  obtainedAt: integer('obtained_at', { mode: 'timestamp' }).notNull(),
  /** 最終更新日時（Last update timestamp） */
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 後方互換性のためのエイリアス（Backward compatibility aliases）
// 初学者向け：既存コードとの互換性を保ちながら段階的に移行するためのエイリアス
// （For beginners: Aliases for gradual migration while maintaining compatibility with existing code）

/** @deprecated Use players instead. プレイヤー → players への移行用エイリアス */
export const プレイヤー = players;

/** @deprecated Use monsterSpecies instead. モンスター種族 → monsterSpecies への移行用エイリアス */
export const モンスター種族 = monsterSpecies;

/** @deprecated Use ownedMonsters instead. 所持モンスター → ownedMonsters への移行用エイリアス */
export const 所持モンスター = ownedMonsters;

/**
 * 初学者向けメモ：データベース設計のポイント（Database design points for beginners）
 * 
 * 1. 正規化（Normalization）
 *    - モンスターの種族情報は別テーブルで管理（重複データを避ける）
 *      （Monster species information is managed in a separate table to avoid duplicate data）
 *    - プレイヤー情報も別テーブルで管理
 *      （Player information is also managed in a separate table）
 * 
 * 2. 外部キー制約（Foreign key constraints）
 *    - references()を使用してデータの整合性を保つ
 *      （Use references() to maintain data integrity）
 *    - 削除時の制約も考慮が必要（今回は基本実装のため省略）
 *      （Deletion constraints should be considered, omitted for basic implementation）
 * 
 * 3. 日時の管理（Timestamp management）
 *    - 作成日時と更新日時を分けて管理
 *      （Manage creation and update timestamps separately）
 *    - timestampモードを使用してDateオブジェクトとして扱う
 *      （Use timestamp mode to handle as Date objects）
 * 
 * 4. NULL許可の設計（Nullable field design）
 *    - ニックネームは必須ではないため、NULL許可
 *      （Nickname is not required, so NULL is allowed）
 *    - 基本情報は必須項目として設定
 *      （Basic information is set as required fields）
 * 
 * 5. Firebase認証統合（Firebase authentication integration）
 *    - firebaseUidでFirebase Authenticationと連携
 *      （Link with Firebase Authentication via firebaseUid）
 *    - 一意制約でアカウントの重複を防止
 *      （Prevent account duplication with unique constraint）
 */