# 認証認可機能への移行ガイド

このドキュメントでは、現在のSessionStorage直接使用から抽象化されたSessionManagerを経由した実装への移行、および将来のFirebase Auth等の認証認可機能導入について説明します。

## 実装完了事項

### 1. SessionManager抽象化レイヤー ✅
**ファイル**: `/packages/frontend/src/lib/sessionManager.ts`

- **SessionManagerインターフェース**: 統一的なセッション管理API
- **LocalSessionManager**: 現在のSessionStorage使用実装
- **FirebaseSessionManager**: Firebase Auth対応の骨格実装
- **createSessionManager()**: 環境変数による実装選択

### 2. useAuth認証フック ✅
**ファイル**: `/packages/frontend/src/hooks/useAuth.ts`

- **AuthProvider**: React Contextによる認証状態の全体共有
- **useAuth**: 認証状態とアクションへのアクセス
- **useRequireAuth**: 認証が必要なページ用ガード
- **認証状態管理**: ログイン・ログアウト・状態更新の統一API

### 3. usePlayerフック改修 ✅
**ファイル**: `/packages/frontend/src/hooks/usePlayer.ts`

- **SessionManager統合**: 直接的なSessionStorage操作を排除
- **インターフェース維持**: 既存コードとの互換性確保
- **将来拡張対応**: Firebase Auth等への対応準備

### 4. 設定ベース認証方式切り替え ✅
**ファイル**: `/packages/frontend/src/config/auth.ts`

- **環境変数での切り替え**: VITE_AUTH_TYPE設定
- **認証プロバイダー設定**: Firebase, Auth0, Cognito対応
- **設定検証**: 必要な環境変数の確認機能

## 使用方法

### 現在の実装（変更不要）

既存のusePlayerフックの使用方法は変更ありません：

```typescript
// コンポーネントでの使用例
import { usePlayer } from '../hooks/usePlayer'

function MyComponent() {
  const { player, createPlayer, clearSession, isLoading, error } = usePlayer()
  
  // 既存のコードはそのまま動作
  if (isLoading) return <div>読み込み中...</div>
  if (error) return <div>エラー: {error}</div>
  if (!player) return <div>プレイヤーが見つかりません</div>
  
  return <div>こんにちは、{player.name}さん！</div>
}
```

### 将来の認証機能有効化

#### Step 1: 環境変数設定

```bash
# .env.local (開発環境)
VITE_AUTH_TYPE=local

# .env.production (本番環境でFirebase Auth使用)
VITE_AUTH_TYPE=firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

#### Step 2: AuthProviderの統合

```typescript
// main.tsx または App.tsx
import { AuthProvider } from './hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 既存のルート */}
      </Routes>
    </AuthProvider>
  )
}
```

#### Step 3: 認証状態の活用

```typescript
// 認証状態を使用するコンポーネント
import { useAuth } from '../hooks/useAuth'

function AuthenticatedComponent() {
  const { isAuthenticated, login, logout, isLoading } = useAuth()
  
  if (isLoading) return <div>認証確認中...</div>
  
  if (!isAuthenticated) {
    return (
      <button onClick={() => login('player-id')}>
        ログイン
      </button>
    )
  }
  
  return (
    <div>
      <span>ログイン済み</span>
      <button onClick={logout}>ログアウト</button>
    </div>
  )
}
```

## 認証方式別の実装

### Firebase Authentication

```typescript
// FirebaseSessionManagerの完全実装例
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

export class FirebaseSessionManager implements SessionManager {
  private auth: Auth
  private currentUser: User | null = null
  
  constructor(config: FirebaseConfig) {
    const app = initializeApp(config)
    this.auth = getAuth(app)
    
    // 認証状態の監視
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user
    })
  }
  
  getCurrentPlayerId(): string | null {
    return this.currentUser?.uid || null
  }
  
  async setCurrentPlayerId(playerId: string): Promise<void> {
    // Firebase Authではユーザー情報をカスタムクレームで管理
    // または Firestore で uid と playerId を関連付け
  }
  
  async clearSession(): Promise<void> {
    await signOut(this.auth)
  }
  
  isSessionValid(): boolean {
    return this.currentUser !== null
  }
  
  async getAuthToken(): Promise<string | null> {
    if (!this.currentUser) return null
    return await this.currentUser.getIdToken()
  }
}
```

### Auth0

```typescript
// Auth0SessionManagerの実装例
import { createAuth0Client, Auth0Client } from '@auth0/auth0-spa-js'

export class Auth0SessionManager implements SessionManager {
  private auth0Client: Auth0Client
  
  async init(config: Auth0Config) {
    this.auth0Client = await createAuth0Client({
      domain: config.domain,
      clientId: config.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: config.audience
      }
    })
  }
  
  async getCurrentPlayerId(): Promise<string | null> {
    const user = await this.auth0Client.getUser()
    return user?.sub || null
  }
  
  async getAuthToken(): Promise<string | null> {
    return await this.auth0Client.getTokenSilently()
  }
}
```

## 段階的移行プラン

### Phase 1: 基盤整備 ✅ **完了**
- SessionManager抽象化レイヤー実装
- useAuth フック作成
- usePlayer フック改修
- 設定ベース切り替え機能

### Phase 2: 統合テスト
- 既存機能の動作確認
- SessionManager経由での動作テスト
- 環境変数切り替えテスト

### Phase 3: Firebase Auth実装
- FirebaseSessionManagerの完全実装
- Firebase SDK統合
- 認証フローの実装
- ユーザー登録・ログイン画面

### Phase 4: 本番導入
- 認証設定の最適化
- セキュリティテスト
- パフォーマンステスト
- 段階的ロールアウト

## セキュリティ考慮事項

### 現在の実装
- プレイヤーIDのみクライアント保存
- サーバーサイドでプレイヤー情報検証
- セッション有効期限なし

### 認証認可導入後
- JWTトークンによる認証
- トークン有効期限管理
- リフレッシュトークンローテーション
- HTTPS必須
- CSRF保護

## API統合

### 現在のAPI呼び出し
```typescript
// 認証ヘッダーなし
const response = await fetch('/api/players', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: playerName })
})
```

### 認証認可導入後
```typescript
// 認証トークン付き
const token = sessionManager.getAuthToken()
const response = await fetch('/api/players', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ name: playerName })
})
```

## テスト戦略

### 単体テスト
```typescript
// SessionManagerのモック化
const mockSessionManager = {
  getCurrentPlayerId: jest.fn(() => 'test-player-id'),
  setCurrentPlayerId: jest.fn(),
  clearSession: jest.fn(),
  isSessionValid: jest.fn(() => true),
  getAuthToken: jest.fn(() => 'mock-token')
}

// テストでのモック使用
jest.mock('../lib/sessionManager', () => ({
  sessionManager: mockSessionManager
}))
```

### 統合テスト
```typescript
// 認証フローのE2Eテスト
describe('Authentication Flow', () => {
  it('should login and access protected routes', async () => {
    // ログイン実行
    await page.click('[data-testid="login-button"]')
    
    // 認証後のリダイレクト確認
    await expect(page).toHaveURL('/map')
    
    // 認証が必要なAPIの動作確認
    const response = await page.waitForResponse('/api/players')
    expect(response.headers()['authorization']).toBeDefined()
  })
})
```

## パフォーマンス最適化

### 認証状態キャッシュ
- React Contextでの状態共有
- useCallbackによる不要な再レンダリング防止
- メモ化による計算結果キャッシュ

### トークン管理
- 自動リフレッシュ機能
- バックグラウンドでの更新
- 有効期限前の事前更新

### ネットワーク最適化
- APIリクエストの最小化
- バッチリクエスト対応
- オフライン対応（将来）

## 監視・ログ

### 認証イベントの記録
- ログイン・ログアウト
- 認証エラー
- トークン更新

### メトリクス収集
- 認証成功率
- セッション継続時間
- エラー発生頻度

---

**作成日**: 2025-07-12  
**対象バージョン**: packages/frontend (SessionManager統合版)  
**関連ファイル**: 
- `packages/frontend/src/lib/sessionManager.ts`
- `packages/frontend/src/hooks/useAuth.ts`
- `packages/frontend/src/hooks/usePlayer.ts` (改修版)
- `packages/frontend/src/config/auth.ts`