# Cloudflare + Firebase 設定ガイド

## 概要

Cloudflare WorkersとFirebase Authenticationを連携するための設定手順とポイントをまとめます。

## Firebase Console 設定

### 1. プロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `monster-game-2d-browser`
4. Google Analytics: 有効（推奨）

### 2. Authentication 設定
1. 左サイドバー「Authentication」をクリック
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「メール/パスワード」を有効化
   - ✅ メール/パスワード
   - ❌ メールリンク（パスワードなしでログイン）

### 3. Web アプリの追加
1. プロジェクト概要で「ウェブアプリを追加」
2. アプリ名: `Monster Game Frontend`
3. Firebase Hosting: チェックしない（今回はCloudflare Pagesを使用）
4. 設定情報をコピー

```javascript
// 取得した設定例
const firebaseConfig = {
  apiKey: "AIzaSyAbc123...",
  authDomain: "monster-game-2d-browser.firebaseapp.com",
  projectId: "monster-game-2d-browser",
  storageBucket: "monster-game-2d-browser.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

### 4. プロジェクト設定確認
- **プロジェクトID**: `monster-game-2d-browser`
- **ウェブAPI キー**: フロントエンドで使用
- **認証ドメイン**: `monster-game-2d-browser.firebaseapp.com`

## Cloudflare 設定

### 1. KV Namespace 作成

**Cloudflare ダッシュボードで作成**
```bash
# CLI で作成する場合
wrangler kv:namespace create \"AUTH_KV\"
wrangler kv:namespace create \"AUTH_KV\" --preview
```

**作成結果例**
```
✨ Success! Add the following to your configuration file in your kv_namespaces array:
{ binding = "AUTH_KV", preview_id = "preview_id_here", id = "production_id_here" }
```

### 2. D1 Database 作成

```bash
# データベース作成
wrangler d1 create monster-game-db

# 結果例
✅ Successfully created DB 'monster-game-db' in region APAC
Created your database using D1's new storage backend.

[[d1_databases]]
binding = "DB"
database_name = "monster-game-db"
database_id = "your-database-id-here"
```

### 3. wrangler.jsonc 設定

```json
{
  "name": "@monster-game/backend",
  "main": "src/index.ts",
  "compatibility_date": "2023-08-14",
  "node_compat": false,
  "vars": {
    "ENVIRONMENT": "development",
    "LOG_LEVEL": "debug",
    "FIREBASE_PROJECT_ID": "monster-game-2d-browser",
    "PUBLIC_JWK_CACHE_KEY": "firebase-public-jwks-local",
    "JWT_CACHE_TTL": "1800"
  },
  "kv_namespaces": [
    {
      "binding": "AUTH_KV",
      "id": "your-production-kv-id",
      "preview_id": "your-preview-kv-id"
    }
  ],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "monster-game-db",
      "database_id": "your-database-id"
    }
  ]
}
```

### 4. 環境変数設定

**packages/backend/.dev.vars**
```
FIREBASE_PROJECT_ID="monster-game-2d-browser"
PUBLIC_JWK_CACHE_KEY="firebase-public-jwks-local"
JWT_CACHE_TTL="1800"
LOG_LEVEL="debug"
```

**packages/frontend/.env.local**
```
VITE_FIREBASE_API_KEY="AIzaSyAbc123..."
VITE_FIREBASE_AUTH_DOMAIN="monster-game-2d-browser.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="monster-game-2d-browser"
VITE_FIREBASE_STORAGE_BUCKET="monster-game-2d-browser.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123def456"
```

## 重要な設定ポイント

### 1. wrangler.jsonc の main 設定

❌ **間違い**: 認証が動作しない
```json
{
  "main": "src/index.minimal.ts"
}
```

✅ **正解**: 認証が正常動作
```json
{
  "main": "src/index.ts"
}
```

### 2. CORS 設定

```typescript
// packages/backend/src/index.ts
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

### 3. D1 データベース初期化

```bash
# マイグレーション実行
wrangler d1 execute monster-game-db --local --file=./schema.sql

# データ投入
wrangler d1 execute monster-game-db --local --file=./seed.sql
```

## フロントエンド Firebase 設定

### 1. Firebase SDK 初期化

**packages/frontend/src/lib/firebase.ts**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

### 2. 認証コンテキスト

**packages/frontend/src/context/AuthContext.tsx**
```typescript
import { createContext, useContext } from 'react';
import { User } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

## API 呼び出し設定

### 1. バックエンド URL 設定

**development**
```
VITE_API_BASE_URL="http://localhost:8787"
```

**production**
```
VITE_API_BASE_URL="https://your-worker.your-subdomain.workers.dev"
```

### 2. 認証ヘッダー付きリクエスト

```typescript
// packages/frontend/src/hooks/usePlayer.ts
const createPlayer = async (playerName: string) => {
  const idToken = await currentUser?.getIdToken();
  
  const response = await fetch(`${API_BASE_URL}/api/players`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ playerName })
  });
  
  return response.json();
};
```

## デプロイ設定

### 1. Cloudflare Workers デプロイ

```bash
# バックエンドデプロイ
cd packages/backend
wrangler deploy

# 本番環境の環境変数設定
wrangler secret put FIREBASE_PROJECT_ID
wrangler secret put PUBLIC_JWK_CACHE_KEY
```

### 2. Cloudflare Pages デプロイ

```bash
# フロントエンドビルド
cd packages/frontend
pnpm build

# Pages にデプロイ（手動 or GitHub連携）
wrangler pages deploy dist
```

### 3. 本番環境変数

**Cloudflare Pages 環境変数**
```
VITE_FIREBASE_API_KEY=AIzaSyAbc123...
VITE_FIREBASE_AUTH_DOMAIN=monster-game-2d-browser.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=monster-game-2d-browser
VITE_API_BASE_URL=https://backend.your-domain.workers.dev
```

## セキュリティ考慮事項

### 1. 本番環境での強化

- **Firebase Rules**: Firestoreアクセス制御
- **CORS制限**: 本番ドメインのみ許可
- **JWT署名検証**: 完全な検証実装
- **Rate Limiting**: API呼び出し制限

### 2. 秘密情報の管理

```bash
# 機密情報は wrangler secret で管理
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put FIREBASE_CLIENT_EMAIL
```

### 3. Firebase Security Rules

```javascript
// Firestore Rules（将来の拡張用）
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{playerId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.firebaseUid;
    }
  }
}
```

## トラブルシューティング

### よくある問題

1. **CORS エラー**
   - フロントエンドのURLがCORS設定に含まれているか確認
   - Optionsリクエストが正常に処理されているか確認

2. **認証トークンエラー**
   - プロジェクトIDの一致確認
   - トークンの有効期限確認
   - Authorization ヘッダーのフォーマット確認

3. **KV/D1 アクセスエラー**
   - wrangler.jsonc のバインディング設定確認
   - 本番環境でのリソースID確認

4. **ビルドエラー**
   - Node.js互換性の問題
   - 環境変数の設定漏れ

### ログ確認方法

```bash
# Workers ログ確認
wrangler tail

# ローカル開発ログ
tail -f packages/backend/server.log
tail -f packages/frontend/frontend.log
```

---

*この設定ガイドは学習用プロジェクトに基づいています。本番環境では追加のセキュリティ対策が必要です。*