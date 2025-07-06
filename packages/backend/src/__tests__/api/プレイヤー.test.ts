/**
 * プレイヤーAPI単体テスト
 * 
 * 初学者向けメモ：
 * - TDD原則に基づいたプレイヤーAPI単体テスト
 * - 初期モンスター付与機能を含む包括的なテスト
 * - モックを使用して外部依存を分離
 * - Week2実装計画に基づいた仕様テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import type { データベース型 } from '../../db/型定義';
import { プレイヤールーター } from '../../api/プレイヤー';

/**
 * テスト用のモックデータベース設定
 * 
 * 初学者向けメモ：
 * - vi.fn()でモック関数を作成
 * - 外部依存（データベース）を分離してテストを高速化
 * - 予測可能な結果を返すことでテストの信頼性を向上
 */
const createMockDb = () => {
  const mockQuery = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn(),
  };

  const mockInsert = {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  };

  return {
    select: vi.fn().mockReturnValue(mockQuery),
    insert: vi.fn().mockReturnValue(mockInsert),
  };
};

/**
 * テスト用のアプリケーション設定
 * 
 * 初学者向けメモ：
 * - 実際のプレイヤールーターを使用
 * - モックされたデータベースを注入
 * - 本番環境と同じ構造でテスト実行
 */
const createTestApp = (mockDb: ReturnType<typeof createMockDb>) => {
  const app = new Hono();
  app.route('/api/players', プレイヤールーター(mockDb as unknown as データベース型));
  return app;
};

describe('プレイヤーAPI単体テスト', () => {
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

  describe('POST /api/players - プレイヤー作成', () => {
    /**
     * 正常系テスト: プレイヤー作成成功
     * 
     * 初学者向けメモ：
     * - Happy Pathのテスト
     * - 初期モンスター付与機能も含めて検証
     * - データベース操作の呼び出し確認
     */
    it('有効なプレイヤー名でプレイヤー作成が成功し、初期モンスターが付与される', async () => {
      // モックデータの準備
      const 新規プレイヤー = {
        id: 'test-player-001',
        名前: 'テストプレイヤー',
        作成日時: new Date('2025-07-06T10:00:00Z'),
        更新日時: new Date('2025-07-06T10:00:00Z'),
      };

      const スターター種族一覧 = [
        {
          id: 'species-001',
          名前: 'でんきネズミ',
          基本hp: 35,
          説明: '電気を操る小さなモンスター',
        },
        {
          id: 'species-002',
          名前: 'ほのおトカゲ',
          基本hp: 40,
          説明: '炎を操る小さなドラゴン',
        },
        {
          id: 'species-003',
          名前: 'くさモグラ',
          基本hp: 30,
          説明: '地面を掘るのが得意なモンスター',
        },
      ];

      // モック設定: プレイヤー作成
      mockDb.insert().returning.mockResolvedValueOnce([新規プレイヤー]);
      
      // モック設定: スターター種族取得
      mockDb.select().where.mockResolvedValueOnce(スターター種族一覧);

      // モック設定: 初期モンスター作成
      mockDb.insert().values.mockResolvedValueOnce(undefined);

      // APIリクエスト実行
      const response = await app.request('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 名前: 'テストプレイヤー' }),
      });

      // レスポンス検証
      expect(response.status).toBe(201);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(true);
      expect(responseData.メッセージ).toBe('プレイヤーが作成されました');
      expect(responseData.データ.名前).toBe('テストプレイヤー');
      expect(responseData.データ.id).toBe('test-player-001');
      expect(responseData.データ.初期モンスター).toBeDefined();
      expect(responseData.データ.初期モンスター).not.toBeNull();
      
      // 初期モンスターの検証
      const 初期モンスター = responseData.データ.初期モンスター;
      expect(['でんきネズミ', 'ほのおトカゲ', 'くさモグラ']).toContain(初期モンスター.種族名);
      expect(初期モンスター.現在HP).toBeGreaterThan(0);
      expect(初期モンスター.最大HP).toBeGreaterThan(0);
      expect(初期モンスター.現在HP).toBe(初期モンスター.最大HP);

      // データベース操作の確認
      expect(mockDb.insert).toHaveBeenCalledTimes(2); // プレイヤー + 初期モンスター
      expect(mockDb.returning).toHaveBeenCalledTimes(1); // プレイヤー作成
    });

    /**
     * 異常系テスト: バリデーションエラー - 名前が空文字
     * 
     * 初学者向けメモ：
     * - 入力値検証のテスト
     * - 適切なHTTPステータスコードの確認
     * - エラーメッセージの確認
     */
    it('名前が空文字の場合400エラーを返す', async () => {
      const response = await app.request('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 名前: '' }),
      });

      expect(response.status).toBe(400);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBeDefined();
    });

    /**
     * 異常系テスト: バリデーションエラー - 名前が長すぎる
     */
    it('名前が20文字を超える場合400エラーを返す', async () => {
      const response = await app.request('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 名前: 'a'.repeat(21) }), // 21文字
      });

      expect(response.status).toBe(400);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBeDefined();
    });

    /**
     * 異常系テスト: バリデーションエラー - 名前が未指定
     */
    it('名前が未指定の場合400エラーを返す', async () => {
      const response = await app.request('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // 名前未指定
      });

      expect(response.status).toBe(400);
    });

    /**
     * 異常系テスト: データベースエラー
     */
    it('データベースエラー時に500エラーを返す', async () => {
      // データベースエラーをシミュレート
      mockDb.returning.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await app.request('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 名前: 'テストプレイヤー' }),
      });

      expect(response.status).toBe(500);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(false);
      expect(responseData.メッセージ).toBe('プレイヤーの作成に失敗しました');
      expect(responseData.エラー).toBeDefined();
    });
  });

  describe('GET /api/players/:id - プレイヤー取得', () => {
    const テストプレイヤーId = 'test-player-123';

    /**
     * 正常系テスト: プレイヤー取得成功
     * 
     * 初学者向けメモ：
     * - 既存プレイヤーの取得確認
     * - レスポンス形式の検証
     * - データベースクエリの確認
     */
    it('存在するプレイヤーIDで正しくプレイヤー情報を取得する', async () => {
      const プレイヤー情報 = {
        id: テストプレイヤーId,
        名前: '既存プレイヤー',
        作成日時: new Date('2025-07-06T09:00:00Z'),
        更新日時: new Date('2025-07-06T09:00:00Z'),
      };

      // モック設定: プレイヤー存在確認
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValueOnce([プレイヤー情報]),
      });

      const response = await app.request(`/api/players/${テストプレイヤーId}`);

      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(true);
      expect(responseData.データ.id).toBe(テストプレイヤーId);
      expect(responseData.データ.名前).toBe('既存プレイヤー');
      expect(responseData.データ.作成日時).toBeDefined();

      // データベース操作の確認
      expect(mockDb.select).toHaveBeenCalledTimes(1);
    });

    /**
     * 異常系テスト: プレイヤーが存在しない
     * 
     * 初学者向けメモ：
     * - 存在しないリソースへのアクセス処理
     * - 適切な404エラーレスポンス
     */
    it('存在しないプレイヤーIDで404エラーを返す', async () => {
      // モック設定: プレイヤーが見つからない
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValueOnce([]),
      });

      const response = await app.request('/api/players/non-existent-id');

      expect(response.status).toBe(404);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(false);
      expect(responseData.メッセージ).toBe('指定されたプレイヤーが見つかりません');
    });

    /**
     * 異常系テスト: データベースエラー
     */
    it('データベースエラー時に500エラーを返す', async () => {
      // データベースエラーをシミュレート
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValueOnce(new Error('Database query failed')),
      });

      const response = await app.request(`/api/players/${テストプレイヤーId}`);

      expect(response.status).toBe(500);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(false);
      expect(responseData.メッセージ).toBe('プレイヤーの取得に失敗しました');
    });
  });

  describe('GET /api/players - プレイヤー一覧取得', () => {
    /**
     * 正常系テスト: プレイヤー一覧取得成功
     * 
     * 初学者向けメモ：
     * - 全プレイヤーの一覧取得確認
     * - レスポンス形式の検証
     * - 件数の確認
     */
    it('プレイヤー一覧を正しく取得する', async () => {
      const プレイヤー一覧 = [
        {
          id: 'player-001',
          名前: 'プレイヤー1',
          作成日時: new Date('2025-07-06T08:00:00Z'),
        },
        {
          id: 'player-002',
          名前: 'プレイヤー2',
          作成日時: new Date('2025-07-06T09:00:00Z'),
        },
        {
          id: 'player-003',
          名前: 'プレイヤー3',
          作成日時: new Date('2025-07-06T10:00:00Z'),
        },
      ];

      // モック設定: プレイヤー一覧取得
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValueOnce(プレイヤー一覧),
      });

      const response = await app.request('/api/players');

      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(true);
      expect(responseData.データ).toHaveLength(3);
      expect(responseData.件数).toBe(3);
      expect(responseData.データ[0].名前).toBe('プレイヤー1');
      expect(responseData.データ[1].名前).toBe('プレイヤー2');
      expect(responseData.データ[2].名前).toBe('プレイヤー3');

      // データベース操作の確認
      expect(mockDb.select).toHaveBeenCalledTimes(1);
    });

    /**
     * 正常系テスト: 空の一覧
     */
    it('プレイヤーが存在しない場合は空配列を返す', async () => {
      // モック設定: 空の一覧
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValueOnce([]),
      });

      const response = await app.request('/api/players');

      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(true);
      expect(responseData.データ).toEqual([]);
      expect(responseData.件数).toBe(0);
    });

    /**
     * 異常系テスト: データベースエラー
     */
    it('データベースエラー時に500エラーを返す', async () => {
      // データベースエラーをシミュレート
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockRejectedValueOnce(new Error('Database query failed')),
      });

      const response = await app.request('/api/players');

      expect(response.status).toBe(500);
      
      const responseData = await response.json();
      expect(responseData.成功).toBe(false);
      expect(responseData.メッセージ).toBe('プレイヤー一覧の取得に失敗しました');
    });
  });

  describe('初期モンスター付与機能テスト', () => {
    /**
     * 正常系テスト: 初期モンスター付与成功
     * 
     * 初学者向けメモ：
     * - 初期モンスター付与のロジック確認
     * - ランダム選択の結果確認
     * - スターター種族の取得確認
     */
    it('プレイヤー作成時に3種類のスターターからランダムに1体が付与される', async () => {
      const 新規プレイヤー = {
        id: 'test-player-starter',
        名前: 'スターターテスト',
        作成日時: new Date(),
        更新日時: new Date(),
      };

      const スターター種族一覧 = [
        { id: 'species-001', 名前: 'でんきネズミ', 基本hp: 35 },
        { id: 'species-002', 名前: 'ほのおトカゲ', 基本hp: 40 },
        { id: 'species-003', 名前: 'くさモグラ', 基本hp: 30 },
      ];

      // モック設定
      mockDb.returning.mockResolvedValueOnce([新規プレイヤー]);
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValueOnce(スターター種族一覧),
      });
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockResolvedValueOnce(undefined),
      });

      const response = await app.request('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 名前: 'スターターテスト' }),
      });

      expect(response.status).toBe(201);
      
      const responseData = await response.json();
      expect(responseData.データ.初期モンスター).toBeDefined();
      expect(responseData.データ.初期モンスター).not.toBeNull();
      
      // スターター種族の1つが選択されていることを確認
      const 初期モンスター = responseData.データ.初期モンスター;
      expect(['でんきネズミ', 'ほのおトカゲ', 'くさモグラ']).toContain(初期モンスター.種族名);
      expect(初期モンスター.ニックネーム).toBe(初期モンスター.種族名); // デフォルトは種族名
    });

    /**
     * 異常系テスト: スターター種族が存在しない
     * 
     * 初学者向けメモ：
     * - マスターデータが不完全な場合の処理
     * - 初期モンスター付与失敗時の処理
     */
    it('スターター種族が存在しない場合は初期モンスターがnullになる', async () => {
      const 新規プレイヤー = {
        id: 'test-player-no-starter',
        名前: 'スターターなし',
        作成日時: new Date(),
        更新日時: new Date(),
      };

      // モック設定: スターター種族が見つからない
      mockDb.returning.mockResolvedValueOnce([新規プレイヤー]);
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValueOnce([]), // 空の配列
      });

      const response = await app.request('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 名前: 'スターターなし' }),
      });

      expect(response.status).toBe(201);
      
      const responseData = await response.json();
      expect(responseData.データ.初期モンスター).toBeNull();
    });
  });

  describe('エラーハンドリング共通テスト', () => {
    /**
     * 異常系テスト: 不正なJSON
     */
    it('不正なJSONで400エラーを返す', async () => {
      const response = await app.request('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }', // 不正なJSON
      });

      expect(response.status).toBe(400);
    });

    /**
     * 異常系テスト: Content-Typeなし
     */
    it('Content-Typeが不正な場合400エラーを返す', async () => {
      const response = await app.request('/api/players', {
        method: 'POST',
        body: JSON.stringify({ 名前: 'テスト' }),
      });

      expect(response.status).toBe(400);
    });
  });
});

/**
 * 初学者向けメモ：プレイヤーAPI単体テストのポイント
 * 
 * 1. テスト範囲
 *    - プレイヤー作成（初期モンスター付与含む）
 *    - プレイヤー取得（個別・一覧）
 *    - バリデーション機能
 *    - エラーハンドリング
 * 
 * 2. モックの活用
 *    - データベース操作を分離
 *    - 予測可能な結果でテストの信頼性向上
 *    - 外部サービスの影響を排除
 * 
 * 3. テストケース設計
 *    - 正常系（Happy Path）
 *    - 異常系（バリデーションエラー、データベースエラー）
 *    - 境界値テスト
 * 
 * 4. 初期モンスター付与のテスト
 *    - ランダム選択のロジック確認
 *    - スターター種族の取得確認
 *    - 失敗時の処理確認
 * 
 * 5. APIレスポンス検証
 *    - HTTPステータスコード
 *    - レスポンス形式
 *    - エラーメッセージ
 *    - データの整合性
 */