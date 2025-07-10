/**
 * モンスター関連の型定義
 * 初学者向け: CRUDの基本となる型定義
 */

/**
 * モンスターのレア度（Monster rarity）
 * @description モンスターの希少度を表すユニオン型
 * @example
 * const rarity: MonsterRarity = 'common'; // 一般的
 * const rarity2: MonsterRarity = 'rare';   // レア
 * const rarity3: MonsterRarity = 'epic';   // エピック
 */
export type MonsterRarity = 'common' | 'rare' | 'epic';

/**
 * モンスターの種族マスターデータ（Monster species master data）
 * @description ゲーム内のモンスター種族の基本情報を定義
 * @example
 * const species: MonsterSpecies = {
 *   id: "species-1",
 *   name: "でんきネズミ",
 *   baseHp: 35,
 *   rarity: 'common'
 * };
 */
export interface MonsterSpecies {
  /** 種族の一意なID（Unique species identifier） */
  id: string;
  /** 種族名（例：でんきネズミ）（Species name, e.g. Electric Mouse） */
  name: string;
  /** 基本HP（Base HP points） */
  baseHp: number;
  /** レア度（Rarity level） */
  rarity: MonsterRarity;
}

/**
 * プレイヤーが所持するモンスター（Player-owned monster）
 * @description プレイヤーが捕獲し所有するモンスターの個体データ
 * @example
 * const ownedMonster: OwnedMonster = {
 *   id: "monster-instance-1",
 *   playerId: "player-1",
 *   speciesId: "species-1",
 *   speciesName: "でんきネズミ",
 *   nickname: "ピカ",
 *   currentHp: 30,
 *   maxHp: 35,
 *   capturedAt: "2025-07-10T00:00:00Z"
 * };
 */
export interface OwnedMonster {
  /** 個体の一意なID（Unique instance identifier） */
  id: string;
  /** 所有者のプレイヤーID（Owner player ID） */
  playerId: string;
  /** 種族ID（Species ID） */
  speciesId: string;
  /** 種族名（表示用）（Species name for display） */
  speciesName: string;
  /** ニックネーム（未設定時はnull）（Nickname, null if not set） */
  nickname: string | null;
  /** 現在のHP（Current HP points） */
  currentHp: number;
  /** 最大HP（Maximum HP points） */
  maxHp: number;
  /** 捕獲日時（Capture timestamp） */
  capturedAt: string;
}

/**
 * モンスター獲得時のデータ（Monster acquisition data）
 * @description モンスター獲得API呼び出し時に送信するデータ
 * @example
 * const acquisitionData: MonsterAcquisitionData = {
 *   speciesId: "species-1"
 * };
 */
export interface MonsterAcquisitionData {
  /** 獲得する種族のID（Species ID to acquire） */
  speciesId: string;
}

/**
 * モンスター情報更新データ（Monster update data）
 * @description モンスター情報更新API呼び出し時に送信するデータ
 * @example
 * const updateData: MonsterUpdateData = {
 *   nickname: "新しいニックネーム"
 * };
 */
export interface MonsterUpdateData {
  /** 新しいニックネーム（1-20文字）（New nickname, 1-20 characters） */
  nickname: string;
}

/**
 * モンスター一覧取得時のレスポンス（Monster list response）
 * @description モンスター一覧取得API成功時のレスポンスデータ
 * @example
 * const response: MonsterListResponse = {
 *   monsters: [ownedMonster1, ownedMonster2],
 *   totalCount: 2
 * };
 */
export interface MonsterListResponse {
  /** 所持モンスターの配列（Array of owned monsters） */
  monsters: OwnedMonster[];
  /** 総件数（Total count） */
  totalCount: number;
}

// 後方互換性のためのエイリアス（Backward compatibility aliases）
// 初学者向け：既存コードとの互換性を保ちながら段階的に移行するためのエイリアス

/** @deprecated Use MonsterRarity instead. モンスターレア度 → MonsterRarity への移行用エイリアス */
export type モンスターレア度 = MonsterRarity;

/** @deprecated Use MonsterSpecies instead. モンスター種族 → MonsterSpecies への移行用エイリアス */
export type モンスター種族 = MonsterSpecies;

/** @deprecated Use OwnedMonster instead. 所持モンスター → OwnedMonster への移行用エイリアス */
export type 所持モンスター = OwnedMonster;

/** @deprecated Use MonsterAcquisitionData instead. モンスター獲得データ → MonsterAcquisitionData への移行用エイリアス */
export type モンスター獲得データ = MonsterAcquisitionData;

/** @deprecated Use MonsterUpdateData instead. モンスター更新データ → MonsterUpdateData への移行用エイリアス */
export type モンスター更新データ = MonsterUpdateData;

/** @deprecated Use MonsterListResponse instead. モンスター一覧レスポンス → MonsterListResponse への移行用エイリアス */
export type モンスター一覧レスポンス = MonsterListResponse;