/**
 * テスト環境のセットアップファイル
 * 各テストファイルで共通的に使用される設定
 */

// テスト環境でのCrypto API対応
if (!globalThis.crypto) {
  // Node.js 18以降のWebCrypto APIを使用
  const { webcrypto } = require('node:crypto')
  globalThis.crypto = webcrypto as Crypto
}

// テスト用のグローバル変数やモックの設定
export {}