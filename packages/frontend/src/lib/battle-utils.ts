/**
 * バトルシステム用ユーティリティ関数
 * 初学者向け: バトルロジックの実装例
 */

import type { 
  BattleState, 
  WildMonster, 
  BattlePlayerMonster, 
  BattleLogEntry,
  BattleResult
} from '@monster-game/shared';
import { MONSTER_TYPES } from './utils';

/**
 * UUIDを生成する関数（UUID generation function）
 * @description バトルやログエントリのIDに使用
 * @returns ランダムなUUID文字列
 */
export function generateBattleId(): string {
  return `battle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * ログエントリのIDを生成（Generate log entry ID）
 * @description バトルログのエントリID生成
 * @returns ランダムなログエントリID文字列
 */
export function generateLogId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 野生モンスターを生成（Generate wild monster）
 * @description 指定された種族IDから野生モンスターを作成
 * @param speciesId - モンスター種族ID
 * @returns 野生モンスターデータ、見つからない場合はnull
 * @example
 * const wildMonster = createWildMonster('electric_mouse');
 * if (wildMonster) {
 *   console.log(`${wildMonster.speciesName}が現れた！`);
 * }
 */
export function createWildMonster(speciesId: string): WildMonster | null {
  const species = MONSTER_TYPES.find(monster => monster.id === speciesId);
  if (!species) {
    console.warn(`Species not found: ${speciesId}`);
    return null;
  }

  return {
    speciesId: species.id,
    speciesName: species.name,
    currentHp: species.baseHp,
    maxHp: species.baseHp,
    icon: species.icon
  };
}

/**
 * ランダムな野生モンスターを生成（Generate random wild monster）
 * @description MONSTER_TYPESからランダムに野生モンスターを作成
 * @returns ランダムな野生モンスターデータ
 * @example
 * const randomWild = createRandomWildMonster();
 * console.log(`野生の${randomWild.speciesName}が現れた！`);
 */
export function createRandomWildMonster(): WildMonster {
  const randomSpecies = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];
  return createWildMonster(randomSpecies.id)!;
}

/**
 * プレイヤーモンスターをバトル用に変換（Convert player monster for battle）
 * @description 既存のプレイヤーモンスターデータをバトル用形式に変換
 * @param playerMonster - プレイヤーの所持モンスターデータ
 * @returns バトル用プレイヤーモンスターデータ、種族が見つからない場合はnull
 * @example
 * const battleMonster = convertToBattlePlayerMonster(ownedMonster);
 * if (battleMonster) {
 *   console.log(`${battleMonster.nickname || battleMonster.speciesName}、君に決めた！`);
 * }
 */
export function convertToBattlePlayerMonster(
  playerMonster: {
    id: string;
    speciesId: string;
    nickname: string | null;
    currentHp: number;
    maxHp: number;
    種族?: { 名前: string } | { name: string };
  }
): BattlePlayerMonster | null {
  // デバッグ用：変換対象のモンスターデータをログ出力
  console.log('バトル用モンスター変換開始:', playerMonster);
  
  // 入力データの検証
  if (!playerMonster) {
    console.error('バトル用モンスター変換エラー: playerMonster が null または undefined');
    return null;
  }

  if (!playerMonster.id || !playerMonster.speciesId) {
    console.error('バトル用モンスター変換エラー: 必須フィールドが不足', {
      id: playerMonster.id,
      speciesId: playerMonster.speciesId
    });
    return null;
  }

  if (typeof playerMonster.currentHp !== 'number' || typeof playerMonster.maxHp !== 'number') {
    console.error('バトル用モンスター変換エラー: HP の型が不正', {
      currentHp: playerMonster.currentHp,
      maxHp: playerMonster.maxHp,
      currentHpType: typeof playerMonster.currentHp,
      maxHpType: typeof playerMonster.maxHp
    });
    return null;
  }

  if (playerMonster.currentHp < 0 || playerMonster.maxHp <= 0) {
    console.error('バトル用モンスター変換エラー: HP の値が不正', {
      currentHp: playerMonster.currentHp,
      maxHp: playerMonster.maxHp
    });
    return null;
  }
  
  // 種族情報を取得（まず種族データから、次にMONSTER_TYPESから）
  let speciesName = '';
  let icon = '🎮'; // デフォルトアイコン

  // 種族データがある場合
  if (playerMonster.種族) {
    const species = playerMonster.種族 as { 名前?: string; name?: string };
    speciesName = species.名前 || species.name || '';
    console.log('種族データから種族名を取得:', speciesName);
  }

  // 種族データがない場合はMONSTER_TYPESから検索
  if (!speciesName) {
    const species = MONSTER_TYPES.find(monster => monster.id === playerMonster.speciesId);
    if (species) {
      speciesName = species.name;
      icon = species.icon;
      console.log('MONSTER_TYPESから種族情報を取得:', { speciesName, icon });
    } else {
      console.error(`バトル用モンスター変換エラー: 種族が見つかりません`, {
        speciesId: playerMonster.speciesId,
        availableSpecies: MONSTER_TYPES.map(m => ({ id: m.id, name: m.name }))
      });
      return null;
    }
  } else {
    // 種族データがある場合はMONSTER_TYPESからアイコンを取得
    const species = MONSTER_TYPES.find(monster => monster.name === speciesName);
    if (species) {
      icon = species.icon;
      console.log('種族名からアイコンを取得:', { speciesName, icon });
    } else {
      console.warn(`アイコン取得警告: 種族名 "${speciesName}" に対応するアイコンが見つかりません`);
      // アイコンが見つからない場合もデフォルトアイコンで続行
    }
  }

  const battleMonster = {
    id: playerMonster.id,
    speciesId: playerMonster.speciesId,
    speciesName,
    nickname: playerMonster.nickname,
    currentHp: playerMonster.currentHp,
    maxHp: playerMonster.maxHp,
    icon
  };
  
  console.log('バトル用モンスター変換完了:', battleMonster);
  return battleMonster;
}

/**
 * 先攻判定（Determine first turn）
 * @description HPが高い方が先攻になる
 * @param playerHp - プレイヤーモンスターの現在HP
 * @param wildHp - 野生モンスターの現在HP
 * @returns 先攻のターン（'player' または 'wild'）
 * @example
 * const firstTurn = determineFirstTurn(35, 30);
 * console.log(firstTurn === 'player' ? 'プレイヤーの先攻！' : '野生モンスターの先攻！');
 */
export function determineFirstTurn(playerHp: number, wildHp: number): 'player' | 'wild' {
  if (playerHp > wildHp) {
    return 'player';
  } else if (wildHp > playerHp) {
    return 'wild';
  } else {
    // HP同じ場合はランダム
    return Math.random() < 0.5 ? 'player' : 'wild';
  }
}

/**
 * ダメージ計算（Calculate damage）
 * @description 固定ダメージでの攻撃計算
 * @param attacker - 攻撃者（'player' または 'wild'）
 * @returns 与えるダメージ値
 * @example
 * const damage = calculateDamage('player');
 * console.log(`${damage}ダメージを与えた！`);
 */
export function calculateDamage(attacker: 'player' | 'wild'): number {
  // 初学者向け: 固定ダメージで実装
  return attacker === 'player' ? 10 : 8;
}

/**
 * HP更新処理（Update HP）
 * @description ダメージを受けてHPを更新する
 * @param currentHp - 現在のHP
 * @param damage - 受けるダメージ
 * @returns 更新後のHP（0以下にはならない）
 * @example
 * const newHp = updateHp(25, 10);
 * console.log(`HP: ${newHp}`); // HP: 15
 */
export function updateHp(currentHp: number, damage: number): number {
  return Math.max(0, currentHp - damage);
}

/**
 * 捕獲可能判定（Check if capture is possible）
 * @description 野生モンスターが捕獲可能な状態かチェック（デバッグ用: 常に捕獲可能）
 * @param wildMonster - 野生モンスター
 * @returns 捕獲可能な場合はtrue（デバッグ用: 常にtrue）
 * @example
 * const canCapture = canCaptureWildMonster(wildMonster);
 * if (canCapture) {
 *   console.log('捕獲のチャンス！');
 * }
 */
export function canCaptureWildMonster(wildMonster: WildMonster): boolean {
  // デバッグ用: 常に捕獲可能
  console.log('デバッグ: 捕獲可能判定を常にtrueに設定');
  return true;
}

/**
 * 捕獲成功判定（Determine capture success）
 * @description 捕獲試行の成功・失敗を判定
 * @returns 成功の場合はtrue（デバッグ用: 100%の確率）
 * @example
 * const success = attemptCapture();
 * console.log(success ? '捕獲成功！' : '捕獲失敗...');
 */
export function attemptCapture(): boolean {
  // デバッグ用: 100%の確率で成功
  console.log('デバッグ: 捕獲確率100%に設定');
  return true;
}

/**
 * バトルログエントリを作成（Create battle log entry）
 * @description バトル中のアクションをログとして記録
 * @param message - ログメッセージ
 * @param type - ログタイプ
 * @returns 新しいログエントリ
 * @example
 * const logEntry = createLogEntry('でんきネズミに10ダメージ！', 'attack');
 */
export function createLogEntry(
  message: string, 
  type: BattleLogEntry['type']
): BattleLogEntry {
  return {
    id: generateLogId(),
    message,
    type,
    timestamp: Date.now()
  };
}

/**
 * バトル状態の初期化（Initialize battle state）
 * @description 新しいバトルの初期状態を作成
 * @param wildMonster - 野生モンスター
 * @param playerMonster - プレイヤーモンスター
 * @returns 初期化されたバトル状態
 * @example
 * const battleState = initializeBattleState(wildMonster, playerMonster);
 */
export function initializeBattleState(
  wildMonster: WildMonster,
  playerMonster: BattlePlayerMonster
): BattleState {
  const firstTurn = determineFirstTurn(playerMonster.currentHp, wildMonster.currentHp);
  
  return {
    id: generateBattleId(),
    wildMonster,
    playerMonster,
    currentTurn: firstTurn,
    status: 'ongoing',
    battleLog: [
      createLogEntry(`野生の${wildMonster.speciesName}が現れた！`, 'info'),
      createLogEntry(
        firstTurn === 'player' 
          ? `${playerMonster.nickname || playerMonster.speciesName}の先攻！` 
          : `野生の${wildMonster.speciesName}の先攻！`,
        'info'
      )
    ],
    turnCount: 1
  };
}

/**
 * バトル終了結果を作成（Create battle result）
 * @description バトル終了時の結果データを作成
 * @param battleState - 現在のバトル状態
 * @param capturedMonster - 捕獲したモンスター（任意）
 * @returns バトル結果データ
 */
export function createBattleResult(
  battleState: BattleState,
  capturedMonster?: BattleResult['capturedMonster']
): BattleResult {
  return {
    status: battleState.status,
    capturedMonster,
    playerMonster: battleState.playerMonster,
    totalTurns: battleState.turnCount,
    battleLog: battleState.battleLog
  };
}

/**
 * ターンを切り替える（Switch turn）
 * @description 現在のターンから次のターンに切り替える
 * @param currentTurn - 現在のターン
 * @returns 次のターン
 * @example
 * const nextTurn = switchTurn('player'); // 'wild'を返す
 * const nextTurn2 = switchTurn('wild'); // 'player'を返す
 */
export function switchTurn(currentTurn: 'player' | 'wild'): 'player' | 'wild' {
  return currentTurn === 'player' ? 'wild' : 'player';
}

/**
 * SessionStorageにバトル状態を保存（Save battle state to SessionStorage）
 * @description ページリロード対応のためのバトル状態保存
 * @param battleState - 保存するバトル状態
 * @example
 * saveBattleState(currentBattleState);
 */
export function saveBattleState(battleState: BattleState): void {
  try {
    sessionStorage.setItem('current_battle', JSON.stringify(battleState));
  } catch (error) {
    console.warn('バトル状態の保存に失敗:', error);
  }
}

/**
 * SessionStorageからバトル状態を読み込み（Load battle state from SessionStorage）
 * @description 保存されたバトル状態を復元
 * @returns 保存されたバトル状態、存在しない場合はnull
 * @example
 * const savedBattle = loadBattleState();
 * if (savedBattle) {
 *   console.log('バトルを再開します');
 * }
 */
export function loadBattleState(): BattleState | null {
  try {
    const saved = sessionStorage.getItem('current_battle');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('バトル状態の読み込みに失敗:', error);
    return null;
  }
}

/**
 * バトル状態をクリア（Clear battle state）
 * @description SessionStorageからバトル状態を削除
 * @example
 * clearBattleState(); // バトル終了時に呼び出し
 */
export function clearBattleState(): void {
  try {
    sessionStorage.removeItem('current_battle');
  } catch (error) {
    console.warn('バトル状態のクリアに失敗:', error);
  }
}

/**
 * HPの割合を計算（Calculate HP percentage）
 * @description HPバー表示用の割合計算
 * @param currentHp - 現在のHP
 * @param maxHp - 最大HP
 * @returns HP割合（0-100）
 * @example
 * const hpPercent = calculateHpPercentage(25, 50);
 * console.log(`HP: ${hpPercent}%`); // HP: 50%
 */
export function calculateHpPercentage(currentHp: number, maxHp: number): number {
  if (maxHp <= 0) return 0;
  return Math.round((currentHp / maxHp) * 100);
}

/**
 * HPバーの色を取得（Get HP bar color）
 * @description HPの割合に応じた色クラスを返す
 * @param hpPercent - HP割合（0-100）
 * @returns Tailwind CSSのカラークラス
 * @example
 * const color = getHpBarColor(25);
 * console.log(color); // 'bg-red-500' (低HPの場合)
 */
export function getHpBarColor(hpPercent: number): string {
  if (hpPercent > 60) return 'bg-green-500';
  if (hpPercent > 30) return 'bg-yellow-500';
  return 'bg-red-500';
}