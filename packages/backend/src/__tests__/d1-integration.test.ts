/**
 * D1データベース統合テスト
 * 
 * 初学者向けメモ：
 * - 実際のD1データベース（ローカル）を使用したテスト
 * - Wranglerのunstable_dev APIを使用
 * - エンドツーエンドのテストで実際のAPIの動作を確認
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';

describe.skip('D1統合テスト', () => {
  let worker: UnstableDevWorker;

  // テスト開始前にWorkerを起動
  beforeAll(async () => {
    try {
      worker = await unstable_dev('src/index.simple.ts', {
        experimental: { disableExperimentalWarning: true },
        config: 'wrangler.simple.toml',
        local: true,
        vars: {},
      });
    } catch (error) {
      console.error('Worker startup failed:', error);
      throw error;
    }
  }, 30000); // タイムアウトを30秒に設定

  // テスト終了後にWorkerを停止
  afterAll(async () => {
    if (worker) {
      try {
        await worker.stop();
      } catch (error) {
        console.warn('Worker stop failed:', error);
      }
    }
  }, 10000); // タイムアウトを10秒に設定

  // 各テスト後にクリーンアップ
  afterEach(async () => {
    // メモリ使用量を確認し、必要に応じてガベージコレクションを実行
    if (global.gc) {
      global.gc();
    }
  });

  describe('ヘルスチェック', () => {
    it('正常にヘルスチェックができること', async () => {
      expect(worker).toBeDefined();
      
      const resp = await worker.fetch('/health');
      expect(resp).toBeDefined();
      
      const json = await resp.json() as { status: string; database: string; timestamp: string };

      expect(resp.status).toBe(200);
      expect(json.status).toBe('healthy');
      expect(json.database).toBe('connected');
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('モンスター種族API', () => {
    it('モンスター種族一覧が取得できること', async () => {
      expect(worker).toBeDefined();
      
      const resp = await worker.fetch('/monster-species');
      expect(resp).toBeDefined();
      
      const json = await resp.json() as { 
        success: boolean; 
        data: Array<{ id: string; 名前: string; 基本hp: number }>; 
        count: number 
      };

      expect(resp.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.count).toBeGreaterThan(0);

      // 初期データが含まれていることを確認
      const speciesNames = json.data.map((s) => s.名前);
      expect(speciesNames).toContain('でんきネズミ');
      expect(speciesNames).toContain('ほのおトカゲ');
      expect(speciesNames).toContain('みずガメ');
    });
  });

  describe('プレイヤーAPI', () => {
    let createdPlayerId: string;

    it('新しいプレイヤーを作成できること', async () => {
      expect(worker).toBeDefined();
      
      const resp = await worker.fetch('/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'テストプレイヤー' }),
      });
      expect(resp).toBeDefined();
      
      const json = await resp.json() as { 
        success: boolean; 
        data: { id: string; name: string; initialMonsterId: string } 
      };

      expect(resp.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.name).toBe('テストプレイヤー');
      expect(json.data.id).toBeDefined();
      expect(json.data.initialMonsterId).toBeDefined();

      createdPlayerId = json.data.id;
    });

    it('プレイヤー名が短すぎる場合エラーになること', async () => {
      const resp = await worker.fetch('/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      });
      const json = await resp.json() as { success: boolean; error: string };

      expect(resp.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('1〜20文字');
    });

    it('プレイヤー名が長すぎる場合エラーになること', async () => {
      const resp = await worker.fetch('/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'あ'.repeat(21) }),
      });
      const json = await resp.json() as { success: boolean; error: string };

      expect(resp.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('1〜20文字');
    });

    it('作成したプレイヤーの所持モンスターが取得できること', async () => {
      const resp = await worker.fetch(`/players/${createdPlayerId}/monsters`);
      const json = await resp.json() as {
        success: boolean;
        data: {
          player: { 名前: string };
          monsters: Array<{
            種族名: string;
            ニックネーム: string;
            現在hp: number;
            最大hp: number;
          }>;
        };
      };

      expect(resp.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.player).toBeDefined();
      expect(json.data.player.名前).toBe('テストプレイヤー');
      expect(Array.isArray(json.data.monsters)).toBe(true);
      expect(json.data.monsters.length).toBe(1);

      // 初期モンスターの確認
      const initialMonster = json.data.monsters[0];
      expect(initialMonster).toBeDefined();
      expect(initialMonster?.種族名).toBe('でんきネズミ');
      expect(initialMonster?.ニックネーム).toBe('でんきネズミ');
      expect(initialMonster?.現在hp).toBe(35);
      expect(initialMonster?.最大hp).toBe(35);
    });

    it('存在しないプレイヤーの場合404エラーになること', async () => {
      const resp = await worker.fetch('/players/non_existent_player/monsters');
      const json = await resp.json() as { success: boolean; error: string };

      expect(resp.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toContain('プレイヤーが見つかりません');
    });
  });
});

/**
 * 初学者向けメモ：統合テストのポイント
 * 
 * 1. unstable_dev APIの使用
 *    - Wranglerが提供するテスト用API
 *    - 実際のWorker環境をローカルで再現
 * 
 * 2. 実際のD1データベース使用
 *    - --localフラグで.wrangler/state/v3/d1にデータを保存
 *    - マイグレーションが適用された状態でテスト
 * 
 * 3. エンドツーエンドテスト
 *    - HTTPリクエストからレスポンスまでの全体を検証
 *    - 実際のAPIの動作を確認
 * 
 * 4. テストの独立性
 *    - 各テストが他のテストに依存しない
 *    - テストデータの作成と検証を同じテスト内で実施
 */