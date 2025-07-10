/**
 * バトル関連のZodスキーマ定義
 * 初学者向け: シンプルなバトルシステムのバリデーション
 */

import { z } from 'zod';

/**
 * バトル状態のスキーマ
 */
export const バトル状態スキーマ = z.enum(['battle', 'capture', 'victory', 'defeat', 'escape'], {
  errorMap: () => ({ message: 'バトル状態が無効です' }),
});

/**
 * バトルアクションのスキーマ
 */
export const バトルアクションスキーマ = z.enum(['たたかう', 'つかまえる', 'にげる'], {
  errorMap: () => ({ message: 'バトルアクションが無効です' }),
});

/**
 * 野生モンスタースキーマ
 */
export const 野生モンスタースキーマ = z.object({
  種族id: z.string().uuid('無効な種族IDです'),
  種族名: z.string().min(1, '種族名は必須です'),
  現在hp: z.number().min(0, 'HPは0以上である必要があります'),
  最大hp: z.number().min(1, '最大HPは1以上である必要があります'),
});

/**
 * バトル情報スキーマ
 */
export const バトル情報スキーマ = z.object({
  id: z.string().min(1, 'バトルIDは必須です'),
  プレイヤーid: z.string().uuid('無効なプレイヤーIDです'),
  野生モンスター: 野生モンスタースキーマ,
  状態: バトル状態スキーマ,
  開始日時: z.string().datetime('無効な日時形式です'),
});

/**
 * バトルアクション実行リクエストスキーマ
 */
export const バトルアクション実行スキーマ = z.object({
  アクション: バトルアクションスキーマ,
});

/**
 * バトルアクション結果スキーマ
 */
export const バトルアクション結果スキーマ = z.object({
  バトル情報: バトル情報スキーマ,
  メッセージ: z.string().min(1, 'メッセージは必須です'),
  捕獲モンスター: z.object({
    id: z.string().uuid('無効なモンスターIDです'),
    プレイヤーid: z.string().uuid('無効なプレイヤーIDです'),
    種族id: z.string().uuid('無効な種族IDです'),
    種族名: z.string().min(1, '種族名は必須です'),
    ニックネーム: z.string().nullable(),
    現在hp: z.number().min(0, 'HPは0以上である必要があります'),
    最大hp: z.number().min(1, '最大HPは1以上である必要があります'),
    捕獲日時: z.string().datetime('無効な日時形式です'),
  }).optional(),
});

// 型推論は各パッケージで必要に応じて実行