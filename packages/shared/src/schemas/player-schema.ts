/**
 * プレイヤー関連のZodスキーマ定義
 * 初学者向け: 入力値検証の実装例
 */

import { z } from 'zod';

/**
 * プレイヤー名のバリデーションスキーマ（Player name validation schema）
 * @description プレイヤー名の入力値検証ルール（3-20文字、特定文字のみ許可）
 * @example
 * const result = playerNameSchema.safeParse("太郎");
 * if (result.success) {
 *   console.log("有効なプレイヤー名:", result.data);
 * }
 */
export const playerNameSchema = z
  .string({
    required_error: 'プレイヤー名は必須です',
    invalid_type_error: 'プレイヤー名は文字列である必要があります',
  })
  .min(3, 'プレイヤー名は3文字以上で入力してください')
  .max(20, 'プレイヤー名は20文字以下で入力してください')
  .regex(/^[a-zA-Z0-9ひらがなカタカナ漢字ー \s]+$/, '使用できない文字が含まれています');

/**
 * プレイヤー作成時のリクエストスキーマ（Player creation request schema）
 * @description プレイヤー作成API呼び出し時のリクエストボディ検証
 * @example
 * const result = playerCreationSchema.safeParse({ name: "太郎" });
 */
export const playerCreationSchema = z.object({
  name: playerNameSchema,
});

/**
 * プレイヤーレスポンススキーマ（Player response schema）
 * @description プレイヤー情報のレスポンス検証スキーマ
 * @example
 * const result = playerSchema.safeParse({
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "太郎",
 *   createdAt: "2025-07-10T00:00:00Z"
 * });
 */
export const playerSchema = z.object({
  id: z.string().uuid('無効なプレイヤーIDです'),
  name: playerNameSchema,
  createdAt: z.string().datetime('無効な日時形式です'),
});

/**
 * プレイヤー作成レスポンススキーマ（Player creation response schema）
 * @description プレイヤー作成API成功時のレスポンス検証
 * @example
 * const result = playerCreationResponseSchema.safeParse({
 *   player: { id: "...", name: "太郎", createdAt: "..." },
 *   initialMonsterId: "550e8400-e29b-41d4-a716-446655440001"
 * });
 */
export const playerCreationResponseSchema = z.object({
  player: playerSchema,
  initialMonsterId: z.string().uuid('無効なモンスターIDです'),
});

// 後方互換性のためのエイリアス（Backward compatibility aliases）
// 初学者向け：既存コードとの互換性を保ちながら段階的に移行するためのエイリアス

/** @deprecated Use playerNameSchema instead. プレイヤー名スキーマ → playerNameSchema への移行用エイリアス */
export const プレイヤー名スキーマ = playerNameSchema;

/** @deprecated Use playerCreationSchema instead. プレイヤー作成スキーマ → playerCreationSchema への移行用エイリアス */
export const プレイヤー作成スキーマ = playerCreationSchema;

/** @deprecated Use playerSchema instead. プレイヤースキーマ → playerSchema への移行用エイリアス */
export const プレイヤースキーマ = playerSchema;

/** @deprecated Use playerCreationResponseSchema instead. プレイヤー作成レスポンススキーマ → playerCreationResponseSchema への移行用エイリアス */
export const プレイヤー作成レスポンススキーマ = playerCreationResponseSchema;

// 型推論は各パッケージで必要に応じて実行
// Type inference can be performed as needed in each package