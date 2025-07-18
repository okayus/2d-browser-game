/**
 * battle-utils.ts のユニットテスト
 * 初学者向け: バトルシステムのテスト実装例
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateBattleId,
  generateLogId,
  createWildMonster,
  createRandomWildMonster,
  convertToBattlePlayerMonster,
  determineFirstTurn,
  calculateDamage,
  updateHp,
  canCaptureWildMonster,
  attemptCapture,
  createLogEntry,
  initializeBattleState,
  createBattleResult,
  saveBattleState,
  loadBattleState,
  clearBattleState,
  calculateHpPercentage,
  getHpBarColor
} from '../../lib/battle-utils';

// テスト用のモックデータ
const mockPlayerMonster = {
  id: 'test-monster-id',
  speciesId: 'electric_mouse',
  nickname: 'ピカピカ',
  currentHp: 35,
  maxHp: 35,
  種族: { 名前: 'でんきネズミ' }
};

const mockWildMonster = {
  speciesId: 'electric_mouse',
  speciesName: 'でんきネズミ',
  currentHp: 35,
  maxHp: 35,
  icon: '⚡'
};

const mockBattlePlayerMonster = {
  id: 'test-monster-id',
  speciesId: 'electric_mouse',
  speciesName: 'でんきネズミ',
  nickname: 'ピカピカ',
  currentHp: 35,
  maxHp: 35,
  icon: '⚡'
};

describe('battle-utils', () => {
  beforeEach(() => {
    // sessionStorageをクリア
    sessionStorage.clear();
  });

  describe('ID生成関数', () => {
    it('generateBattleId が一意のバトルIDを生成する', () => {
      const id1 = generateBattleId();
      const id2 = generateBattleId();
      
      expect(id1).toMatch(/^battle-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^battle-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('generateLogId が一意のログIDを生成する', () => {
      const id1 = generateLogId();
      const id2 = generateLogId();
      
      expect(id1).toMatch(/^log-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^log-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('野生モンスター生成', () => {
    it('createWildMonster が正しい種族IDから野生モンスターを生成する', () => {
      const wildMonster = createWildMonster('electric_mouse');
      
      expect(wildMonster).toEqual({
        speciesId: 'electric_mouse',
        speciesName: 'でんきネズミ',
        currentHp: 35,
        maxHp: 35,
        icon: '⚡'
      });
    });

    it('createWildMonster が存在しない種族IDに対してnullを返す', () => {
      const wildMonster = createWildMonster('non_existent_species');
      
      expect(wildMonster).toBeNull();
    });

    it('createRandomWildMonster がランダムな野生モンスターを生成する', () => {
      const wildMonster = createRandomWildMonster();
      
      expect(wildMonster).toHaveProperty('speciesId');
      expect(wildMonster).toHaveProperty('speciesName');
      expect(wildMonster).toHaveProperty('currentHp');
      expect(wildMonster).toHaveProperty('maxHp');
      expect(wildMonster).toHaveProperty('icon');
      expect(wildMonster.currentHp).toBe(wildMonster.maxHp);
    });
  });

  describe('プレイヤーモンスター変換', () => {
    it('convertToBattlePlayerMonster が正常なデータを変換する', () => {
      const battleMonster = convertToBattlePlayerMonster(mockPlayerMonster);
      
      expect(battleMonster).toEqual({
        id: 'test-monster-id',
        speciesId: 'electric_mouse',
        speciesName: 'でんきネズミ',
        nickname: 'ピカピカ',
        currentHp: 35,
        maxHp: 35,
        icon: '⚡'
      });
    });

    it('convertToBattlePlayerMonster が種族データなしでも変換する', () => {
      const monsterWithoutSpecies = {
        ...mockPlayerMonster,
        種族: undefined
      };
      
      const battleMonster = convertToBattlePlayerMonster(monsterWithoutSpecies);
      
      expect(battleMonster).toEqual({
        id: 'test-monster-id',
        speciesId: 'electric_mouse',
        speciesName: 'でんきネズミ',
        nickname: 'ピカピカ',
        currentHp: 35,
        maxHp: 35,
        icon: '⚡'
      });
    });

    it('convertToBattlePlayerMonster が不正なデータに対してnullを返す', () => {
      const invalidMonster = {
        id: '',
        speciesId: 'electric_mouse',
        nickname: 'ピカピカ',
        currentHp: 35,
        maxHp: 35
      };
      
      const battleMonster = convertToBattlePlayerMonster(invalidMonster);
      
      expect(battleMonster).toBeNull();
    });

    it('convertToBattlePlayerMonster が存在しない種族IDに対してnullを返す', () => {
      const monsterWithInvalidSpecies = {
        ...mockPlayerMonster,
        speciesId: 'non_existent_species',
        種族: undefined
      };
      
      const battleMonster = convertToBattlePlayerMonster(monsterWithInvalidSpecies);
      
      expect(battleMonster).toBeNull();
    });
  });

  describe('バトルロジック', () => {
    it('determineFirstTurn がHPが高い方を先攻にする', () => {
      expect(determineFirstTurn(40, 30)).toBe('player');
      expect(determineFirstTurn(30, 40)).toBe('wild');
    });

    it('determineFirstTurn がHPが同じ場合にランダムに決定する', () => {
      // Math.randomをモック
      vi.spyOn(Math, 'random').mockReturnValue(0.3);
      expect(determineFirstTurn(35, 35)).toBe('player');
      
      vi.spyOn(Math, 'random').mockReturnValue(0.7);
      expect(determineFirstTurn(35, 35)).toBe('wild');
    });

    it('calculateDamage が正しいダメージを計算する', () => {
      expect(calculateDamage('player')).toBe(10);
      expect(calculateDamage('wild')).toBe(8);
    });

    it('updateHp が正しくHPを更新する', () => {
      expect(updateHp(25, 10)).toBe(15);
      expect(updateHp(5, 10)).toBe(0); // 0以下にはならない
    });

    it('canCaptureWildMonster がHP50%以下で捕獲可能判定する', () => {
      const capturable = { ...mockWildMonster, currentHp: 17 }; // 50%以下
      const notCapturable = { ...mockWildMonster, currentHp: 18 }; // 50%超
      
      expect(canCaptureWildMonster(capturable)).toBe(true);
      expect(canCaptureWildMonster(notCapturable)).toBe(false);
    });

    it('attemptCapture がランダムに成功・失敗を決定する', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.3);
      expect(attemptCapture()).toBe(true);
      
      vi.spyOn(Math, 'random').mockReturnValue(0.7);
      expect(attemptCapture()).toBe(false);
    });
  });

  describe('ログ機能', () => {
    it('createLogEntry が正しいログエントリを作成する', () => {
      const logEntry = createLogEntry('テストメッセージ', 'attack');
      
      expect(logEntry).toHaveProperty('id');
      expect(logEntry).toHaveProperty('message', 'テストメッセージ');
      expect(logEntry).toHaveProperty('type', 'attack');
      expect(logEntry).toHaveProperty('timestamp');
      expect(typeof logEntry.timestamp).toBe('number');
    });
  });

  describe('バトル状態管理', () => {
    it('initializeBattleState が正しい初期状態を作成する', () => {
      const battleState = initializeBattleState(mockWildMonster, mockBattlePlayerMonster);
      
      expect(battleState).toHaveProperty('id');
      expect(battleState.wildMonster).toEqual(mockWildMonster);
      expect(battleState.playerMonster).toEqual(mockBattlePlayerMonster);
      expect(battleState.status).toBe('ongoing');
      expect(battleState.turnCount).toBe(1);
      expect(battleState.battleLog).toHaveLength(2);
      expect(['player', 'wild']).toContain(battleState.currentTurn);
    });

    it('createBattleResult が正しい結果を作成する', () => {
      const battleState = initializeBattleState(mockWildMonster, mockBattlePlayerMonster);
      battleState.status = 'victory';
      
      const result = createBattleResult(battleState);
      
      expect(result.status).toBe('victory');
      expect(result.playerMonster).toEqual(mockBattlePlayerMonster);
      expect(result.totalTurns).toBe(1);
      expect(result.battleLog).toEqual(battleState.battleLog);
    });
  });

  describe('sessionStorage管理', () => {
    it('saveBattleState と loadBattleState が正しく動作する', () => {
      const battleState = initializeBattleState(mockWildMonster, mockBattlePlayerMonster);
      
      saveBattleState(battleState);
      const loadedState = loadBattleState();
      
      expect(loadedState).toEqual(battleState);
    });

    it('clearBattleState が状態をクリアする', () => {
      const battleState = initializeBattleState(mockWildMonster, mockBattlePlayerMonster);
      
      saveBattleState(battleState);
      clearBattleState();
      
      const loadedState = loadBattleState();
      expect(loadedState).toBeNull();
    });

    it('loadBattleState が存在しない状態に対してnullを返す', () => {
      const loadedState = loadBattleState();
      expect(loadedState).toBeNull();
    });
  });

  describe('HP表示機能', () => {
    it('calculateHpPercentage が正しい割合を計算する', () => {
      expect(calculateHpPercentage(25, 50)).toBe(50);
      expect(calculateHpPercentage(0, 50)).toBe(0);
      expect(calculateHpPercentage(50, 50)).toBe(100);
      expect(calculateHpPercentage(25, 0)).toBe(0);
    });

    it('getHpBarColor が正しい色を返す', () => {
      expect(getHpBarColor(80)).toBe('bg-green-500');
      expect(getHpBarColor(50)).toBe('bg-yellow-500');
      expect(getHpBarColor(20)).toBe('bg-red-500');
    });
  });
});