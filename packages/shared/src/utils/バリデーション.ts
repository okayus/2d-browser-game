/**
 * バリデーション関連のユーティリティ関数
 * 初学者向け: 型安全なバリデーション処理の実装例
 */

import { z } from 'zod';

/**
 * Zodスキーマによるバリデーション結果
 */
export interface バリデーション結果<T> {
  /** バリデーション成功フラグ */
  成功: boolean;
  /** バリデーション済みデータ（成功時のみ） */
  データ?: T;
  /** エラーメッセージ（失敗時のみ） */
  エラー?: string;
}

/**
 * Zodスキーマを使用したバリデーション実行
 * 初学者向け解説: エラーハンドリング付きのバリデーション処理
 */
export function バリデーション実行<T>(
  スキーマ: z.ZodSchema<T>,
  データ: unknown
): バリデーション結果<T> {
  try {
    const バリデーション済みデータ = スキーマ.parse(データ);
    return {
      成功: true,
      データ: バリデーション済みデータ,
    };
  } catch (エラー) {
    if (エラー instanceof z.ZodError) {
      // Zodエラーを日本語でわかりやすく整形
      const エラーメッセージ = エラー.errors
        .map(問題 => `${問題.path.join('.')}: ${問題.message}`)
        .join(', ');
      
      return {
        成功: false,
        エラー: エラーメッセージ,
      };
    }
    
    return {
      成功: false,
      エラー: 'バリデーションエラーが発生しました',
    };
  }
}

/**
 * 必須フィールドの存在チェック
 * プリミティブなバリデーション例
 */
export function 必須チェック(値: unknown, フィールド名: string): boolean {
  if (値 === null || 値 === undefined || 値 === '') {
    throw new Error(`${フィールド名}は必須です`);
  }
  return true;
}

/**
 * 文字列長のチェック
 */
export function 文字列長チェック(
  値: string,
  最小長: number,
  最大長: number,
  フィールド名: string
): boolean {
  if (値.length < 最小長) {
    throw new Error(`${フィールド名}は${最小長}文字以上で入力してください`);
  }
  if (値.length > 最大長) {
    throw new Error(`${フィールド名}は${最大長}文字以下で入力してください`);
  }
  return true;
}

/**
 * 数値範囲のチェック
 */
export function 数値範囲チェック(
  値: number,
  最小値: number,
  最大値: number,
  フィールド名: string
): boolean {
  if (値 < 最小値) {
    throw new Error(`${フィールド名}は${最小値}以上の値を入力してください`);
  }
  if (値 > 最大値) {
    throw new Error(`${フィールド名}は${最大値}以下の値を入力してください`);
  }
  return true;
}