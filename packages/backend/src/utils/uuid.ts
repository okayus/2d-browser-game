/**
 * Workers環境対応のUUID生成ユーティリティ
 * 
 * 初学者向けメモ：
 * - Cloudflare Workers環境ではWeb Crypto APIを使用
 * - Node.jsのcryptoモジュールは使用不可
 */

/**
 * UUID v4を生成
 * Workers環境でも動作するよう、Web Crypto APIを使用
 */
export function generateUuid(): string {
  // Workers環境ではglobalThis.crypto（Web Crypto API）を使用
  const crypto = globalThis.crypto;
  if (!crypto || !crypto.getRandomValues) {
    throw new Error('Crypto APIが利用できません');
  }

  const byteArray = new Uint8Array(16);
  crypto.getRandomValues(byteArray);

  // UUID v4の設定
  byteArray[6] = (byteArray[6] & 0x0f) | 0x40; // version 4
  byteArray[8] = (byteArray[8] & 0x3f) | 0x80; // variant bits

  const hexString = Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  return `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20, 32)}`;
}

/**
 * ランダムなIDを生成
 * 指定した長さの英数字文字列を生成
 */
export function generateRandomId(length = 8): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const crypto = globalThis.crypto;
  
  if (crypto && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    return Array.from(array)
      .map(byte => charset.charAt(byte % charset.length))
      .join('');
  }

  // fallback（通常は実行されない）
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

// 日本語エイリアス
export const uuid生成 = generateUuid;
export const ランダムid生成 = generateRandomId;