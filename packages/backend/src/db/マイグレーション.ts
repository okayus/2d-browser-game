/**
 * データベースマイグレーション設定
 * 
 * 初学者向けメモ：
 * - マイグレーションは、データベース構造の変更を管理するもの
 * - 開発中にスキーマが変更された時に、既存のデータを保持しながら構造を更新できる
 * - Drizzle KitとCloudflare D1を使用
 */

import { drizzle } from 'drizzle-orm/d1';
import { migrate } from 'drizzle-orm/d1/migrator';
import * as schema from './スキーマ';

/**
 * データベース接続とマイグレーション実行
 * 
 * @param d1Database - Cloudflare D1データベースインスタンス
 * @returns Drizzle ORMインスタンス
 */
export async function データベース初期化(d1Database: D1Database) {
  // Drizzle ORMでD1データベースに接続
  const db = drizzle(d1Database, { schema });
  
  try {
    // マイグレーションを実行
    // 初学者向けメモ：本番環境では事前にマイグレーションファイルを生成して実行
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('データベースマイグレーション完了');
    return db;
  } catch (error) {
    console.error('データベースマイグレーションエラー:', error);
    throw error;
  }
}

/**
 * 開発用：サンプルデータの投入
 * 
 * 初学者向けメモ：
 * - 開発中のテスト用にサンプルデータを用意
 * - 本番環境では実行しないよう注意
 */
export async function サンプルデータ投入(db: any) {
  try {
    // モンスター種族のサンプルデータ
    await db.insert(schema.モンスター種族).values([
      {
        id: 'fire_dragon',
        名前: '火竜',
        基本hp: 100,
        説明: '炎を吐く強力なドラゴン',
        作成日時: new Date(),
        更新日時: new Date(),
      },
      {
        id: 'water_turtle',
        名前: '水亀',
        基本hp: 80,
        説明: '水系の技を得意とする亀',
        作成日時: new Date(),
        更新日時: new Date(),
      },
      {
        id: 'grass_fairy',
        名前: '草妖精',
        基本hp: 60,
        説明: '森に住む小さな妖精',
        作成日時: new Date(),
        更新日時: new Date(),
      },
    ]);
    
    console.log('サンプルデータ投入完了');
  } catch (error) {
    console.error('サンプルデータ投入エラー:', error);
    throw error;
  }
}

/**
 * 初学者向けメモ：マイグレーションの運用について
 * 
 * 1. 開発環境
 *    - スキーマ変更時にマイグレーションファイルを自動生成
 *    - drizzle-kit generate コマンドを使用
 * 
 * 2. 本番環境
 *    - 事前にマイグレーションファイルを確認
 *    - 段階的にマイグレーションを実行
 *    - データバックアップを取得してから実行
 * 
 * 3. チーム開発
 *    - マイグレーションファイルはバージョン管理に含める
 *    - 競合を避けるため、スキーマ変更は調整して実行
 */