/**
 * モンスター関連のZodスキーマ定義
 * 初学者向け: CRUD操作のバリデーション例
 */

import { z } from 'zod';

/**
 * モンスターレア度のスキーマ
 */
export const モンスターレア度スキーマ = z.enum(['common', 'rare', 'epic'], {
  errorMap: () => ({ message: 'レア度はcommon, rare, epicのいずれかである必要があります' }),
});

/**
 * ニックネームのバリデーションスキーマ
 * 1文字以上20文字以下、特殊文字は制限
 */
export const ニックネームスキーマ = z
  .string({
    required_error: 'ニックネームは必須です',
    invalid_type_error: 'ニックネームは文字列である必要があります',
  })
  .min(1, 'ニックネームは1文字以上で入力してください')
  .max(20, 'ニックネームは20文字以下で入力してください')
  .regex(/^[a-zA-Z0-9ひらがなカタカナ漢字ー　\s]+$/, '使用できない文字が含まれています');

/**
 * モンスター種族スキーマ
 */
export const モンスター種族スキーマ = z.object({
  id: z.string().uuid('無効な種族IDです'),
  名前: z.string().min(1, '種族名は必須です'),
  基本hp: z.number().min(1, 'HPは1以上である必要があります'),
  レア度: モンスターレア度スキーマ,
});

/**
 * 所持モンスタースキーマ
 */
export const 所持モンスタースキーマ = z.object({
  id: z.string().uuid('無効なモンスターIDです'),
  プレイヤーid: z.string().uuid('無効なプレイヤーIDです'),
  種族id: z.string().uuid('無効な種族IDです'),
  種族名: z.string().min(1, '種族名は必須です'),
  ニックネーム: z.string().nullable(),
  現在hp: z.number().min(0, 'HPは0以上である必要があります'),
  最大hp: z.number().min(1, '最大HPは1以上である必要があります'),
  捕獲日時: z.string().datetime('無効な日時形式です'),
});

/**
 * モンスター獲得リクエストスキーマ
 */
export const モンスター獲得スキーマ = z.object({
  種族id: z.string().uuid('無効な種族IDです'),
});

/**
 * モンスター更新リクエストスキーマ
 */
export const モンスター更新スキーマ = z.object({
  ニックネーム: ニックネームスキーマ,
});

/**
 * モンスター一覧レスポンススキーマ
 */
export const モンスター一覧レスポンススキーマ = z.object({
  モンスター一覧: z.array(所持モンスタースキーマ),
  合計数: z.number().min(0, '合計数は0以上である必要があります'),
});

// 型推論のためのtype alias
export type モンスター種族レスポンス = z.infer<typeof モンスター種族スキーマ>;
export type 所持モンスターレスポンス = z.infer<typeof 所持モンスタースキーマ>;
export type モンスター獲得リクエスト = z.infer<typeof モンスター獲得スキーマ>;
export type モンスター更新リクエスト = z.infer<typeof モンスター更新スキーマ>;
export type モンスター一覧レスポンス = z.infer<typeof モンスター一覧レスポンススキーマ>;