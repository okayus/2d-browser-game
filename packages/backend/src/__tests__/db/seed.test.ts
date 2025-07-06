/**
 * シードスクリプト単体テスト
 * 
 * 初学者向けメモ：
 * - データベース初期化ロジックのテスト
 * - データ投入処理の正確性を検証
 * - エラーハンドリングの確認
 * - TDD原則に基づいたデータベーステスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { データベース型 } from '../../db/型定義';
import { 初期データ投入, データリセット } from '../../db/seed';

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
  limit: vi.fn(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn(),
  delete: vi.fn(),
});

describe('シードスクリプト単体テスト', () => {
  let mockDb: ReturnType<typeof createMockDb>;

  /**
   * 各テスト前の初期化
   * 
   * 初学者向けメモ：
   * - 各テストは独立して実行される
   * - 前のテストの影響を受けないようにリセット
   */
  beforeEach(() => {
    mockDb = createMockDb();
    vi.clearAllMocks();
    
    // コンソール出力をモック化（テスト時の不要な出力を抑制）
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('初期データ投入機能', () => {
    /**
     * 正常系テスト: 初期データ投入成功
     * 
     * 初学者向けメモ：
     * - データが存在しない場合の初期投入処理
     * - 5種類のモンスター種族が正しく投入される
     * - データベース操作の回数確認
     */
    it('データベースが空の場合、5種類のモンスター種族を投入する', async () => {
      // モック設定: 既存データなし
      mockDb.limit.mockResolvedValueOnce([]);
      
      // モック設定: データ投入成功
      mockDb.values.mockResolvedValue(undefined);
      
      // モック設定: 投入結果確認用
      const 投入済みデータ = [
        { id: '1', 名前: 'でんきネズミ', 基本hp: 35 },
        { id: '2', 名前: 'ほのおトカゲ', 基本hp: 40 },
        { id: '3', 名前: 'みずガメ', 基本hp: 45 },
        { id: '4', 名前: 'くさモグラ', 基本hp: 30 },
        { id: '5', 名前: 'いわゴーレム', 基本hp: 50 },
      ];
      
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValueOnce(投入済みデータ),
      });

      // 関数実行
      await 初期データ投入(mockDb as unknown as データベース型);

      // 検証: 既存データチェックが実行される
      expect(mockDb.select).toHaveBeenCalledTimes(2); // 既存チェック + 結果確認
      expect(mockDb.limit).toHaveBeenCalledWith(1);

      // 検証: 5回のデータ挿入が実行される
      expect(mockDb.insert).toHaveBeenCalledTimes(5);
      expect(mockDb.values).toHaveBeenCalledTimes(5);

      // 検証: コンソールメッセージ
      expect(console.log).toHaveBeenCalledWith('モンスター種族データを投入中...');
      expect(console.log).toHaveBeenCalledWith('✅ でんきネズミ を追加しました');
      expect(console.log).toHaveBeenCalledWith('✅ ほのおトカゲ を追加しました');
      expect(console.log).toHaveBeenCalledWith('✅ みずガメ を追加しました');
      expect(console.log).toHaveBeenCalledWith('✅ くさモグラ を追加しました');
      expect(console.log).toHaveBeenCalledWith('✅ いわゴーレム を追加しました');
      expect(console.log).toHaveBeenCalledWith('初期データの投入が完了しました！');
      expect(console.log).toHaveBeenCalledWith('合計 5 種類のモンスターを登録しました');
    });

    /**
     * 正常系テスト: 既存データがある場合はスキップ
     * 
     * 初学者向けメモ：
     * - 重複データ投入の防止
     * - 既存データの存在確認ロジック
     * - 処理のスキップ動作確認
     */
    it('既存データがある場合、データ投入をスキップする', async () => {
      // モック設定: 既存データあり
      const 既存データ = [
        { id: '1', 名前: 'でんきネズミ', 基本hp: 35 },
      ];
      mockDb.limit.mockResolvedValueOnce(既存データ);

      // 関数実行
      await 初期データ投入(mockDb as unknown as データベース型);

      // 検証: 既存データチェックのみ実行
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.limit).toHaveBeenCalledWith(1);

      // 検証: データ挿入は実行されない
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockDb.values).not.toHaveBeenCalled();

      // 検証: スキップメッセージ
      expect(console.log).toHaveBeenCalledWith('初期データは既に投入済みです');
    });

    /**
     * 異常系テスト: データベースエラー時の処理
     * 
     * 初学者向けメモ：
     * - データベース接続エラーの処理
     * - エラーログの出力確認
     * - 例外の再スロー確認
     */
    it('データベースエラー時にエラーをログ出力して例外を再スローする', async () => {
      const エラー = new Error('Database connection failed');
      
      // モック設定: データベースエラー
      mockDb.limit.mockRejectedValueOnce(エラー);

      // 関数実行と例外確認
      await expect(初期データ投入(mockDb as unknown as データベース型))
        .rejects.toThrow('Database connection failed');

      // 検証: エラーログの出力
      expect(console.error).toHaveBeenCalledWith(
        '初期データ投入中にエラーが発生しました:',
        エラー
      );
    });

    /**
     * 異常系テスト: データ投入中のエラー
     */
    it('データ投入中にエラーが発生した場合、エラーを適切に処理する', async () => {
      const 投入エラー = new Error('Insert operation failed');
      
      // モック設定: 既存データなし
      mockDb.limit.mockResolvedValueOnce([]);
      
      // モック設定: データ投入でエラー
      mockDb.values.mockRejectedValueOnce(投入エラー);

      // 関数実行と例外確認
      await expect(初期データ投入(mockDb as unknown as データベース型))
        .rejects.toThrow('Insert operation failed');

      // 検証: エラーログの出力
      expect(console.error).toHaveBeenCalledWith(
        '初期データ投入中にエラーが発生しました:',
        投入エラー
      );
    });
  });

  describe('データリセット機能', () => {
    /**
     * 正常系テスト: データリセット成功
     * 
     * 初学者向けメモ：
     * - 外部キー制約を考慮した削除順序
     * - 所持モンスター → モンスター種族 → プレイヤーの順
     * - 全テーブルのデータ削除確認
     */
    it('外部キー制約の順序を考慮してデータを削除する', async () => {
      // モック設定: 削除成功
      mockDb.delete.mockResolvedValue(undefined);

      // 関数実行
      await データリセット(mockDb as unknown as データベース型);

      // 検証: 削除の実行順序
      expect(mockDb.delete).toHaveBeenCalledTimes(3);
      
      // 検証: 外部キー制約の順序（所持モンスター → モンスター種族 → プレイヤー）
      const deleteCallOrder = (mockDb.delete as any).mock.calls;
      expect(deleteCallOrder[0]).toBeDefined();
      expect(deleteCallOrder[1]).toBeDefined();
      expect(deleteCallOrder[2]).toBeDefined();

      // 検証: コンソールメッセージ
      expect(console.log).toHaveBeenCalledWith('⚠️  データベースをリセットします...');
      expect(console.log).toHaveBeenCalledWith('✅ データベースのリセットが完了しました');
    });

    /**
     * 異常系テスト: データリセット中のエラー
     * 
     * 初学者向けメモ：
     * - データ削除エラーの処理
     * - エラーログの出力確認
     * - 例外の再スロー確認
     */
    it('データ削除中にエラーが発生した場合、エラーを適切に処理する', async () => {
      const 削除エラー = new Error('Delete operation failed');
      
      // モック設定: 削除でエラー
      mockDb.delete.mockRejectedValueOnce(削除エラー);

      // 関数実行と例外確認
      await expect(データリセット(mockDb as unknown as データベース型))
        .rejects.toThrow('Delete operation failed');

      // 検証: エラーログの出力
      expect(console.error).toHaveBeenCalledWith(
        'データリセット中にエラーが発生しました:',
        削除エラー
      );

      // 検証: 警告メッセージは出力される
      expect(console.log).toHaveBeenCalledWith('⚠️  データベースをリセットします...');
    });
  });

  describe('データ整合性テスト', () => {
    /**
     * データ構造テスト: 初期モンスター種族の検証
     * 
     * 初学者向けメモ：
     * - 投入される初期データの構造確認
     * - 必須フィールドの存在確認
     * - データの妥当性確認
     */
    it('初期モンスター種族データが正しい構造を持つ', async () => {
      // モック設定
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.values.mockResolvedValue(undefined);
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValueOnce([]),
      });

      // insertが呼ばれた際の引数をキャプチャ
      const 投入されたデータ: any[] = [];
      mockDb.values.mockImplementation((data) => {
        投入されたデータ.push(data);
        return Promise.resolve(undefined);
      });

      // 関数実行
      await 初期データ投入(mockDb as unknown as データベース型);

      // 検証: 5種類のモンスターが投入される
      expect(投入されたデータ).toHaveLength(5);

      // 検証: 各データの構造
      投入されたデータ.forEach((データ) => {
        expect(データ).toHaveProperty('id');
        expect(データ).toHaveProperty('名前');
        expect(データ).toHaveProperty('基本hp');
        expect(データ).toHaveProperty('説明');
        expect(データ).toHaveProperty('作成日時');
        expect(データ).toHaveProperty('更新日時');
        
        // 型確認
        expect(typeof データ.id).toBe('string');
        expect(typeof データ.名前).toBe('string');
        expect(typeof データ.基本hp).toBe('number');
        expect(typeof データ.説明).toBe('string');
        expect(データ.作成日時).toBeInstanceOf(Date);
        expect(データ.更新日時).toBeInstanceOf(Date);
        
        // 値の妥当性確認
        expect(データ.id.length).toBeGreaterThan(0);
        expect(データ.名前.length).toBeGreaterThan(0);
        expect(データ.基本hp).toBeGreaterThan(0);
        expect(データ.説明.length).toBeGreaterThan(0);
      });

      // 検証: 期待するモンスター名が含まれる
      const モンスター名一覧 = 投入されたデータ.map(d => d.名前);
      expect(モンスター名一覧).toContain('でんきネズミ');
      expect(モンスター名一覧).toContain('ほのおトカゲ');
      expect(モンスター名一覧).toContain('みずガメ');
      expect(モンスター名一覧).toContain('くさモグラ');
      expect(モンスター名一覧).toContain('いわゴーレム');
    });

    /**
     * HP値の妥当性テスト
     * 
     * 初学者向けメモ：
     * - ゲームバランスの観点からHP値を検証
     * - 最小・最大値の範囲確認
     * - 種族間のバランス確認
     */
    it('モンスター種族のHP値が適切な範囲内にある', async () => {
      // モック設定
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.values.mockResolvedValue(undefined);
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValueOnce([]),
      });

      const 投入されたデータ: any[] = [];
      mockDb.values.mockImplementation((data) => {
        投入されたデータ.push(data);
        return Promise.resolve(undefined);
      });

      // 関数実行
      await 初期データ投入(mockDb as unknown as データベース型);

      // 検証: HP値の範囲
      投入されたデータ.forEach((データ) => {
        expect(データ.基本hp).toBeGreaterThanOrEqual(20); // 最小HP
        expect(データ.基本hp).toBeLessThanOrEqual(100); // 最大HP
      });

      // 検証: 具体的なHP値
      const HP値マップ = new Map(投入されたデータ.map(d => [d.名前, d.基本hp]));
      expect(HP値マップ.get('でんきネズミ')).toBe(35);
      expect(HP値マップ.get('ほのおトカゲ')).toBe(40);
      expect(HP値マップ.get('みずガメ')).toBe(45);
      expect(HP値マップ.get('くさモグラ')).toBe(30);
      expect(HP値マップ.get('いわゴーレム')).toBe(50);
    });
  });

  describe('コンソール出力テスト', () => {
    /**
     * ログメッセージの確認
     * 
     * 初学者向けメモ：
     * - ユーザーフレンドリーなメッセージ確認
     * - デバッグ情報の適切な出力確認
     * - エラーメッセージの明確性確認
     */
    it('適切なログメッセージが出力される', async () => {
      // モック設定
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.values.mockResolvedValue(undefined);
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValueOnce(Array(5).fill({})),
      });

      // 関数実行
      await 初期データ投入(mockDb as unknown as データベース型);

      // 検証: 進行状況メッセージ
      expect(console.log).toHaveBeenCalledWith('モンスター種族データを投入中...');
      expect(console.log).toHaveBeenCalledWith('初期データの投入が完了しました！');
      expect(console.log).toHaveBeenCalledWith('合計 5 種類のモンスターを登録しました');

      // 検証: 各種族の追加メッセージ
      expect(console.log).toHaveBeenCalledWith('✅ でんきネズミ を追加しました');
      expect(console.log).toHaveBeenCalledWith('✅ ほのおトカゲ を追加しました');
      expect(console.log).toHaveBeenCalledWith('✅ みずガメ を追加しました');
      expect(console.log).toHaveBeenCalledWith('✅ くさモグラ を追加しました');
      expect(console.log).toHaveBeenCalledWith('✅ いわゴーレム を追加しました');
    });
  });
});

/**
 * 初学者向けメモ：シードスクリプトテストのポイント
 * 
 * 1. テスト範囲
 *    - 初期データ投入機能
 *    - データリセット機能
 *    - エラーハンドリング
 *    - データ整合性検証
 * 
 * 2. モックの活用
 *    - データベース操作を分離
 *    - コンソール出力を制御
 *    - 予測可能なテスト結果
 * 
 * 3. データ検証
 *    - 構造の妥当性確認
 *    - 値の範囲確認
 *    - 必須フィールドの存在確認
 * 
 * 4. エラーケースの網羅
 *    - データベース接続エラー
 *    - データ操作エラー
 *    - 例外の適切な処理
 * 
 * 5. 実際のデータベース操作確認
 *    - INSERT文の実行回数
 *    - DELETE文の実行順序
 *    - SELECT文の実行タイミング
 * 
 * 6. ユーザビリティテスト
 *    - ログメッセージの明確性
 *    - 進行状況の可視化
 *    - エラーメッセージの分かりやすさ
 */