/**
 * プレイヤー関連の型定義
 * 初学者向け: 日本語でわかりやすく命名
 */

/**
 * プレイヤーの基本情報（Player basic information）
 * @description ゲーム内のプレイヤーアカウントの基本データを定義
 * @example
 * const player: Player = {
 *   id: "uuid-here",
 *   name: "太郎",
 *   createdAt: "2025-07-10T00:00:00Z"
 * };
 */
export interface Player {
  /** プレイヤーの一意なID（Unique player identifier） */
  id: string;
  /** プレイヤー名（3-20文字）（Player name, 3-20 characters） */
  name: string;
  /** アカウント作成日時（Account creation timestamp） */
  createdAt: string;
}

/**
 * 新規プレイヤー作成時のデータ（Player creation data）
 * @description プレイヤーアカウント新規作成時に必要なデータ
 * @example
 * const createData: PlayerCreationData = {
 *   name: "新しいプレイヤー"
 * };
 */
export interface PlayerCreationData {
  /** プレイヤー名（3-20文字）（Player name, 3-20 characters） */
  name: string;
}

/**
 * プレイヤー作成後のレスポンス（Player creation response）
 * @description プレイヤー作成API成功時のレスポンスデータ
 * @example
 * const response: PlayerCreationResponse = {
 *   player: { id: "...", name: "...", createdAt: "..." },
 *   initialMonsterId: "starter-monster-uuid"
 * };
 */
export interface PlayerCreationResponse {
  /** 作成されたプレイヤー情報（Created player information） */
  player: Player;
  /** 初期付与されたモンスターのID（Initial monster ID） */
  initialMonsterId: string;
}

// 後方互換性のためのエイリアス（Backward compatibility aliases）
// 初学者向け：既存コードとの互換性を保ちながら段階的に移行するためのエイリアス

/** @deprecated Use Player instead. プレイヤー → Player への移行用エイリアス */
export type プレイヤー = Player;

/** @deprecated Use PlayerCreationData instead. プレイヤー作成データ → PlayerCreationData への移行用エイリアス */
export type プレイヤー作成データ = PlayerCreationData;

/** @deprecated Use PlayerCreationResponse instead. プレイヤー作成レスポンス → PlayerCreationResponse への移行用エイリアス */
export type プレイヤー作成レスポンス = PlayerCreationResponse;