# Firebase認証実装メモ

## 概要

ポケモンライクな2DブラウザゲームプロジェクトにおけるFirebase認証の実装記録です。初学者向けの学習プロジェクトとして、シンプルなJWT検証を採用しています。

## 実装のポイント

### 1. シンプルJWT検証の採用

**背景**  
- `firebase-auth-cloudflare-workers`ライブラリはService Account設定が必要
- 学習目的のため、JWTの基本構造を理解できるシンプルな実装を選択

**実装内容** (`packages/backend/src/middleware/firebase-auth-new.ts`)
```typescript
// JWTトークンを分割してペイロードをデコード
const tokenParts = jwt.split('.');
const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));

// 基本的な検証
if (!payload.sub || !payload.aud) {
  throw new Error('Invalid JWT payload');
}
```

### 2. 重要な修正：JWTフィールド名

**問題**  
Firebase JWTでは`uid`フィールドは存在せず、`sub`フィールドを使用する必要がある

**修正前** (エラーの原因)
```typescript
if (!payload.uid || !payload.aud) {
  throw new Error('Invalid JWT payload');
}
```

**修正後** (正常動作)
```typescript
if (!payload.sub || !payload.aud) {
  throw new Error('Invalid JWT payload');
}
```

**Firebase JWTの標準フィールド**
- `sub`: Subject（ユーザーID）
- `aud`: Audience（プロジェクトID）
- `iss`: Issuer（発行者）
- `exp`: Expiration Time（有効期限）
- `iat`: Issued At（発行時刻）
- `auth_time`: 認証時刻
- `email`: メールアドレス
- `email_verified`: メール認証状態

### 3. 認証フローの実装

**フロントエンド** (`packages/frontend/src/context/AuthContext.tsx`)
```typescript
// Firebase Authentication SDKを使用
const auth = getAuth(app);
const user = await createUserWithEmailAndPassword(auth, email, password);
const idToken = await user.user.getIdToken();
```

**バックエンド** (`packages/backend/src/index.ts`)
```typescript
// 認証ミドルウェアの適用
const authResult = await firebaseAuthMiddleware(c.req, c.env);
if (!authResult.success) {
  return authResult.response;
}
// 認証成功時のユーザー情報取得
const { user } = authResult;
```

### 4. エラーハンドリング

**共通的なエラーパターン**
- Authorization ヘッダーなし → 401 Unauthorized
- Bearer形式でない → 401 Unauthorized  
- JWTフォーマット不正 → 401 Unauthorized
- プロジェクトID不一致 → 401 Unauthorized
- トークン有効期限切れ → 401 Unauthorized

**ユーザーフレンドリーなエラーメッセージ**
```typescript
if (errorMsg.includes('expired')) {
  errorMessage = 'トークンの有効期限が切れています。再度ログインしてください。';
} else if (errorMsg.includes('invalid audience')) {
  errorMessage = 'トークンが無効なプロジェクト用です。';
}
```

## 学習ポイント

### JWTの構造理解
1. **Header**: アルゴリズム情報
2. **Payload**: ユーザー情報とクレーム
3. **Signature**: トークンの署名（今回は簡略化）

### Web標準APIの活用
- `atob()`: Base64デコード
- `JSON.parse()`: JSONパース
- `Math.floor(Date.now() / 1000)`: Unix時刻取得

### TypeScript型安全性
```typescript
interface FirebaseAuthResult {
  success: true;
  user: {
    uid: string;
    email?: string;
    // ...
  };
}
```

## 本番環境への移行時の注意点

### セキュリティ強化が必要
1. **完全な署名検証**: 公開鍵による署名検証
2. **ユーザー無効化チェック**: Firebase Admin SDKでの状態確認
3. **カスタムクレーム対応**: 権限管理の実装

### 推奨ライブラリ
- `firebase-admin` SDK
- `firebase-auth-cloudflare-workers` (Service Account設定必要)

## 設定ファイル

### wrangler.jsonc
```json
{
  "main": "src/index.ts",  // 重要：index.minimal.tsではなくindex.ts
  "compatibility_date": "2023-08-14",
  "vars": {
    "ENVIRONMENT": "development",
    "FIREBASE_PROJECT_ID": "monster-game-2d-browser"
  }
}
```

### 環境変数 (.dev.vars)
```
FIREBASE_PROJECT_ID="monster-game-2d-browser"
PUBLIC_JWK_CACHE_KEY="firebase-public-jwks-local"
JWT_CACHE_TTL="1800"
LOG_LEVEL="debug"
```

## デバッグ方法

### サーバーログの確認
```bash
tail -f packages/backend/server.log
```

### APIテスト
```bash
curl -X POST http://localhost:8787/api/players \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerName": "テストプレイヤー"}'
```

### ブラウザDevToolsでIDトークン取得
```javascript
// Authコンテキストからトークン取得
const { currentUser } = useAuth();
const idToken = await currentUser.getIdToken();
console.log(idToken);
```

## トラブルシューティング

### よくある問題

1. **"Service account must be required"エラー**
   - ライブラリの設定問題
   - シンプル実装に切り替えで解決

2. **"Invalid JWT payload"エラー**
   - `payload.uid` → `payload.sub` に修正
   - Firebaseの標準フィールド名を使用

3. **"No such module node:fs"エラー**
   - Node.js専用モジュールの使用
   - Web標準APIに切り替え

4. **認証が動作しない**
   - `wrangler.jsonc`のmainが`index.minimal.ts`になっていないか確認
   - `index.ts`を使用して認証ミドルウェアを有効化

## 今後の拡張予定

1. **ロール機能**: カスタムクレームによる権限管理
2. **セッション管理**: リフレッシュトークンの実装
3. **多要素認証**: SMSやTOTPの統合
4. **ソーシャルログイン**: Google、GitHub等の連携

---

*このドキュメントは学習用プロジェクトの実装記録です。本番環境では適切なセキュリティ対策を実装してください。*