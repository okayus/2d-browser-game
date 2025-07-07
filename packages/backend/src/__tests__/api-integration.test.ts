/**
 * API統合テスト
 * 
 * 初学者向けメモ：
 * - プレイヤー作成からモンスター管理まで一連の操作をテスト
 * - 実際のAPIエンドポイントを呼び出してE2Eテストを実行
 * - データベースの状態も含めて検証
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from '../db/スキーマ';
import { プレイヤールーター } from '../api/プレイヤー';
import モンスターAPI from '../api/モンスター';
import { 初期データ投入 } from '../db/seed';
import type { データベース型 } from '../db/型定義';
import { TestD1Database, createTestD1Database } from './utils/TestD1Adapter';

// APIレスポンスの型定義
interface APIレスポンス<T = unknown> {
  成功: boolean;
  メッセージ?: string;
  データ?: T;
  件数?: number;
  エラー?: {
    コード: string;
    メッセージ: string;
  };
}

// プレイヤー作成レスポンスの型定義
interface プレイヤー作成データ型 {
  id: string;
  名前: string;
  作成日時: string;
  初期モンスター: {
    id: string;
    種族名: string;
    ニックネーム: string;
    現在HP: number;
    最大HP: number;
  } | null;
}

// モンスター獲得レスポンスの型定義
interface モンスター獲得データ型 {
  id: string;
  プレイヤーID: string;
  種族: {
    id: string;
    名前: string;
    基礎HP: number;
  };
  ニックネーム: string;
  現在HP: number;
  最大HP: number;
  捕獲日時: string;
}

// モンスター一覧データの型定義
interface モンスター一覧データ型 {
  id: string;
  ニックネーム: string;
  現在hp: number;
  最大hp: number;
  取得日時: Date;
  種族: {
    id: string;
    名前: string;
    基本hp: number;
  };
}

// プレイヤー取得データの型定義
interface プレイヤー取得データ型 {
  id: string;
  名前: string;
  作成日時: string;
}

// テスト用のHonoアプリケーション設定
const app = new Hono();
let testDb: Database.Database;
let testD1Db: TestD1Database;
let db: データベース型;

/**
 * テストデータベースのセットアップ
 * 
 * 初学者向けメモ：
 * - インメモリデータベースを使用してテストを高速化
 * - 各テスト実行前にクリーンな状態にリセット
 */
beforeAll(async () => {
  // インメモリデータベースを作成
  testDb = new Database(':memory:');
  
  // D1互換アダプターを作成
  testD1Db = createTestD1Database(testDb);
  
  // Drizzle ORM インスタンス作成
  db = drizzle(testDb, { schema }) as unknown as データベース型;

  // テーブル作成（本来はマイグレーションで実行）
  testDb.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
      updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
    );
  `);

  testDb.exec(`
    CREATE TABLE IF NOT EXISTS monster_species (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      base_hp INTEGER NOT NULL,
      description TEXT,
      created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
      updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
    );
  `);

  testDb.exec(`
    CREATE TABLE IF NOT EXISTS owned_monsters (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      species_id TEXT NOT NULL,
      nickname TEXT,
      current_hp INTEGER NOT NULL,
      max_hp INTEGER NOT NULL,
      obtained_at INTEGER DEFAULT CURRENT_TIMESTAMP,
      updated_at INTEGER DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (species_id) REFERENCES monster_species(id)
    );
  `);

  // 初期データを投入
  await 初期データ投入(db);

  // テスト用のミドルウェア設定（全体で統一したDrizzleインスタンスを使用）
  app.use('/api/*', async (c, next) => {
    c.env = { 
      DB: testD1Db as unknown as D1Database,  // D1互換性のために保持
      DRIZZLE_DB: db // 統合テスト用のDrizzleインスタンス
    };
    await next();
  });

  // APIルーターを設定
  app.route('/api/players', プレイヤールーター(db));
  app.route('/api', モンスターAPI);
});

afterAll(() => {
  testDb.close();
});

beforeEach(async () => {
  // 各テスト前にプレイヤーと所持モンスターデータをリセット
  await db.delete(schema.所持モンスター);
  await db.delete(schema.プレイヤー);
});

describe('API統合テスト: プレイヤーとモンスター管理', () => {
  /**
   * プレイヤー作成テスト
   * 
   * 初学者向けメモ：
   * - APIレスポンスの形式を検証
   * - データベースにデータが正しく保存されているかを確認
   * - 初期モンスターが付与されていることを確認
   */
  it('プレイヤー作成時に初期モンスターが付与される', async () => {
    // プレイヤー作成リクエスト
    const response = await app.request('/api/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        名前: 'テストプレイヤー',
      }),
    });

    // レスポンス検証
    expect(response.status).toBe(201);
    const responseData = await response.json() as APIレスポンス<プレイヤー作成データ型>;
    
    expect(responseData.成功).toBe(true);
    expect(responseData.メッセージ).toBe('プレイヤーが作成されました');
    expect(responseData.データ?.名前).toBe('テストプレイヤー');
    expect(responseData.データ?.初期モンスター).toBeDefined();
    
    // 初期モンスターの検証
    const 初期モンスター = responseData.データ?.初期モンスター;
    expect(初期モンスター).not.toBeNull();
    expect(['でんきネズミ', 'ほのおトカゲ', 'くさモグラ']).toContain(初期モンスター?.種族名);
    expect(初期モンスター?.現在HP).toBeGreaterThan(0);
    expect(初期モンスター?.最大HP).toBeGreaterThan(0);

    // データベース確認
    const 保存されたプレイヤー = await db
      .select()
      .from(schema.プレイヤー)
      .where(eq(schema.プレイヤー.id, responseData.データ?.id ?? ''));
    
    expect(保存されたプレイヤー).toHaveLength(1);
    expect(保存されたプレイヤー[0]?.名前).toBe('テストプレイヤー');

    // 所持モンスター確認
    const 所持モンスター = await db
      .select()
      .from(schema.所持モンスター)
      .where(eq(schema.所持モンスター.プレイヤーid, responseData.データ?.id ?? ''));
    
    expect(所持モンスター).toHaveLength(1);
    expect(所持モンスター[0]?.id).toBe(初期モンスター?.id);
  });

  /**
   * モンスター獲得テスト
   * 
   * 初学者向けメモ：
   * - 事前にプレイヤーを作成してからモンスター獲得をテスト
   * - 種族IDの存在確認
   * - 獲得後のモンスター情報検証
   */
  it('プレイヤーが新しいモンスターを獲得できる', async () => {
    // 1. プレイヤー作成
    const プレイヤー作成Response = await app.request('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 名前: 'モンスタートレーナー' }),
    });
    
    const プレイヤーData = await プレイヤー作成Response.json() as APIレスポンス<プレイヤー作成データ型>;
    const プレイヤーId = プレイヤーData.データ!.id;

    // 2. 種族情報取得（みずガメを獲得）
    const 種族一覧 = await db.select().from(schema.モンスター種族);
    const みずガメ種族 = 種族一覧.find(s => s.名前 === 'みずガメ');
    expect(みずガメ種族).toBeDefined();

    // 3. モンスター獲得
    const 獲得Response = await app.request(`/api/players/${プレイヤーId}/monsters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 種族ID: みずガメ種族!.id }),
    });

    // レスポンス検証
    expect(獲得Response.status).toBe(201);
    const 獲得Data = await 獲得Response.json() as APIレスポンス<モンスター獲得データ型>;
    
    expect(獲得Data.成功).toBe(true);
    expect(獲得Data.データ!.種族.名前).toBe('みずガメ');
    expect(獲得Data.データ!.ニックネーム).toBe('みずガメ'); // デフォルトは種族名
    expect(獲得Data.データ!.現在HP).toBe(45); // みずガメの基本HP
    expect(獲得Data.データ!.最大HP).toBe(45);

    // データベース確認
    const 所持モンスター = await db
      .select()
      .from(schema.所持モンスター)
      .where(eq(schema.所持モンスター.プレイヤーid, プレイヤーId));
    
    // 初期モンスター + 新規獲得で2体
    expect(所持モンスター).toHaveLength(2);
  });

  /**
   * モンスター一覧取得テスト
   * 
   * 初学者向けメモ：
   * - プレイヤーが所持するモンスターのみ取得されることを確認
   * - JOINによる種族情報の取得確認
   * - レスポンス形式の検証
   */
  it('プレイヤーの所持モンスター一覧を取得できる', async () => {
    // 1. プレイヤー作成
    const プレイヤー作成Response = await app.request('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 名前: 'コレクター' }),
    });
    
    const プレイヤーData = await プレイヤー作成Response.json() as APIレスポンス<プレイヤー作成データ型>;
    const プレイヤーId = プレイヤーData.データ!.id;

    // 2. 追加でモンスターを獲得
    const 種族一覧 = await db.select().from(schema.モンスター種族);
    const いわゴーレム種族 = 種族一覧.find(s => s.名前 === 'いわゴーレム');
    
    await app.request(`/api/players/${プレイヤーId}/monsters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 種族ID: いわゴーレム種族!.id }),
    });

    // 3. モンスター一覧取得
    const 一覧Response = await app.request(`/api/players/${プレイヤーId}/monsters`);
    
    expect(一覧Response.status).toBe(200);
    const 一覧Data = await 一覧Response.json() as APIレスポンス<モンスター一覧データ型[]>;
    
    expect(一覧Data.成功).toBe(true);
    expect(一覧Data.件数).toBe(2); // 初期 + 追加獲得
    expect(一覧Data.データ).toHaveLength(2);
    
    // 各モンスターの情報確認
    一覧Data.データ!.forEach((monster: モンスター一覧データ型) => {
      expect(monster.id).toBeDefined();
      expect(monster.ニックネーム).toBeDefined();
      expect(monster.種族.名前).toBeDefined();
      expect(monster.現在hp).toBeGreaterThan(0);
      expect(monster.最大hp).toBeGreaterThan(0);
    });
  });

  /**
   * ニックネーム変更テスト
   * 
   * 初学者向けメモ：
   * - モンスターの所有権確認
   * - バリデーション機能の確認
   * - データ更新の確認
   */
  it('モンスターのニックネームを変更できる', async () => {
    // 1. プレイヤー作成
    const プレイヤー作成Response = await app.request('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 名前: 'ニックネーマー' }),
    });
    
    const プレイヤーData = await プレイヤー作成Response.json() as APIレスポンス<プレイヤー作成データ型>;
    const 初期モンスター = プレイヤーData.データ!.初期モンスター;

    // 2. ニックネーム変更
    const 変更Response = await app.request(`/api/monsters/${初期モンスター!.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ニックネーム: 'ピカチュウ' }),
    });

    expect(変更Response.status).toBe(200);
    const 変更Data = await 変更Response.json() as APIレスポンス<{ ニックネーム: string }>;
    
    expect(変更Data.成功).toBe(true);
    expect(変更Data.データ!.ニックネーム).toBe('ピカチュウ');

    // データベース確認
    const 更新されたモンスター = await db
      .select()
      .from(schema.所持モンスター)
      .where(eq(schema.所持モンスター.id, 初期モンスター!.id));
    
    expect(更新されたモンスター[0]?.ニックネーム).toBe('ピカチュウ');
  });

  /**
   * ニックネーム変更バリデーションテスト
   * 
   * 初学者向けメモ：
   * - 入力値検証の確認
   * - エラーレスポンスの確認
   * - 適切なHTTPステータスコードの確認
   */
  it('無効なニックネームでエラーになる', async () => {
    // 1. プレイヤー作成
    const プレイヤー作成Response = await app.request('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 名前: 'バリデーションテスター' }),
    });
    
    const プレイヤーData = await プレイヤー作成Response.json() as APIレスポンス<プレイヤー作成データ型>;
    const 初期モンスター = プレイヤーData.データ!.初期モンスター;

    // 2. 空文字でニックネーム変更試行
    const 空文字Response = await app.request(`/api/monsters/${初期モンスター!.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ニックネーム: '' }),
    });

    expect(空文字Response.status).toBe(400);

    // 3. 長すぎるニックネーム変更試行
    const 長文字Response = await app.request(`/api/monsters/${初期モンスター!.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ニックネーム: 'a'.repeat(21) }), // 21文字
    });

    expect(長文字Response.status).toBe(400);
  });

  /**
   * モンスター解放テスト
   * 
   * 初学者向けメモ：
   * - データの物理削除確認
   * - 削除後の状態確認
   * - 存在しないモンスターでのエラーハンドリング確認
   */
  it('モンスターを解放できる', async () => {
    // 1. プレイヤー作成
    const プレイヤー作成Response = await app.request('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 名前: 'リリーサー' }),
    });
    
    const プレイヤーData = await プレイヤー作成Response.json() as APIレスポンス<プレイヤー作成データ型>;
    const プレイヤーId = プレイヤーData.データ!.id;
    const 初期モンスター = プレイヤーData.データ!.初期モンスター;

    // 解放前の確認
    const 解放前 = await db
      .select()
      .from(schema.所持モンスター)
      .where(eq(schema.所持モンスター.プレイヤーid, プレイヤーId));
    expect(解放前).toHaveLength(1);

    // 2. モンスター解放
    const 解放Response = await app.request(`/api/monsters/${初期モンスター!.id}`, {
      method: 'DELETE',
    });

    expect(解放Response.status).toBe(200);
    const 解放Data = await 解放Response.json() as APIレスポンス<unknown>;
    
    expect(解放Data.成功).toBe(true);
    expect(解放Data.メッセージ).toBe('モンスターを解放しました');

    // データベース確認（削除されていること）
    const 解放後 = await db
      .select()
      .from(schema.所持モンスター)
      .where(eq(schema.所持モンスター.プレイヤーid, プレイヤーId));
    expect(解放後).toHaveLength(0);
  });

  /**
   * 存在しないリソースへのアクセステスト
   * 
   * 初学者向けメモ：
   * - 404エラーの適切な処理確認
   * - エラーメッセージの確認
   */
  it('存在しないモンスターで404エラーになる', async () => {
    const 存在しないId = 'non-existent-id';

    // ニックネーム変更試行
    const 変更Response = await app.request(`/api/monsters/${存在しないId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ニックネーム: 'テスト' }),
    });

    expect(変更Response.status).toBe(404);
    const 変更Data = await 変更Response.json() as APIレスポンス<{ ニックネーム: string }>;
    expect(変更Data.成功).toBe(false);

    // 解放試行
    const 解放Response = await app.request(`/api/monsters/${存在しないId}`, {
      method: 'DELETE',
    });

    expect(解放Response.status).toBe(404);
    const 解放Data = await 解放Response.json() as APIレスポンス<unknown>;
    expect(解放Data.成功).toBe(false);
  });

  /**
   * プレイヤー取得テスト
   * 
   * 初学者向けメモ：
   * - 作成したプレイヤーの取得確認
   * - レスポンス形式の確認
   */
  it('作成したプレイヤーを取得できる', async () => {
    // 1. プレイヤー作成
    const 作成Response = await app.request('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 名前: '取得テストプレイヤー' }),
    });
    
    const 作成Data = await 作成Response.json() as APIレスポンス<プレイヤー作成データ型>;
    const プレイヤーId = 作成Data.データ!.id;

    // 2. プレイヤー取得
    const 取得Response = await app.request(`/api/players/${プレイヤーId}`);
    
    expect(取得Response.status).toBe(200);
    const 取得Data = await 取得Response.json() as APIレスポンス<プレイヤー取得データ型>;
    
    expect(取得Data.成功).toBe(true);
    expect(取得Data.データ!.id).toBe(プレイヤーId);
    expect(取得Data.データ!.名前).toBe('取得テストプレイヤー');
    expect(取得Data.データ!.作成日時).toBeDefined();
  });
});

/**
 * 初学者向けメモ：テスト設計のポイント
 * 
 * 1. テストの独立性
 *    - 各テストは他のテストに影響されない
 *    - beforeEachでデータをリセット
 *    - インメモリデータベースでテスト高速化
 * 
 * 2. APIテストの範囲
 *    - HTTPステータスコードの確認
 *    - レスポンス形式の確認
 *    - データベースの状態確認
 *    - エラーハンドリングの確認
 * 
 * 3. テストケースの網羅
 *    - 正常ケース
 *    - 異常ケース（バリデーションエラー、存在しないリソース）
 *    - 境界値テスト
 * 
 * 4. 実際のユーザーシナリオ
 *    - プレイヤー作成→モンスター獲得→管理の流れ
 *    - 実際のアプリケーション使用パターンをテスト
 */