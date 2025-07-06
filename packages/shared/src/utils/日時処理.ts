/**
 * 日時処理関連のユーティリティ関数
 * 初学者向け: ISO8601形式での日時管理
 */

/**
 * 現在の日時をISO8601形式で取得
 * 初学者向け解説: データベースに保存する際の標準的な日時形式
 */
export function 現在日時取得(): string {
  return new Date().toISOString();
}

/**
 * 日時文字列をDate型に変換
 * エラーハンドリング付き
 */
export function 日時文字列をDate変換(日時文字列: string): Date {
  const 日付 = new Date(日時文字列);
  
  if (isNaN(日付.getTime())) {
    throw new Error(`無効な日時形式です: ${日時文字列}`);
  }
  
  return 日付;
}

/**
 * 日時を日本語形式でフォーマット
 * 表示用の日時文字列生成
 */
export function 日時を日本語でフォーマット(日時: Date | string): string {
  const 日付 = typeof 日時 === 'string' ? 日時文字列をDate変換(日時) : 日時;
  
  return 日付.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 相対的な日時を表示（例：「3分前」「2時間前」）
 * ユーザーフレンドリーな表示用
 */
export function 相対日時表示(日時: Date | string): string {
  const 対象日時 = typeof 日時 === 'string' ? 日時文字列をDate変換(日時) : 日時;
  const 現在 = new Date();
  const 差分ミリ秒 = 現在.getTime() - 対象日時.getTime();
  const 差分秒 = Math.floor(差分ミリ秒 / 1000);
  const 差分分 = Math.floor(差分秒 / 60);
  const 差分時間 = Math.floor(差分分 / 60);
  const 差分日 = Math.floor(差分時間 / 24);

  if (差分秒 < 60) {
    return '今';
  } else if (差分分 < 60) {
    return `${差分分}分前`;
  } else if (差分時間 < 24) {
    return `${差分時間}時間前`;
  } else if (差分日 < 30) {
    return `${差分日}日前`;
  } else {
    return 日時を日本語でフォーマット(対象日時);
  }
}