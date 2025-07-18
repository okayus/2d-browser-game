/**
 * バトルシステム関連の型定義
 * 初学者向け: ターン制バトルの基本概念を学ぶ
 */

/**
 * バトルアクションの種類（Battle action types）
 * @description プレイヤーが選択可能なアクション
 * @example
 * const action: BattleAction = 'attack'; // 攻撃
 * const action2: BattleAction = 'capture'; // 捕獲
 * const action3: BattleAction = 'escape'; // 逃走
 */
export type BattleAction = 'attack' | 'capture' | 'escape';

/**
 * バトルの状態（Battle status）
 * @description 現在のバトルの進行状態を表す
 * @example
 * const status: BattleStatus = 'ongoing'; // 継続中
 * const status2: BattleStatus = 'victory'; // 勝利
 */
export type BattleStatus = 'ongoing' | 'victory' | 'defeat' | 'escaped' | 'captured';

/**
 * ターンの種類（Turn types）
 * @description 現在のターンがプレイヤーか野生モンスターかを示す
 * @example
 * const turn: BattleTurn = 'player'; // プレイヤーのターン
 * const turn2: BattleTurn = 'wild'; // 野生モンスターのターン
 */
export type BattleTurn = 'player' | 'wild';

/**
 * 野生モンスターの情報（Wild monster information）
 * @description バトル時の野生モンスターデータ
 * @example
 * const wildMonster: WildMonster = {
 *   speciesId: "electric_mouse",
 *   speciesName: "でんきネズミ",
 *   currentHp: 25,
 *   maxHp: 35,
 *   icon: "⚡"
 * };
 */
export interface WildMonster {
  /** 種族ID（Species ID） */
  speciesId: string;
  /** 種族名（Species name） */
  speciesName: string;
  /** 現在のHP（Current HP） */
  currentHp: number;
  /** 最大HP（Maximum HP） */
  maxHp: number;
  /** アイコン（Icon） */
  icon: string;
}

/**
 * バトル中のプレイヤーモンスター情報（Player monster in battle）
 * @description バトル時のプレイヤーモンスターデータ
 * @example
 * const playerMonster: BattlePlayerMonster = {
 *   id: "monster-123",
 *   speciesId: "fire_lizard",
 *   speciesName: "ほのおトカゲ",
 *   nickname: "ファイア",
 *   currentHp: 30,
 *   maxHp: 40,
 *   icon: "🔥"
 * };
 */
export interface BattlePlayerMonster {
  /** モンスターの個体ID（Monster instance ID） */
  id: string;
  /** 種族ID（Species ID） */
  speciesId: string;
  /** 種族名（Species name） */
  speciesName: string;
  /** ニックネーム（Nickname） */
  nickname: string | null;
  /** 現在のHP（Current HP） */
  currentHp: number;
  /** 最大HP（Maximum HP） */
  maxHp: number;
  /** アイコン（Icon） */
  icon: string;
}

/**
 * バトルログのエントリ（Battle log entry）
 * @description バトル中のアクションや結果を記録
 * @example
 * const logEntry: BattleLogEntry = {
 *   id: "log-1",
 *   message: "でんきネズミに10ダメージを与えた！",
 *   type: "attack",
 *   timestamp: Date.now()
 * };
 */
export interface BattleLogEntry {
  /** ログエントリのID（Log entry ID） */
  id: string;
  /** ログメッセージ（Log message） */
  message: string;
  /** ログの種類（Log type） */
  type: 'attack' | 'damage' | 'capture' | 'escape' | 'info' | 'victory' | 'defeat';
  /** タイムスタンプ（Timestamp） */
  timestamp: number;
}

/**
 * バトル状態（Battle state）
 * @description バトル全体の状態を管理する中心的なインターフェース
 * @example
 * const battleState: BattleState = {
 *   id: "battle-123",
 *   wildMonster: wildMonsterData,
 *   playerMonster: playerMonsterData,
 *   currentTurn: 'player',
 *   status: 'ongoing',
 *   battleLog: [],
 *   turnCount: 1
 * };
 */
export interface BattleState {
  /** バトルの一意なID（Unique battle ID） */
  id: string;
  /** 野生モンスター（Wild monster） */
  wildMonster: WildMonster;
  /** プレイヤーモンスター（Player monster） */
  playerMonster: BattlePlayerMonster;
  /** 現在のターン（Current turn） */
  currentTurn: BattleTurn;
  /** バトルの状態（Battle status） */
  status: BattleStatus;
  /** バトルログ（Battle log） */
  battleLog: BattleLogEntry[];
  /** ターン数（Turn count） */
  turnCount: number;
}

/**
 * バトル結果（Battle result）
 * @description バトル終了時の結果データ
 * @example
 * const result: BattleResult = {
 *   status: 'captured',
 *   capturedMonster: newMonsterData,
 *   playerMonster: updatedPlayerMonster,
 *   totalTurns: 5,
 *   battleLog: allLogEntries
 * };
 */
export interface BattleResult {
  /** 最終的なバトル状態（Final battle status） */
  status: BattleStatus;
  /** 捕獲したモンスター（捕獲時のみ）（Captured monster, only when captured） */
  capturedMonster?: {
    id: string;
    speciesId: string;
    speciesName: string;
    nickname: string;
    currentHp: number;
    maxHp: number;
  };
  /** バトル後のプレイヤーモンスター（Player monster after battle） */
  playerMonster: BattlePlayerMonster;
  /** 総ターン数（Total turns） */
  totalTurns: number;
  /** 全バトルログ（Complete battle log） */
  battleLog: BattleLogEntry[];
}

/**
 * バトル開始時のデータ（Battle initialization data）
 * @description バトル開始時に必要な初期データ
 * @example
 * const initData: BattleInitData = {
 *   playerId: "player-123",
 *   playerMonsterId: "monster-456",
 *   wildMonsterSpeciesId: "electric_mouse"
 * };
 */
export interface BattleInitData {
  /** プレイヤーID（Player ID） */
  playerId: string;
  /** 使用するプレイヤーモンスターのID（Player monster ID to use） */
  playerMonsterId: string;
  /** 遭遇する野生モンスターの種族ID（Wild monster species ID to encounter） */
  wildMonsterSpeciesId: string;
}

// 後方互換性のためのエイリアス（Backward compatibility aliases）
// 初学者向け：既存コードとの互換性を保ちながら段階的に移行するためのエイリアス

/** @deprecated Use BattleAction instead. バトルアクション → BattleAction への移行用エイリアス */
export type バトルアクション = BattleAction;

/** @deprecated Use BattleStatus instead. バトル状態 → BattleStatus への移行用エイリアス */
export type バトル状態 = BattleStatus;

/** @deprecated Use BattleTurn instead. バトルターン → BattleTurn への移行用エイリアス */
export type バトルターン = BattleTurn;

/** @deprecated Use WildMonster instead. 野生モンスター → WildMonster への移行用エイリアス */
export type 野生モンスター = WildMonster;

/** @deprecated Use BattlePlayerMonster instead. バトルプレイヤーモンスター → BattlePlayerMonster への移行用エイリアス */
export type バトルプレイヤーモンスター = BattlePlayerMonster;

/** @deprecated Use BattleLogEntry instead. バトルログエントリ → BattleLogEntry への移行用エイリアス */
export type バトルログエントリ = BattleLogEntry;

/** @deprecated Use BattleState instead. バトル全体状態 → BattleState への移行用エイリアス */
export type バトル全体状態 = BattleState;

/** @deprecated Use BattleResult instead. バトル結果 → BattleResult への移行用エイリアス */
export type バトル結果 = BattleResult;

/** @deprecated Use BattleInitData instead. バトル初期データ → BattleInitData への移行用エイリアス */
export type バトル初期データ = BattleInitData;