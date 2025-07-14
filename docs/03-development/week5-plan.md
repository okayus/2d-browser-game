# Week 5: Firebase本格設定とバックエンド統合

## 📋 概要

Week 5では、これまでに実装したFirebase認証UIを実際のFirebaseプロジェクトと連携させ、完全な認証システムを構築します。また、バックエンドAPIとの統合を完成させて、学習用プロジェクトとして実用的なシステムを実現します。

## 🎯 実装目標

- [ ] Firebase Consoleでの実際のプロジェクト設定
- [ ] 環境変数の更新と設定完了
- [ ] 実際のFirebase認証の動作確認
- [ ] バックエンドAPIとの完全統合
- [ ] D1データベースでのデータ永続化
- [ ] エンドツーエンドテストの実行

## 🔧 実装計画

### Phase 1: Firebase設定の実装

#### 1.1 Firebase Console設定
- [ ] **新しいFirebaseプロジェクト作成**
  - プロジェクト名: `monster-game-2d-browser`
  - Firebase Console: https://console.firebase.google.com/

- [ ] **Authentication設定**
  - Email/Password認証の有効化
  - Google認証の有効化（オプション）
  - 承認済みドメインの設定

- [ ] **プロジェクト設定の取得**
  - API Key
  - Auth Domain
  - Project ID
  - その他の設定値

#### 1.2 環境変数の更新

**フロントエンド（.env.local）**
```env
# 実際のFirebase設定値に更新
VITE_FIREBASE_API_KEY="実際のAPIキー"
VITE_FIREBASE_AUTH_DOMAIN="monster-game-2d-browser.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="monster-game-2d-browser"
VITE_FIREBASE_STORAGE_BUCKET="monster-game-2d-browser.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="実際のSender ID"
VITE_FIREBASE_APP_ID="実際のApp ID"
```

**バックエンド（.dev.vars）**
```env
# Firebase認証設定
FIREBASE_PROJECT_ID="monster-game-2d-browser"
# その他の必要な設定
```

#### 1.3 認証テスト
- [ ] **新規登録テスト**
  - メールアドレス/パスワードでの登録
  - Firebase Consoleでユーザー作成確認

- [ ] **ログインテスト**
  - 登録したアカウントでのログイン
  - JWTトークンの取得確認

- [ ] **ログアウトテスト**
  - 正常なログアウト処理
  - 認証状態のクリア確認

### Phase 2: バックエンドAPI統合強化

#### 2.1 API統合の完成

**プレイヤー作成API統合**
- [ ] `createPlayer`フックの完全実装
- [ ] Firebase UIDとプレイヤーIDの関連付け
- [ ] エラーハンドリングの強化

**モンスターAPI統合**
- [ ] `useMonsters`フックの完全実装
- [ ] 認証ヘッダーでのAPI呼び出し
- [ ] データの正しい変換と表示

**認証ヘッダーの実装**
```typescript
// api.ts の強化
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};
```

#### 2.2 D1データベース設定

**データベースの作成**
- [ ] Cloudflare D1データベースの作成
- [ ] wrangler.jsonc での設定

**マイグレーション実行**
- [ ] 既存のマイグレーションファイルの確認
- [ ] D1データベースへのマイグレーション実行
- [ ] テーブル作成の確認

**データベース接続テスト**
- [ ] バックエンドからD1への接続確認
- [ ] 基本的なCRUD操作のテスト

### Phase 3: エンドツーエンドテスト

#### 3.1 完全フロー検証

**新規ユーザーフロー**
1. [ ] 新規登録（Firebase）
2. [ ] プレイヤー作成（D1データベース）
3. [ ] パートナーモンスター選択
4. [ ] ゲーム開始（マップ画面遷移）
5. [ ] データの永続化確認

**既存ユーザーフロー**
1. [ ] ログイン（Firebase）
2. [ ] 既存プレイヤーデータの読み込み
3. [ ] ゲーム続行
4. [ ] データの整合性確認

#### 3.2 エラーハンドリング検証

**認証エラー**
- [ ] 不正なメールアドレス/パスワード
- [ ] ネットワークエラー
- [ ] Firebase設定エラー

**APIエラー**
- [ ] バックエンドサーバーダウン
- [ ] データベース接続エラー
- [ ] 認証トークンの期限切れ

### Phase 4: ドキュメント作成とクリーンアップ

#### 4.1 実装ドキュメント

**技術課題と解決策**
- [ ] 実装中に発見した課題の記録
- [ ] 解決方法の詳細な説明
- [ ] 初学者向けの学習ポイント

**設定ガイド**
- [ ] Firebase設定の手順書
- [ ] 環境変数設定ガイド
- [ ] トラブルシューティングガイド

#### 4.2 コード品質の確認

**最終チェック**
- [ ] TypeScript型チェック通過
- [ ] ESLint警告・エラーの解決
- [ ] テストの実行とパス確認

## 📚 学習ポイント

### 1. Firebase Authentication
- JWTトークンの仕組み
- Firebase SDKの使用方法
- 認証状態の管理

### 2. React Context API
- 認証状態の全体管理
- カスタムフックでの状態取得
- TypeScriptでの型安全性

### 3. API統合
- 認証ヘッダーの付与
- エラーハンドリング
- 非同期処理の管理

### 4. Cloudflare Workers
- D1データベースとの連携
- JWT検証の実装
- セキュリティの考慮事項

## 🚧 想定される技術課題

### 1. Firebase設定の複雑さ
**問題**: 設定値が多く、間違いやすい
**対策**: 段階的な設定と動作確認

### 2. CORS問題
**問題**: ローカル開発でのCORS設定
**対策**: バックエンドでの適切なCORS設定

### 3. 認証タイミング
**問題**: ページ読み込み時の認証状態確認
**対策**: ローディング状態の適切な管理

### 4. データベースマイグレーション
**問題**: D1データベースの制約
**対策**: 段階的なテストと確認

## 🎯 成功基準

### 必須要件
- [ ] Firebase認証の完全動作
- [ ] プレイヤーデータの永続化
- [ ] 基本的なゲームフローの動作

### 理想要件
- [ ] Google認証の動作
- [ ] エラーハンドリングの完全性
- [ ] パフォーマンスの最適化

## 📅 実装スケジュール

### Day 1: Firebase設定
- Firebase Console設定
- 環境変数の更新
- 基本認証テスト

### Day 2: API統合
- バックエンド統合
- データベース設定
- CRUD操作の実装

### Day 3: テストとデバッグ
- エンドツーエンドテスト
- エラーハンドリング
- パフォーマンス最適化

### Day 4: ドキュメント作成
- 実装記録の作成
- 学習ポイントの整理
- 次段階の計画

この計画により、学習用プロジェクトとして実用的で教育的価値の高いFirebase認証システムが完成します。