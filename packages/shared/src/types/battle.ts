/**
 * バトル関連の型定義
 * 初学者向け: シンプルなバトルシステム
 */

/**
 * バトルの状態（Battle state）
 * @description バトルの進行状況を表すユニオン型
 * @example
 * const state: BattleState = 'battle'; // バトル中
 * const state2: BattleState = 'capture'; // 捕獲試行中
 * const state3: BattleState = 'victory'; // 勝利
 */
export type BattleState = 'battle' | 'capture' | 'victory' | 'defeat' | 'escape';

/**
 * バトルアクション（Battle action）
 * @description プレイヤーが選択可能なバトル行動
 * @example
 * const action: BattleAction = 'たたかう'; // 攻撃
 * const action2: BattleAction = 'つかまえる'; // 捕獲
 * const action3: BattleAction = 'にげる'; // 逃走
 */
export type BattleAction = 'たたかう' | 'つかまえる' | 'にげる';

/**
 * 野生モンスターの情報（Wild monster information）
 * @description バトル中の野生モンスターのデータ
 * @example
 * const wildMonster: WildMonster = {
 *   speciesId: "species-1",
 *   speciesName: "でんきネズミ",
 *   currentHp: 20,
 *   maxHp: 35
 * };
 */
export interface WildMonster {
  /** 種族ID（Species identifier） */
  speciesId: string;
  /** 種族名（Species name） */
  speciesName: string;
  /** 現在のHP（Current HP） */
  currentHp: number;
  /** 最大HP（Maximum HP） */
  maxHp: number;
}

/**
 * バトル状況（Battle information）
 * @description 現在進行中のバトルの状況データ
 * @example
 * const battleInfo: BattleInfo = {
 *   id: "battle-1",
 *   playerId: "player-1",
 *   wildMonster: { speciesId: "...", speciesName: "...", currentHp: 20, maxHp: 35 },
 *   state: 'battle',
 *   startedAt: "2025-07-10T00:00:00Z"
 * };
 */
export interface BattleInfo {
  /** バトルの一意なID（Unique battle identifier） */
  id: string;
  /** プレイヤーID（Player identifier） */
  playerId: string;
  /** 野生モンスター情報（Wild monster information） */
  wildMonster: WildMonster;
  /** 現在のバトル状態（Current battle state） */
  state: BattleState;
  /** バトル開始日時（Battle start timestamp） */
  startedAt: string;
}

/**
 * バトルアクション実行データ（Battle action execution data）
 * @description バトルアクション実行API呼び出し時に送信するデータ
 * @example
 * const actionData: BattleActionData = {
 *   action: 'たたかう'
 * };
 */
export interface BattleActionData {
  /** 実行するアクション（Action to execute） */
  action: BattleAction;
}

/**
 * バトルアクション結果（Battle action result）
 * @description バトルアクション実行後の結果データ
 * @example
 * const result: BattleActionResult = {
 *   battleInfo: { id: "...", playerId: "...", wildMonster: {...}, state: 'victory', startedAt: "..." },
 *   message: "でんきネズミを倒した！",
 *   capturedMonster: {
 *     id: "captured-1",
 *     playerId: "player-1",
 *     speciesId: "species-1",
 *     speciesName: "でんきネズミ",
 *     nickname: null,
 *     currentHp: 20,
 *     maxHp: 35,
 *     capturedAt: "2025-07-10T00:00:00Z"
 *   }
 * };
 */
export interface BattleActionResult {
  /** 更新されたバトル情報（Updated battle information） */
  battleInfo: BattleInfo;
  /** 結果メッセージ（Result message） */
  message: string;
  /** 捕獲成功時の所持モンスター（捕獲成功時のみ）（Captured monster, only when capture succeeds） */
  capturedMonster?: {
    id: string;
    playerId: string;
    speciesId: string;
    speciesName: string;
    nickname: string | null;
    currentHp: number;
    maxHp: number;
    capturedAt: string;
  };
}

// 後方互換性のためのエイリアス（Backward compatibility aliases）
// 初学者向け：既存コードとの互換性を保ちながら段階的に移行するためのエイリアス

/** @deprecated Use BattleState instead. バトル状態 → BattleState への移行用エイリアス */
export type バトル状態 = BattleState;

/** @deprecated Use BattleAction instead. バトルアクション → BattleAction への移行用エイリアス */
export type バトルアクション = BattleAction;

/** @deprecated Use WildMonster instead. 野生モンスター → WildMonster への移行用エイリアス */
export type 野生モンスター = WildMonster;

/** @deprecated Use BattleInfo instead. バトル情報 → BattleInfo への移行用エイリアス */
export type バトル情報 = BattleInfo;

/** @deprecated Use BattleActionData instead. バトルアクション実行データ → BattleActionData への移行用エイリアス */
export type バトルアクション実行データ = BattleActionData;

/** @deprecated Use BattleActionResult instead. バトルアクション結果 → BattleActionResult への移行用エイリアス */
export type バトルアクション結果 = BattleActionResult;