/**
 * API レスポンス型定義
 * 共有パッケージから型をインポートして型安全性を確保
 */

import type {
  ApiResponse,
  Player,
  PlayerCreationApiResponse,
  OwnedMonster,
  HttpResponseType,
  AuthUser,
  AuthState,
  AuthTokens,
} from '@monster-game/shared';

// フロントエンド用の再エクスポート
export type {
  ApiResponse,
  Player,
  PlayerCreationApiResponse,
  OwnedMonster,
  HttpResponseType,
  AuthUser,
  AuthState,
  AuthTokens,
};

// 後方互換性のためのエイリアス
export type APIResponse<T> = ApiResponse<T>;
export type PlayerData = Player & {
  initialMonsterId?: string;
};
export type MonsterData = OwnedMonster;

// レスポンス型のエイリアス
export type PlayerCreationResponse = PlayerCreationApiResponse;
export type PlayerResponse = ApiResponse<Player>;
export type MonsterListResponse = HttpResponseType<OwnedMonster[]>;
export type MonsterUpdateResponse = HttpResponseType<{ id: string; nickname: string }>;
export type MonsterDeleteResponse = HttpResponseType<{ message: string }>;