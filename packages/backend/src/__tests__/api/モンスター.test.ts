/**
 * モンスターAPI単体テスト
 * 
 * 初学者向けメモ：
 * - TDD原則に基づいたAPI単体テスト
 * - モックを使用して外部依存を分離
 * - 各APIエンドポイントの正常・異常系を網羅
 * - Week2実装計画に基づいた仕様テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import type { データベース型 } from '../../db/型定義';
import モンスターAPI from '../../api/モンスター';

/**
 * テスト用のモックデータベース設定
 * 
 * 初学者向けメモ：
 * - vi.fn()でモック関数を作成
 * - 外部依存（データベース）を分離してテストを高速化
 * - 予測可能な結果を返すことでテストの信頼性を向上
 */
const createMockDb = () => ({
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  leftJoin: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  get: vi.fn(),
  all: vi.fn(),
  run: vi.fn(),
});

/**
 * テスト用のアプリケーション設定
 * 
 * 初学者向けメモ：
 * - 実際のHonoアプリケーションを使用
 * - 環境変数のモック設定
 * - データベースのモック注入
 */
const createTestApp = (mockDb: ReturnType<typeof createMockDb>) => {
  const app = new Hono();
  
  // モックされたDBを注入するミドルウェア
  app.use('*', async (c, next) => {
    // @ts-expect-error テスト用の環境設定
    c.env = { DB: mockDb };
    await next();
  });
  
  app.route('/api', モンスターAPI);
  return app;
};

describe('モンスターAPI単体テスト', () => {
  let mockDb: ReturnType<typeof createMockDb>;
  let app: Hono;

  /**
   * 各テスト前の初期化
   * 
   * 初学者向けメモ：
   * - 各テストは独立して実行される
   * - 前のテストの影響を受けないようにリセット
   */
  beforeEach(() => {
    mockDb = createMockDb();
    app = createTestApp(mockDb);
    vi.clearAllMocks();
  });

  describe('POST /api/players/:playerId/monsters - モンスター獲得', () => {
    const テストプレイヤーId = 'test-player-123';
    const テスト種族Id = 'species-001';

    /**
     * 正常系テスト: モンスター獲得成功
     * 
     * 初学者向けメモ：
     * - Happy Pathのテスト
     * - 期待するレスポンス形式の確認
     * - データベース操作の呼び出し確認
     */
    it('有効なリクエストでモンスター獲得が成功する', async () => {
      // モックデータの準備
      const プレイヤーデータ = {
        id: テストプレイヤーId,
        名前: 'テストプレイヤー',
        作成日時: new Date(),
      };

      const 種族データ = {
        id: テスト種族Id,
        名前: 'でんきネズミ',
        基本hp: 35,
        説明: 'テスト用モンスター',
      };

      // モック設定: プレイヤー存在確認
      mockDb.get.mockResolvedValueOnce(プレイヤーデータ);
      // モック設定: 種族存在確認  
      mockDb.get.mockResolvedValueOnce(種族データ);
      // モック設定: モンスター作成
      mockDb.run.mockResolvedValueOnce({ success: true });

      // APIリクエスト実行
      const response = await app.request(`/api/players/${テストプレイヤーId}/monsters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 種族ID: テスト種族Id }),
      });

      // レスポンス検証
      expect(response.status).toBe(201);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(true);
      expect(responseData.データ).toBeDefined();
      expect(responseData.データ.種族.名前).toBe('でんきネズミ');
      expect(responseData.データ.現在HP).toBe(35);
      expect(responseData.データ.最大HP).toBe(35);

      // データベース操作の確認
      expect(mockDb.get).toHaveBeenCalledTimes(2); // プレイヤー + 種族確認
      expect(mockDb.insert).toHaveBeenCalledTimes(1); // モンスター作成
    });

    /**
     * 異常系テスト: プレイヤーが存在しない
     * 
     * 初学者向けメモ：
     * - エラーケースのテスト
     * - 適切なHTTPステータスコードの確認
     * - エラーメッセージの日本語対応確認
     */
    it('存在しないプレイヤーIDで404エラーを返す', async () => {
      // モック設定: プレイヤーが見つからない
      mockDb.get.mockResolvedValueOnce(null);

      const response = await app.request(`/api/players/invalid-player/monsters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 種族ID: テスト種族Id }),
      });

      expect(response.status).toBe(404);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(false);
      expect(responseData.エラー.コード).toBe('PLAYER_NOT_FOUND');
      expect(responseData.エラー.メッセージ).toBe('プレイヤーが見つかりません');
    });

    /**
     * 異常系テスト: 種族が存在しない
     */
    it('存在しない種族IDで404エラーを返す', async () => {
      const プレイヤーデータ = { id: テストプレイヤーId, 名前: 'テストプレイヤー' };
      
      // モック設定: プレイヤーは存在、種族は存在しない
      mockDb.get.mockResolvedValueOnce(プレイヤーデータ);
      mockDb.get.mockResolvedValueOnce(null);

      const response = await app.request(`/api/players/${テストプレイヤーId}/monsters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 種族ID: 'invalid-species' }),
      });

      expect(response.status).toBe(404);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(false);
      expect(responseData.エラー.コード).toBe('SPECIES_NOT_FOUND');
    });

    /**
     * 異常系テスト: バリデーションエラー
     */
    it('種族IDが未指定で400エラーを返す', async () => {
      const response = await app.request(`/api/players/${テストプレイヤーId}/monsters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // 種族ID未指定
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/players/:playerId/monsters - モンスター一覧取得', () => {
    const テストプレイヤーId = 'test-player-123';

    /**
     * 正常系テスト: モンスター一覧取得成功
     */
    it('プレイヤーの所持モンスター一覧を正しく取得する', async () => {
      const モックモンスター一覧 = [
        {
          id: 'monster-1',
          ニックネーム: 'ピカ',
          現在hp: 30,
          最大hp: 35,
          取得日時: new Date(),
          種族: {
            id: 'species-1',
            名前: 'でんきネズミ',
            基本hp: 35,
          },
        },
        {
          id: 'monster-2', 
          ニックネーム: 'リザ',
          現在hp: 40,
          最大hp: 40,
          取得日時: new Date(),
          種族: {
            id: 'species-2',
            名前: 'ほのおトカゲ',
            基本hp: 40,
          },
        },
      ];

      mockDb.all.mockResolvedValueOnce(モックモンスター一覧);

      const response = await app.request(`/api/players/${テストプレイヤーId}/monsters`);

      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(true);
      expect(responseData.データ).toHaveLength(2);
      expect(responseData.件数).toBe(2);
      expect(responseData.データ[0].種族.名前).toBe('でんきネズミ');
    });

    /**
     * 正常系テスト: 空の一覧
     */
    it('モンスターを所持していない場合は空配列を返す', async () => {
      mockDb.all.mockResolvedValueOnce([]);

      const response = await app.request(`/api/players/${テストプレイヤーId}/monsters`);

      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(true);
      expect(responseData.データ).toEqual([]);
      expect(responseData.件数).toBe(0);
    });

    /**
     * 正常系テスト: ソート・フィルタリング
     */
    it('クエリパラメータでソート・フィルタリングが適用される', async () => {
      mockDb.all.mockResolvedValueOnce([]);

      const response = await app.request(
        `/api/players/${テストプレイヤーId}/monsters?sort=captured_at&order=asc&種族ID=species-1`
      );

      expect(response.status).toBe(200);
      
      // クエリ構築の確認
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
    });
  });

  describe('PUT /api/monsters/:monsterId - ニックネーム変更', () => {
    const テストモンスターId = 'monster-123';

    /**
     * 正常系テスト: ニックネーム変更成功
     */
    it('有効なニックネームでモンスター名前変更が成功する', async () => {
      const 既存モンスター = {
        id: テストモンスターId,
        プレイヤーid: 'player-123',
        ニックネーム: '古い名前',
        現在hp: 30,
        最大hp: 35,
      };

      mockDb.get.mockResolvedValueOnce(既存モンスター);
      mockDb.run.mockResolvedValueOnce({ success: true });

      const response = await app.request(`/api/monsters/${テストモンスターId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ニックネーム: '新しい名前' }),
      });

      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(true);
      expect(responseData.データ.ニックネーム).toBe('新しい名前');

      // データベース更新の確認
      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });

    /**
     * 異常系テスト: 存在しないモンスター
     */
    it('存在しないモンスターIDで404エラーを返す', async () => {
      mockDb.get.mockResolvedValueOnce(null);

      const response = await app.request('/api/monsters/invalid-monster', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ニックネーム: '新しい名前' }),
      });

      expect(response.status).toBe(404);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(false);
      expect(responseData.エラー.コード).toBe('MONSTER_NOT_FOUND');
    });

    /**
     * 異常系テスト: バリデーションエラー
     */
    it('無効なニックネーム（空文字）で400エラーを返す', async () => {
      const response = await app.request(`/api/monsters/${テストモンスターId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ニックネーム: '' }), // 空文字
      });

      expect(response.status).toBe(400);
    });

    /**
     * 異常系テスト: 長すぎるニックネーム
     */
    it('長すぎるニックネーム（21文字以上）で400エラーを返す', async () => {
      const response = await app.request(`/api/monsters/${テストモンスターId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ニックネーム: 'a'.repeat(21) }), // 21文字
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/monsters/:monsterId - モンスター解放', () => {
    const テストモンスターId = 'monster-123';

    /**
     * 正常系テスト: モンスター解放成功
     */
    it('存在するモンスターの解放が成功する', async () => {
      const 既存モンスター = {
        id: テストモンスターId,
        プレイヤーid: 'player-123',
        ニックネーム: 'テストモンスター',
      };

      mockDb.get.mockResolvedValueOnce(既存モンスター);
      mockDb.run.mockResolvedValueOnce({ success: true });

      const response = await app.request(`/api/monsters/${テストモンスターId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(true);
      expect(responseData.メッセージ).toBe('モンスターを解放しました');

      // データベース削除の確認
      expect(mockDb.delete).toHaveBeenCalledTimes(1);
    });

    /**
     * 異常系テスト: 存在しないモンスター
     */
    it('存在しないモンスターIDで404エラーを返す', async () => {
      mockDb.get.mockResolvedValueOnce(null);

      const response = await app.request('/api/monsters/invalid-monster', {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(false);
      expect(responseData.エラー.コード).toBe('MONSTER_NOT_FOUND');
    });
  });

  describe('エラーハンドリング共通テスト', () => {
    /**
     * 異常系テスト: データベースエラー
     */
    it('データベースエラー時に500エラーを返す', async () => {
      // データベースエラーをシミュレート
      mockDb.get.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await app.request('/api/players/test-player/monsters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 種族ID: 'species-1' }),
      });

      expect(response.status).toBe(500);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(false);
      expect(responseData.エラー.コード).toBe('INTERNAL_ERROR');
    });

    /**
     * 異常系テスト: 不正なJSON
     */
    it('不正なJSONで400エラーを返す', async () => {
      const response = await app.request('/api/players/test-player/monsters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }', // 不正なJSON
      });

      expect(response.status).toBe(400);
    });
  });
});

/**
 * 初学者向けメモ：単体テストのポイント
 * 
 * 1. テスト構造
 *    - describe: テストグループの論理的分割
 *    - it: 具体的なテストケース
 *    - beforeEach: 各テスト前の初期化
 * 
 * 2. モックの活用
 *    - 外部依存（データベース）の分離
 *    - 予測可能なテスト結果
 *    - テスト実行の高速化
 * 
 * 3. テストカバレッジ
 *    - 正常系（Happy Path）
 *    - 異常系（Error Cases）
 *    - 境界値テスト
 * 
 * 4. アサーション設計
 *    - HTTPステータスコードの確認
 *    - レスポンス形式の検証
 *    - エラーメッセージの確認
 * 
 * 5. TDD原則
 *    - レッド（失敗するテストを書く）
 *    - グリーン（テストを通す最小実装）
 *    - リファクタ（コード品質向上）
 */