/**
 * Vitestグローバルセットアップ
 * CI環境でのCrypto API対応
 */

export async function setup() {
  // Node.js環境でCrypto APIが利用できない場合のポリフィル
  if (!globalThis.crypto) {
    const { webcrypto } = await import('node:crypto')
    // TypeScript型エラー回避のため、WebCrypto APIをCrypto型として割り当て
    globalThis.crypto = webcrypto as Crypto
  }
  
  // getRandomValuesが利用できない場合のフォールバック
  if (!globalThis.crypto.getRandomValues) {
    const { randomBytes } = await import('node:crypto')
    globalThis.crypto.getRandomValues = <T extends ArrayBufferView | null>(array: T): T => {
      if (!array) throw new Error('Array is required')
      const bytes = randomBytes(array.byteLength)
      new Uint8Array(array.buffer).set(bytes)
      return array
    }
  }
}

export async function teardown() {
  // cleanup if needed
}