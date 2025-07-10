/**
 * ID生成関連のユーティリティ関数
 * 初学者向け: UUIDとランダムID生成の実装例
 */

/**
 * UUIDv4を生成する関数（Generate UUIDv4）
 * @description 一意なIDを生成するための標準的な手法を実装
 * @returns 標準UUIDv4形式の文字列（例：550e8400-e29b-41d4-a716-446655440000）
 * @throws {Error} Crypto APIが利用できない場合
 * 
 * @example
 * const id = generateUuid();
 * console.log(id); // "550e8400-e29b-41d4-a716-446655440000"
 * 
 * 初学者向け解説:
 * - 一意なIDを生成するための標準的な手法
 * - バックエンドではプレイヤーIDやモンスターIDとして使用
 * - Node.js環境とブラウザ環境の両方で動作
 * 
 * 環境対応:
 * - Node.js環境: crypto.randomUUID() を使用
 * - ブラウザ環境: Web Crypto API を使用
 */
export function generateUuid(): string {
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

  const byteArray = new Uint8Array(16);
  crypto.getRandomValues(byteArray);

  // UUIDv4の形式に変換
  byteArray[6] = (byteArray[6]! & 0x0f) | 0x40; // version 4
  byteArray[8] = (byteArray[8]! & 0x3f) | 0x80; // variant bits

  const hexString = Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  return `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20, 32)}`;
}

/**
 * 短いランダムIDを生成する関数（Generate random ID）
 * @description バトルIDなど一時的なIDに使用する英数字のランダム文字列を生成
 * @param length 生成するIDの文字数（デフォルト: 8文字）
 * @returns 指定された長さの英数字ランダム文字列（例："A3b9Kp2x"）
 * 
 * @example
 * const battleId = generateRandomId(8);
 * console.log(battleId); // "A3b9Kp2x"
 * 
 * const shortId = generateRandomId(4);
 * console.log(shortId); // "Xb3K"
 * 
 * 初学者向けメモ：
 * - UUID程の厳密性が不要な場合に使用（バトルID、セッションIDなど）
 * - セキュアなランダム値生成を優先し、fallbackでMath.randomを使用
 * - 環境に応じて最適な乱数生成方法を選択
 * - 文字セットは大文字・小文字・数字（62文字）
 */
export function generateRandomId(length: number = 8): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // セキュアな乱数生成を試行
  try {
    // Node.js環境での対応
    if (typeof globalThis.process !== 'undefined' && globalThis.process.versions?.node) {
      const crypto = eval('require')('crypto');
      const buffer = crypto.randomBytes(length);
      for (let i = 0; i < length; i++) {
        result += charset.charAt(buffer[i]! % charset.length);
      }
      return result;
    }

    // ブラウザ環境での対応
    const crypto = globalThis.crypto;
    if (crypto && crypto.getRandomValues) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += charset.charAt(array[i]! % charset.length);
      }
      return result;
    }
  } catch (error) {
    // セキュアな乱数生成に失敗した場合はfallbackを使用
  }

  // fallback: Math.randomを使用（セキュリティが重要でない場合）
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return result;
}

// 後方互換性のためのエイリアス（Backward compatibility aliases）
// 初学者向け：既存コードとの互換性を保ちながら段階的に移行するためのエイリアス

/**
 * @deprecated Use generateUuid instead. uuid生成 → generateUuid への移行用エイリアス
 * @description 元の関数名を日本語で残し、段階的に英語関数名に移行
 */
export const uuid生成 = generateUuid;

/**
 * @deprecated Use generateRandomId instead. ランダムid生成 → generateRandomId への移行用エイリアス
 * @description 元の関数名を日本語で残し、段階的に英語関数名に移行
 */
export const ランダムid生成 = generateRandomId;