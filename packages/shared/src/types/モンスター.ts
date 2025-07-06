/**
 * モンスター関連の型定義
 * 初学者向け: CRUDの基本となる型定義
 */

/**
 * モンスターのレア度
 */
export type モンスターレア度 = 'common' | 'rare' | 'epic';

/**
 * モンスターの種族マスターデータ
 */
export interface モンスター種族 {
  /** 種族の一意なID */
  id: string;
  /** 種族名（例：でんきネズミ） */
  名前: string;
  /** 基本HP */
  基本hp: number;
  /** レア度 */
  レア度: モンスターレア度;
}

/**
 * プレイヤーが所持するモンスター
 */
export interface 所持モンスター {
  /** 個体の一意なID */
  id: string;
  /** 所有者のプレイヤーID */
  プレイヤーid: string;
  /** 種族ID */
  種族id: string;
  /** 種族名（表示用） */
  種族名: string;
  /** ニックネーム（未設定時はnull） */
  ニックネーム: string | null;
  /** 現在のHP */
  現在hp: number;
  /** 最大HP */
  最大hp: number;
  /** 捕獲日時 */
  捕獲日時: string;
}

/**
 * モンスター獲得時のデータ
 */
export interface モンスター獲得データ {
  /** 獲得する種族のID */
  種族id: string;
}

/**
 * モンスター情報更新データ
 */
export interface モンスター更新データ {
  /** 新しいニックネーム（1-20文字） */
  ニックネーム: string;
}

/**
 * モンスター一覧取得時のレスポンス
 */
export interface モンスター一覧レスポンス {
  /** 所持モンスターの配列 */
  モンスター一覧: 所持モンスター[];
  /** 総件数 */
  合計数: number;
}