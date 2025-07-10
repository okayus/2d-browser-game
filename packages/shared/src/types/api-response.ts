/**
 * API応答の型定義
 * 
 * 初学者向けメモ：
 * - フロントエンドとバックエンドで共通の型定義を使用
 * - API通信の型安全性を確保
 * - ジェネリクス（T）を使用して柔軟な型定義を実現
 */

/**
 * 基本的なAPI応答インターフェース（Basic API response interface）
 * 
 * @description 全てのAPI応答で一貫した構造を提供するベースインターフェース
 * @template T - データの型（デフォルトはunknown）（Data type, defaults to unknown）
 * 
 * 初学者向けメモ：
 * - ジェネリクス <T> により、データの型を動的に指定可能
 * - 全てのAPI応答で一貫した構造を保証
 * - 成功・失敗の判定を型レベルで管理
 * 
 * @example
 * // プレイヤー情報を返すAPI応答
 * const response: ApiResponse<Player> = {
 *   success: true,
 *   message: "プレイヤー取得成功",
 *   data: { id: "...", name: "...", createdAt: "..." }
 * };
 */
export interface ApiResponse<T = unknown> {
  /** API実行の成功・失敗フラグ（Success/failure flag） */
  readonly success: boolean;
  
  /** ユーザー向けメッセージ（User-facing message） */
  readonly message: string;
  
  /** 成功時に返されるデータ（オプション）（Data returned on success, optional） */
  readonly data?: T;
  
  /** エラー時の詳細情報（オプション）（Error details, optional） */
  readonly error?: string;
}

/**
 * プレイヤー関連の型定義をインポート
 * 
 * 初学者向けメモ：
 * - 相対パスでの型インポート
 * - モジュラーな型定義の管理
 */
import type { Player } from './player';

/**
 * プレイヤー応答（Player response）
 * @description プレイヤー作成・取得API応答の型定義
 * @example
 * const response: PlayerResponse = {
 *   success: true,
 *   message: "プレイヤー取得成功",
 *   data: { id: "...", name: "太郎", createdAt: "..." }
 * };
 */
export interface PlayerResponse extends ApiResponse<Player> {}

/**
 * プレイヤー一覧応答（Player list response）
 * @description プレイヤー一覧取得API応答の型定義
 * @example
 * const response: PlayerListResponse = {
 *   success: true,
 *   message: "プレイヤー一覧取得成功",
 *   data: [player1, player2],
 *   count: 2
 * };
 */
export interface PlayerListResponse extends ApiResponse<Player[]> {
  /** 取得されたプレイヤーの件数（Number of players retrieved） */
  readonly count: number;
}

/**
 * プレイヤー作成API応答（Player creation API response）
 * @description プレイヤー作成API専用の応答型定義
 * @example
 * const response: PlayerCreationApiResponse = {
 *   success: true,
 *   message: "プレイヤー作成成功",
 *   data: {
 *     id: "player-id",
 *     name: "新プレイヤー",
 *     initialMonsterId: "monster-id"
 *   }
 * };
 */
export interface PlayerCreationApiResponse extends ApiResponse<{
  id: string;
  name: string;
  initialMonsterId?: string;
}> {}

/**
 * プレイヤー一覧API応答（Player list API response）
 * @description フロントエンド用のプレイヤー一覧応答型
 */
export interface PlayerListApiResponse extends ApiResponse<Player[]> {}

/**
 * モンスター一覧API応答（Monster list API response）
 * @description フロントエンド用のモンスター一覧応答型
 * @example
 * const response: MonsterListApiResponse = {
 *   success: true,
 *   message: "モンスター一覧取得成功",
 *   data: {
 *     player: { id: "...", name: "...", createdAt: "..." },
 *     monsters: [
 *       {
 *         id: "monster-1",
 *         nickname: "ピカ",
 *         currentHp: 30,
 *         maxHp: 35,
 *         capturedAt: "2025-07-10T00:00:00Z",
 *         speciesName: "でんきネズミ",
 *         speciesDescription: "電気を操る小さなモンスター"
 *       }
 *     ]
 *   }
 * };
 */
export interface MonsterListApiResponse extends ApiResponse<{
  player: Player;
  monsters: Array<{
    id: string;
    nickname: string;
    currentHp: number;
    maxHp: number;
    capturedAt: string;
    speciesName: string;
    speciesDescription?: string;
  }>;
}> {}

/**
 * エラー専用応答（Error response）
 * @description エラー時に特化した型定義
 * @example
 * const errorResponse: ErrorResponse = {
 *   success: false,
 *   message: "プレイヤーが見つかりません",
 *   error: "PLAYER_NOT_FOUND"
 * };
 */
export interface ErrorResponse extends ApiResponse<undefined> {
  readonly success: false;
  readonly error: string;
}

/**
 * 成功専用応答のヘルパー型（Success response helper）
 * @description 成功時に特化した型定義
 * @template T データの型（Data type）
 * @example
 * const successResponse: SuccessResponse<Player> = {
 *   success: true,
 *   message: "プレイヤー取得成功",
 *   data: { id: "...", name: "...", createdAt: "..." }
 * };
 */
export interface SuccessResponse<T> extends ApiResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly error?: never;
}

/**
 * APIエラーレスポンス（API error response）
 * @description フロントエンド用の構造化エラー応答型
 * @example
 * const apiError: ApiErrorResponse = {
 *   success: false,
 *   error: {
 *     code: "VALIDATION_ERROR",
 *     message: "入力値が不正です"
 *   }
 * };
 */
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

/**
 * HTTPレスポンス型（HTTP response type）
 * @description 統一されたHTTPレスポンス形式の型定義
 * @template T データの型（Data type）
 * @example
 * const httpResponse: HttpResponseType<Player[]> = {
 *   success: true,
 *   data: [player1, player2],
 *   message: "プレイヤー一覧取得成功",
 *   count: 2
 * };
 */
export interface HttpResponseType<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly message?: string;
  readonly count?: number;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

// 後方互換性のためのエイリアス（Backward compatibility aliases）
// 初学者向け：既存コードとの互換性を保ちながら段階的に移行するためのエイリアス

/** @deprecated Use ApiResponse instead. API応答 → ApiResponse への移行用エイリアス */
export type API応答<T = unknown> = ApiResponse<T>;

/** @deprecated Use PlayerResponse instead. プレイヤー応答 → PlayerResponse への移行用エイリアス */
export type プレイヤー応答 = PlayerResponse;

/** @deprecated Use PlayerListResponse instead. プレイヤー一覧応答 → PlayerListResponse への移行用エイリアス */
export type プレイヤー一覧応答 = PlayerListResponse;

/** @deprecated Use PlayerCreationApiResponse instead. プレイヤー作成API応答 → PlayerCreationApiResponse への移行用エイリアス */
export type プレイヤー作成API応答 = PlayerCreationApiResponse;

/** @deprecated Use PlayerListApiResponse instead. プレイヤー一覧API応答 → PlayerListApiResponse への移行用エイリアス */
export type プレイヤー一覧API応答 = PlayerListApiResponse;

/** @deprecated Use MonsterListApiResponse instead. モンスター一覧API応答 → MonsterListApiResponse への移行用エイリアス */
export type モンスター一覧API応答 = MonsterListApiResponse;

/** @deprecated Use ErrorResponse instead. エラー応答 → ErrorResponse への移行用エイリアス */
export type エラー応答 = ErrorResponse;

/** @deprecated Use SuccessResponse instead. 成功応答 → SuccessResponse への移行用エイリアス */
export type 成功応答<T> = SuccessResponse<T>;

/** @deprecated Use ApiErrorResponse instead. APIエラー応答 → ApiErrorResponse への移行用エイリアス */
export type APIエラー応答 = ApiErrorResponse;

/** @deprecated Use HttpResponseType instead. HTTPレスポンス型 → HttpResponseType への移行用エイリアス */
export type HTTPレスポンス型<T = unknown> = HttpResponseType<T>;

/**
 * 初学者向けメモ：型安全なAPI設計の利点
 * 
 * 1. コンパイル時チェック
 *    - APIレスポンスの構造を事前に検証
 *    - 型不一致によるランタイムエラーを防止
 *    - リファクタリング時の影響範囲を明確化
 * 
 * 2. 開発体験の向上
 *    - IDEでのオートコンプリート機能
 *    - APIドキュメントとしての役割
 *    - チーム開発での認識統一
 * 
 * 3. 保守性の向上
 *    - API仕様変更時の影響を型レベルで追跡
 *    - 段階的な型定義の改善が可能
 *    - テストコードでの型安全性も確保
 * 
 * 4. フロントエンド・バックエンド連携
 *    - 共通の型定義による整合性保証
 *    - APIクライアント実装の簡略化
 *    - モックデータ作成の効率化
 * 
 * 5. 移行戦略
 *    - 後方互換性エイリアスで段階的移行
 *    - @deprecated アノテーションで移行ガイド
 *    - 既存コードを壊さずに新しい型に移行可能
 */