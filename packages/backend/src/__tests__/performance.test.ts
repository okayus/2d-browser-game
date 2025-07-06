/**
 * パフォーマンステスト
 * 
 * 初学者向けメモ：
 * - APIのレスポンス時間を測定
 * - 大量データでの動作確認
 * - メモリ使用量の監視
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../db/スキーマ';
import { プレイヤールーター } from '../api/プレイヤー';
import モンスターAPI from '../api/モンスター';
import { 初期データ投入 } from '../db/seed';
import type { データベース型 } from '../db/型定義';

const app = new Hono();
let testDb: Database.Database;
let db: データベース型;

beforeAll(async () => {
  // インメモリデータベースを作成
  testDb = new Database(':memory:');
  db = drizzle(testDb, { schema }) as unknown as データベース型;

  // テーブル作成
  testDb.exec(`
    CREATE TABLE IF NOT EXISTS プレイヤー (
      id TEXT PRIMARY KEY,
      名前 TEXT NOT NULL,
      作成日時 TEXT DEFAULT CURRENT_TIMESTAMP,
      更新日時 TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  testDb.exec(`
    CREATE TABLE IF NOT EXISTS モンスター種族 (
      id TEXT PRIMARY KEY,
      名前 TEXT NOT NULL,
      基本hp INTEGER NOT NULL,
      説明 TEXT,
      作成日時 TEXT DEFAULT CURRENT_TIMESTAMP,
      更新日時 TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  testDb.exec(`
    CREATE TABLE IF NOT EXISTS 所持モンスター (
      id TEXT PRIMARY KEY,
      プレイヤーid TEXT NOT NULL,
      種族id TEXT NOT NULL,
      ニックネーム TEXT,
      現在hp INTEGER NOT NULL,
      最大hp INTEGER NOT NULL,
      取得日時 TEXT DEFAULT CURRENT_TIMESTAMP,
      更新日時 TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (プレイヤーid) REFERENCES プレイヤー(id),
      FOREIGN KEY (種族id) REFERENCES モンスター種族(id)
    );
  `);

  // 初期データ投入
  await 初期データ投入(db);

  // APIルーター設定
  app.route('/api/players', プレイヤールーター(db));
  app.route('/api', モンスターAPI);

  app.use('/api/*', async (c, next) => {
    // @ts-expect-error テスト用の環境変数設定
    c.env = { DB: testDb };
    await next();
  });
});

afterAll(() => {
  testDb.close();
});

beforeEach(async () => {
  // プレイヤーと所持モンスターデータをクリア
  await db.delete(schema.所持モンスター);
  await db.delete(schema.プレイヤー);
});

/**
 * 実行時間測定ヘルパー関数
 * 
 * 初学者向けメモ：
 * - 高精度タイマーを使用して実行時間を測定
 * - ミリ秒単位での計測
 */
async function 実行時間測定<T>(処理: () => Promise<T>): Promise<{ 結果: T; 実行時間ms: number }> {
  const 開始時刻 = performance.now();
  const 結果 = await 処理();
  const 終了時刻 = performance.now();
  
  return {
    結果,
    実行時間ms: 終了時刻 - 開始時刻,
  };
}

describe('パフォーマンステスト', () => {
  /**
   * プレイヤー作成のレスポンス時間テスト
   * 
   * 初学者向けメモ：
   * - 単一のAPI呼び出しのパフォーマンス測定
   * - 許容範囲内の応答時間かを確認
   */
  it('プレイヤー作成が500ms以内で完了する', async () => {
    const { 結果, 実行時間ms } = await 実行時間測定(async () => {
      return await app.request('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 名前: 'パフォーマンステスト' }),
      });
    });

    expect(結果.status).toBe(201);
    expect(実行時間ms).toBeLessThan(500);
    
    console.log(`プレイヤー作成時間: ${実行時間ms.toFixed(2)}ms`);
  });

  /**
   * 大量モンスター取得のパフォーマンステスト
   * 
   * 初学者向けメモ：
   * - 大量データでの動作確認
   * - スケーラビリティの検証
   * - N+1問題の確認
   */
  it('100体のモンスター一覧取得が1秒以内で完了する', async () => {
    // 1. プレイヤー作成
    const プレイヤー作成Response = await app.request('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 名前: '大量モンスタートレーナー' }),
    });
    
    const プレイヤーData = await プレイヤー作成Response.json();
    const プレイヤーId = プレイヤーData.データ.id;

    // 2. 種族情報取得
    const 種族一覧 = await db.select().from(schema.モンスター種族);
    expect(種族一覧.length).toBeGreaterThan(0);

    // 3. 大量のモンスターを作成（直接データベースに挿入で高速化）
    const モンスター作成開始 = performance.now();
    
    const 大量モンスターデータ = [];
    for (let i = 0; i < 100; i++) {
      const 種族 = 種族一覧[i % 種族一覧.length]!;
      大量モンスターデータ.push({
        id: `monster-${i}`,
        プレイヤーid: プレイヤーId,
        種族id: 種族.id,
        ニックネーム: `モンスター${i + 1}`,
        現在hp: 種族.基本hp,
        最大hp: 種族.基本hp,
        取得日時: new Date(),
        更新日時: new Date(),
      });
    }

    // バッチ挿入
    await db.insert(schema.所持モンスター).values(大量モンスターデータ);
    
    const モンスター作成時間 = performance.now() - モンスター作成開始;
    console.log(`100体のモンスター作成時間: ${モンスター作成時間.toFixed(2)}ms`);

    // 4. 一覧取得のパフォーマンス測定
    const { 結果, 実行時間ms } = await 実行時間測定(async () => {
      return await app.request(`/api/players/${プレイヤーId}/monsters`);
    });

    expect(結果.status).toBe(200);
    expect(実行時間ms).toBeLessThan(1000); // 1秒以内

    const 一覧Data = await 結果.json();
    expect(一覧Data.件数).toBe(101); // 初期モンスター + 100体
    
    console.log(`100体のモンスター一覧取得時間: ${実行時間ms.toFixed(2)}ms`);
  });

  /**
   * 連続API呼び出しのパフォーマンステスト
   * 
   * 初学者向けメモ：
   * - 実際の使用パターンに近い連続処理のテスト
   * - データベース接続プールの効果確認
   * - 平均応答時間の計測
   */
  it('連続したニックネーム変更が安定したパフォーマンスを保つ', async () => {
    // 1. プレイヤーとモンスター準備
    const プレイヤー作成Response = await app.request('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 名前: '連続操作テスター' }),
    });
    
    const プレイヤーData = await プレイヤー作成Response.json();
    const 初期モンスター = プレイヤーData.データ.初期モンスター;

    // 2. 10回連続でニックネーム変更
    const 実行時間一覧: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const { 実行時間ms } = await 実行時間測定(async () => {
        return await app.request(`/api/monsters/${初期モンスター.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ニックネーム: `変更後${i + 1}` }),
        });
      });
      
      実行時間一覧.push(実行時間ms);
    }

    // 3. パフォーマンス分析
    const 平均実行時間 = 実行時間一覧.reduce((合計, 時間) => 合計 + 時間, 0) / 実行時間一覧.length;
    const 最大実行時間 = Math.max(...実行時間一覧);
    const 最小実行時間 = Math.min(...実行時間一覧);

    console.log(`ニックネーム変更 - 平均: ${平均実行時間.toFixed(2)}ms, 最大: ${最大実行時間.toFixed(2)}ms, 最小: ${最小実行時間.toFixed(2)}ms`);

    // 4. パフォーマンス要件確認
    expect(平均実行時間).toBeLessThan(100); // 平均100ms以内
    expect(最大実行時間).toBeLessThan(500); // 最大でも500ms以内
    
    // 5. パフォーマンスの安定性確認（最大と最小の差が大きすぎないか）
    const パフォーマンス変動率 = (最大実行時間 - 最小実行時間) / 平均実行時間;
    expect(パフォーマンス変動率).toBeLessThan(2.0); // 変動率200%以内
  });

  /**
   * 同時接続数のパフォーマンステスト
   * 
   * 初学者向けメモ：
   * - 並行処理の性能確認
   * - 競合状態の検出
   * - スループットの測定
   */
  it('10件の同時プレイヤー作成が適切に処理される', async () => {
    const 同時実行数 = 10;
    
    const { 結果: プレイヤー作成結果一覧, 実行時間ms } = await 実行時間測定(async () => {
      // 同時に複数のプレイヤー作成リクエストを送信
      const プロミス一覧 = [];
      
      for (let i = 0; i < 同時実行数; i++) {
        const プロミス = app.request('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 名前: `同時作成プレイヤー${i + 1}` }),
        });
        
        プロミス一覧.push(プロミス);
      }
      
      return await Promise.all(プロミス一覧);
    });

    // 全てのリクエストが成功したことを確認
    プレイヤー作成結果一覧.forEach((response, index) => {
      expect(response.status).toBe(201);
    });

    // 同時実行でも許容時間内で完了することを確認
    expect(実行時間ms).toBeLessThan(2000); // 2秒以内

    // 実際にデータベースに保存されていることを確認
    const 保存されたプレイヤー一覧 = await db.select().from(schema.プレイヤー);
    expect(保存されたプレイヤー一覧.length).toBe(同時実行数);

    console.log(`${同時実行数}件の同時プレイヤー作成時間: ${実行時間ms.toFixed(2)}ms`);
    console.log(`1件あたりの平均処理時間: ${(実行時間ms / 同時実行数).toFixed(2)}ms`);
  });

  /**
   * メモリ使用量監視テスト
   * 
   * 初学者向けメモ：
   * - Node.jsプロセスのメモリ使用量確認
   * - メモリリークの検出
   * - ガベージコレクションの効果確認
   */
  it('大量処理後のメモリ使用量が適切な範囲内である', async () => {
    // 初期メモリ使用量測定
    const 初期メモリ = process.memoryUsage();
    
    // プレイヤー作成
    const プレイヤー作成Response = await app.request('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 名前: 'メモリテストプレイヤー' }),
    });
    
    const プレイヤーData = await プレイヤー作成Response.json();
    const プレイヤーId = プレイヤーData.データ.id;

    // 大量のAPI呼び出し実行
    for (let i = 0; i < 50; i++) {
      // モンスター一覧取得
      await app.request(`/api/players/${プレイヤーId}/monsters`);
      
      // ニックネーム変更
      const 初期モンスター = プレイヤーData.データ.初期モンスター;
      await app.request(`/api/monsters/${初期モンスター.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ニックネーム: `テスト${i}` }),
      });
    }

    // ガベージコレクション実行
    if (global.gc) {
      global.gc();
    }

    // 最終メモリ使用量測定
    const 最終メモリ = process.memoryUsage();
    
    // メモリ使用量の増加を確認
    const メモリ増加量MB = (最終メモリ.heapUsed - 初期メモリ.heapUsed) / 1024 / 1024;
    
    console.log(`初期ヒープ使用量: ${(初期メモリ.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`最終ヒープ使用量: ${(最終メモリ.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`メモリ増加量: ${メモリ増加量MB.toFixed(2)}MB`);

    // メモリ増加量が許容範囲内であることを確認（50MB以内）
    expect(メモリ増加量MB).toBeLessThan(50);
  });

  /**
   * データベースクエリパフォーマンステスト
   * 
   * 初学者向けメモ：
   * - SQLクエリの実行時間測定
   * - インデックスの効果確認
   * - JOIN処理のパフォーマンス確認
   */
  it('複雑なクエリが適切なパフォーマンスで実行される', async () => {
    // テストデータの準備
    const プレイヤー作成Response = await app.request('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 名前: 'クエリテストプレイヤー' }),
    });
    
    const プレイヤーData = await プレイヤー作成Response.json();
    const プレイヤーId = プレイヤーData.データ.id;

    // 複数の種族のモンスターを作成
    const 種族一覧 = await db.select().from(schema.モンスター種族);
    
    for (let i = 0; i < 20; i++) {
      const 種族 = 種族一覧[i % 種族一覧.length]!;
      await db.insert(schema.所持モンスター).values({
        id: `query-test-monster-${i}`,
        プレイヤーid: プレイヤーId,
        種族id: 種族.id,
        ニックネーム: `クエリテスト${i}`,
        現在hp: 種族.基本hp - (i % 10), // 異なるHP値
        最大hp: 種族.基本hp,
        取得日時: new Date(Date.now() - i * 1000 * 60 * 60), // 異なる日時
        更新日時: new Date(),
      });
    }

    // 複雑なクエリの実行時間測定
    const { 実行時間ms } = await 実行時間測定(async () => {
      // フィルタリング付きの一覧取得
      return await app.request(`/api/players/${プレイヤーId}/monsters?sort=captured_at&order=desc`);
    });

    expect(実行時間ms).toBeLessThan(200); // 200ms以内
    
    console.log(`ソート付きモンスター一覧取得時間: ${実行時間ms.toFixed(2)}ms`);
  });
});

/**
 * 初学者向けメモ：パフォーマンステストのポイント
 * 
 * 1. 測定指標
 *    - レスポンス時間: ユーザー体験に直結
 *    - スループット: 同時処理能力
 *    - メモリ使用量: リソース効率性
 *    - CPU使用率: システム負荷
 * 
 * 2. テスト設計
 *    - 実際の使用パターンを想定
 *    - 境界値での動作確認
 *    - 長時間動作での安定性確認
 *    - 異常時の挙動確認
 * 
 * 3. パフォーマンス要件
 *    - ユーザビリティの観点から許容値を設定
 *    - システムリソースの制約を考慮
 *    - 将来的な拡張性を考慮
 * 
 * 4. 最適化のヒント
 *    - データベースのインデックス設計
 *    - 不要なデータの除外
 *    - キャッシュの活用
 *    - 非同期処理の適切な使用
 * 
 * 5. 継続的監視
 *    - CIパイプラインでの自動実行
 *    - パフォーマンス劣化の早期検出
 *    - ベンチマーク結果の記録・分析
 */