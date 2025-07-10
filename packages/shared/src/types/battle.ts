/**
 * バトル関連の型定義
 * 初学者向け: シンプルなバトルシステム
 */

/**
 * バトルの状態
 */
export type バトル状態 = 'battle' | 'capture' | 'victory' | 'defeat' | 'escape';

/**
 * バトルアクション
 */
export type バトルアクション = 'たたかう' | 'つかまえる' | 'にげる';

/**
 * 野生モンスターの情報
 */
export interface 野生モンスター {
  /** 種族ID */
  種族id: string;
  /** 種族名 */
  種族名: string;
  /** 現在のHP */
  現在hp: number;
  /** 最大HP */
  最大hp: number;
}

/**
 * バトル状況
 */
export interface バトル情報 {
  /** バトルの一意なID */
  id: string;
  /** プレイヤーID */
  プレイヤーid: string;
  /** 野生モンスター情報 */
  野生モンスター: 野生モンスター;
  /** 現在のバトル状態 */
  状態: バトル状態;
  /** バトル開始日時 */
  開始日時: string;
}

/**
 * バトルアクション実行データ
 */
export interface バトルアクション実行データ {
  /** 実行するアクション */
  アクション: バトルアクション;
}

/**
 * バトルアクション結果
 */
export interface バトルアクション結果 {
  /** 更新されたバトル情報 */
  バトル情報: バトル情報;
  /** 結果メッセージ */
  メッセージ: string;
  /** 捕獲成功時の所持モンスター（捕獲成功時のみ） */
  捕獲モンスター?: {
    id: string;
    プレイヤーid: string;
    種族id: string;
    種族名: string;
    ニックネーム: string | null;
    現在hp: number;
    最大hp: number;
    捕獲日時: string;
  };
}