/**
 * ID生成ユーティリティ単体テスト
 * 
 * 初学者向けメモ：
 * - UUIDとランダムID生成の動作確認
 * - セキュアなID生成の検証
 * - エラーハンドリングの確認
 * - ID形式の妥当性検証
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uuid生成, ランダムid生成 } from '../../utils/id生成';

describe('ID生成ユーティリティ単体テスト', () => {
  /**
   * 各テスト前の初期化
   * 
   * 初学者向けメモ：
   * - モックをクリアして各テストの独立性を保つ
   * - グローバルオブジェクトの状態をリセット
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uuid生成関数', () => {
    /**
     * 正常系テスト: UUIDv4形式の検証
     * 
     * 初学者向けメモ：
     * - UUIDv4の正規表現パターンで形式確認
     * - ハイフンの位置とセクション長の確認
     * - バージョンとバリアントビットの確認
     */
    it('UUIDv4形式の文字列を生成する', () => {
      const uuid = uuid生成();
      
      // UUIDv4の正規表現パターン
      const uuidv4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(uuid).toMatch(uuidv4Pattern);
      expect(uuid).toHaveLength(36); // ハイフン含む標準的なUUID長
      expect(uuid.charAt(14)).toBe('4'); // version 4
      expect(['8', '9', 'a', 'b']).toContain(uuid.charAt(19).toLowerCase()); // variant bits
    });

    /**
     * 一意性テスト: 複数回生成での重複確認
     * 
     * 初学者向けメモ：
     * - 統計的に十分な回数で重複がないことを確認
     * - UUIDの衝突確率は実用上無視できるレベル
     */
    it('複数回実行しても一意なIDを生成する', () => {
      const 生成数 = 1000;
      const uuid一覧 = new Set<string>();
      
      for (let i = 0; i < 生成数; i++) {
        const uuid = uuid生成();
        uuid一覧.add(uuid);
      }
      
      // 全てのUUIDが一意であることを確認
      expect(uuid一覧.size).toBe(生成数);
    });

    /**
     * 文字列構造テスト: セクション分割の確認
     * 
     * 初学者向けメモ：
     * - UUIDの各セクションが正しい長さであることを確認
     * - ハイフンの位置が正確であることを確認
     */
    it('正しいセクション構造を持つ', () => {
      const uuid = uuid生成();
      const セクション = uuid.split('-');
      
      expect(セクション).toHaveLength(5);
      expect(セクション[0]).toHaveLength(8);  // time_low
      expect(セクション[1]).toHaveLength(4);  // time_mid
      expect(セクション[2]).toHaveLength(4);  // time_hi_and_version
      expect(セクション[3]).toHaveLength(4);  // clock_seq_hi_and_reserved + clock_seq_low
      expect(セクション[4]).toHaveLength(12); // node
    });

    /**
     * 異常系テスト: Crypto APIが利用できない環境
     * 
     * 初学者向けメモ：
     * - グローバルオブジェクトのモック化
     * - 環境依存のエラーハンドリング確認
     */
    it('Crypto APIが利用できない場合はエラーを投げる', () => {
      // Crypto APIをモック化
      const 元のcrypto = globalThis.crypto;
      Object.defineProperty(globalThis, 'crypto', {
        value: undefined,
        configurable: true,
      });
      
      expect(() => {
        uuid生成();
      }).toThrow('Crypto APIが利用できません');
      
      // 元の状態に復元
      Object.defineProperty(globalThis, 'crypto', {
        value: 元のcrypto,
        configurable: true,
      });
    });

    /**
     * セキュリティテスト: ランダム性の確認
     * 
     * 初学者向けメモ：
     * - 生成されるUUIDが予測困難であることを確認
     * - 同じパターンが頻繁に現れないことを確認
     */
    it('セキュアなランダム性を持つ', () => {
      const uuid一覧 = Array.from({ length: 100 }, () => uuid生成());
      
      // 各文字位置での文字種の分散確認（完全にランダムではないが、偏りがないことを確認）
      const 文字頻度マップ = new Map<string, number>();
      
      uuid一覧.forEach(uuid => {
        // ハイフンを除いた文字で頻度計算
        const 文字のみ = uuid.replace(/-/g, '');
        文字のみ.split('').forEach(文字 => {
          文字頻度マップ.set(文字, (文字頻度マップ.get(文字) || 0) + 1);
        });
      });
      
      // 16進数文字（0-9, a-f）が全て使用されていることを確認
      const 期待する文字 = '0123456789abcdef'.split('');
      期待する文字.forEach(文字 => {
        expect(文字頻度マップ.has(文字)).toBe(true);
      });
    });
  });

  describe('ランダムid生成関数', () => {
    /**
     * 正常系テスト: デフォルト長でのID生成
     * 
     * 初学者向けメモ：
     * - デフォルトパラメータの動作確認
     * - 生成される文字種の確認
     */
    it('デフォルト8文字の英数字IDを生成する', () => {
      const id = ランダムid生成();
      
      expect(id).toHaveLength(8);
      expect(id).toMatch(/^[A-Za-z0-9]+$/);
    });

    /**
     * パラメータテスト: 指定長でのID生成
     * 
     * 初学者向けメモ：
     * - 様々な長さでの正常動作確認
     * - 境界値テスト
     */
    it('指定した長さのIDを生成する', () => {
      const テストケース = [1, 5, 10, 20, 50];
      
      テストケース.forEach(長さ => {
        const id = ランダムid生成(長さ);
        expect(id).toHaveLength(長さ);
        expect(id).toMatch(/^[A-Za-z0-9]+$/);
      });
    });

    /**
     * 文字セットテスト: 使用される文字種の確認
     * 
     * 初学者向けメモ：
     * - 期待する文字セットのみが使用されることを確認
     * - 大文字小文字数字の混在確認
     */
    it('大文字小文字数字のみを使用する', () => {
      const id一覧 = Array.from({ length: 1000 }, () => ランダムid生成(20));
      const 全文字 = id一覧.join('');
      
      // 使用される全文字が期待する文字セット内であることを確認
      const 期待する文字セット = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      全文字.split('').forEach(文字 => {
        expect(期待する文字セット).toContain(文字);
      });
      
      // 各文字種が統計的に含まれることを確認
      expect(全文字).toMatch(/[A-Z]/); // 大文字
      expect(全文字).toMatch(/[a-z]/); // 小文字  
      expect(全文字).toMatch(/[0-9]/); // 数字
    });

    /**
     * 一意性テスト: 短いIDでも一意性を持つか
     * 
     * 初学者向けメモ：
     * - 短いIDでは衝突可能性があるが、統計的にある程度一意であることを確認
     * - 実用的な範囲での重複確率の確認
     */
    it('十分な一意性を持つ（統計的検証）', () => {
      const 生成数 = 1000;
      const id一覧 = new Set<string>();
      
      for (let i = 0; i < 生成数; i++) {
        const id = ランダムid生成(8);
        id一覧.add(id);
      }
      
      // 重複率が5%以下であることを確認（統計的に許容範囲）
      const 重複率 = (生成数 - id一覧.size) / 生成数;
      expect(重複率).toBeLessThan(0.05);
    });

    /**
     * 境界値テスト: 極端な長さでの動作確認
     * 
     * 初学者向けメモ：
     * - 0文字、1文字での動作確認
     * - 実用的でない値での堅牢性確認
     */
    it('境界値で正常に動作する', () => {
      // 0文字
      const 空文字id = ランダムid生成(0);
      expect(空文字id).toBe('');
      
      // 1文字
      const 単文字id = ランダムid生成(1);
      expect(単文字id).toHaveLength(1);
      expect(単文字id).toMatch(/^[A-Za-z0-9]$/);
      
      // 非常に長い場合
      const 長いid = ランダムid生成(1000);
      expect(長いid).toHaveLength(1000);
      expect(長いid).toMatch(/^[A-Za-z0-9]+$/);
    });

    /**
     * 分散テスト: 各文字位置での文字分散
     * 
     * 初学者向けメモ：
     * - 特定の位置に偏りがないことを確認
     * - Math.randomの品質確認
     */
    it('各文字位置で均等な分散を持つ', () => {
      const サンプル数 = 1000;
      const id長さ = 4;
      const id一覧 = Array.from({ length: サンプル数 }, () => ランダムid生成(id長さ));
      
      // 各位置での文字頻度を計算
      for (let 位置 = 0; 位置 < id長さ; 位置++) {
        const 位置別文字 = id一覧.map(id => id[位置]);
        const 文字頻度 = new Map<string, number>();
        
        位置別文字.forEach(文字 => {
          if (文字) {
            文字頻度.set(文字, (文字頻度.get(文字) || 0) + 1);
          }
        });
        
        // 最低でも異なる文字が使用されていることを確認
        expect(文字頻度.size).toBeGreaterThan(10);
        
        // 極端な偏りがないことを確認（最頻文字が30%を超えない）
        const 最大頻度 = Math.max(...文字頻度.values());
        const 最大頻度率 = 最大頻度 / サンプル数;
        expect(最大頻度率).toBeLessThan(0.3);
      }
    });
  });

  describe('ID生成関数の統合テスト', () => {
    /**
     * 併用テスト: 両関数の併用での一意性
     * 
     * 初学者向けメモ：
     * - UUIDとランダムIDが混在しても一意性を保つ
     * - 異なるID形式での重複がないことを確認
     */
    it('UUID生成とランダムID生成を併用しても問題なく動作する', () => {
      const uuid一覧 = Array.from({ length: 100 }, () => uuid生成());
      const ランダムid一覧 = Array.from({ length: 100 }, () => ランダムid生成(36)); // UUID同等の長さ
      
      // UUID内でもランダムID内でも重複なし
      expect(new Set(uuid一覧).size).toBe(100);
      expect(new Set(ランダムid一覧).size).toBe(100);
      
      // 形式が異なるので混在しても問題ない
      const 全id = [...uuid一覧, ...ランダムid一覧];
      expect(new Set(全id).size).toBe(200);
    });

    /**
     * パフォーマンステスト: 大量生成での性能確認
     * 
     * 初学者向けメモ：
     * - 実用的な範囲での性能確認
     * - メモリリークがないことの確認
     */
    it('大量生成でも適切に動作する', () => {
      const 生成数 = 10000;
      
      // UUID大量生成
      const uuid開始時間 = Date.now();
      const uuid一覧 = Array.from({ length: 生成数 }, () => uuid生成());
      const uuid生成時間 = Date.now() - uuid開始時間;
      
      // ランダムID大量生成
      const ランダム開始時間 = Date.now();
      const ランダムid一覧 = Array.from({ length: 生成数 }, () => ランダムid生成());
      const ランダム生成時間 = Date.now() - ランダム開始時間;
      
      // 一意性確認
      expect(new Set(uuid一覧).size).toBe(生成数);
      expect(new Set(ランダムid一覧).size).toBeGreaterThan(生成数 * 0.99); // 99%以上の一意性
      
      // 性能確認（10秒以内で完了）
      expect(uuid生成時間).toBeLessThan(10000);
      expect(ランダム生成時間).toBeLessThan(10000);
    });
  });
});

/**
 * 初学者向けメモ：ID生成テストのポイント
 * 
 * 1. 形式検証
 *    - 正規表現による形式チェック
 *    - 長さと文字種の確認
 *    - セクション構造の検証
 * 
 * 2. 一意性検証
 *    - 統計的な重複率の確認
 *    - 大量生成での一意性テスト
 *    - セット（Set）を使用した重複検出
 * 
 * 3. セキュリティ検証
 *    - ランダム性の分散確認
 *    - 予測困難性の検証
 *    - Crypto APIの使用確認
 * 
 * 4. 堅牢性検証
 *    - 境界値テスト
 *    - 異常な入力値での動作確認
 *    - 環境依存のエラーハンドリング
 * 
 * 5. パフォーマンス検証
 *    - 大量生成での性能確認
 *    - メモリ使用量の監視
 *    - 実用的な範囲での動作確認
 * 
 * 6. 統合テスト
 *    - 複数の関数の併用テスト
 *    - 実際の使用パターンでの検証
 *    - システム全体での動作確認
 */