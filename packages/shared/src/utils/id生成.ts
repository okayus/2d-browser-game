/**
 * ID生成関連のユーティリティ関数
 * 初学者向け: UUIDとランダムID生成の実装例
 */

/**
 * UUIDv4を生成する関数
 * 初学者向け解説: 一意なIDを生成するための標準的な手法
 * 
 * 環境対応:
 * - Node.js環境: crypto.randomUUID() を使用
 * - ブラウザ環境: Web Crypto API を使用
 */
export function uuid生成(): string {
  // Node.js環境での対応（CI環境やサーバーサイド）
  if (typeof globalThis.process !== 'undefined' && globalThis.process.versions?.node) {
    try {
      // Node.js 14.17.0+ の crypto.randomUUID() を使用
      const crypto = eval('require')('crypto');
      if (crypto.randomUUID) {
        return crypto.randomUUID();
      }
    } catch (error) {
      // requireが利用できない場合はfallbackを実行
    }
  }

  // ブラウザ環境またはWeb Crypto APIが利用可能な場合
  const crypto = globalThis.crypto as Crypto | undefined;
  if (!crypto || !crypto.getRandomValues) {
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
 * 
 * 初学者向けメモ：
 * - セキュアなランダム値生成を優先し、fallbackでMath.randomを使用
 * - 環境に応じて最適な乱数生成方法を選択
 */
export function ランダムid生成(長さ: number = 8): string {
  const 文字セット = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let 結果 = '';
  
  // セキュアな乱数生成を試行
  try {
    // Node.js環境での対応
    if (typeof globalThis.process !== 'undefined' && globalThis.process.versions?.node) {
      const crypto = eval('require')('crypto');
      const buffer = crypto.randomBytes(長さ);
      for (let i = 0; i < 長さ; i++) {
        結果 += 文字セット.charAt(buffer[i]! % 文字セット.length);
      }
      return 結果;
    }

    // ブラウザ環境での対応
    const crypto = globalThis.crypto;
    if (crypto && crypto.getRandomValues) {
      const 配列 = new Uint8Array(長さ);
      crypto.getRandomValues(配列);
      for (let i = 0; i < 長さ; i++) {
        結果 += 文字セット.charAt(配列[i]! % 文字セット.length);
      }
      return 結果;
    }
  } catch (error) {
    // セキュアな乱数生成に失敗した場合はfallbackを使用
  }

  // fallback: Math.randomを使用（セキュリティが重要でない場合）
  for (let i = 0; i < 長さ; i++) {
    結果 += 文字セット.charAt(Math.floor(Math.random() * 文字セット.length));
  }
  
  return 結果;
}