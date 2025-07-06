/**
 * ID生成関連のユーティリティ関数
 * 初学者向け: UUIDとランダムID生成の実装例
 */

/**
 * UUIDv4を生成する関数
 * 初学者向け解説: 一意なIDを生成するための標準的な手法
 */
export function uuid生成(): string {
  // Web Crypto APIを使用してセキュアなランダム値を生成
  const crypto = globalThis.crypto as Crypto | undefined;
  if (!crypto) {
    throw new Error('Crypto APIが利用できません');
  }

  const 配列 = new Uint8Array(16);
  crypto.getRandomValues(配列);

  // UUIDv4の形式に変換
  配列[6] = (配列[6]! & 0x0f) | 0x40; // version 4
  配列[8] = (配列[8]! & 0x3f) | 0x80; // variant bits

  const hex文字列 = Array.from(配列)
    .map(バイト => バイト.toString(16).padStart(2, '0'))
    .join('');

  return `${hex文字列.slice(0, 8)}-${hex文字列.slice(8, 12)}-${hex文字列.slice(12, 16)}-${hex文字列.slice(16, 20)}-${hex文字列.slice(20, 32)}`;
}

/**
 * 短いランダムIDを生成する関数
 * 用途: バトルIDなど一時的なIDに使用
 */
export function ランダムid生成(長さ: number = 8): string {
  const 文字セット = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let 結果 = '';
  
  for (let i = 0; i < 長さ; i++) {
    結果 += 文字セット.charAt(Math.floor(Math.random() * 文字セット.length));
  }
  
  return 結果;
}