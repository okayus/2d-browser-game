# Week3 実装計画書 - ローカルD1セットアップと統合テスト

**作成日**: 2025年7月7日  
**ステータス**: 実施済み

## 概要

Week2までに基本的なバックエンドAPIの実装が完了したため、Week3ではローカルでのD1データベースセットアップと統合テストの基盤構築を行いました。

## 実施内容

### ✅ Phase 1: Wrangler設定ファイルの作成

- [x] wrangler.jsonc の作成（最新のCloudflare推奨形式）
- [x] D1データベースバインディングの設定
- [x] preview_database_id でローカル開発用DBを設定
- [x] 開発環境と本番環境の設定を分離

**成果物**: `packages/backend/wrangler.jsonc`

### ✅ Phase 2: D1データベースの作成

- [x] 開発用D1データベースの作成
  - データベース名: `monster-game-dev`
  - データベースID: `deb0b7fc-c860-49df-978c-dda97da702b2`
- [x] wrangler.jsonc への database_id 設定

**実行コマンド**:
```bash
npx wrangler d1 create monster-game-dev
```

### ✅ Phase 3: マイグレーションの準備と実行

- [x] migrationsディレクトリの作成
- [x] Drizzle Kitでマイグレーション生成
  - `migrations/0000_massive_legion.sql` (スキーマ)
  - `migrations/0001_seed_initial_data.sql` (初期データ)
- [x] ローカルD1へのマイグレーション適用

**実行コマンド**:
```bash
mkdir -p migrations
npx drizzle-kit generate:sqlite
npx wrangler d1 migrations apply monster-game-dev --local
```

### ✅ Phase 4: シンプルな統合テスト環境の構築

- [x] index.simple.ts の作成
  - 最小限のD1接続テスト用エンドポイント
  - 基本的なCRUD操作の実装
- [x] wrangler.simple.toml の作成
  - 統合テスト専用の簡易設定

**成果物**: 
- `packages/backend/src/index.simple.ts`
- `packages/backend/wrangler.simple.toml`

### ✅ Phase 5: 統合テストの実装

- [x] 実際のD1を使用したテストファイルの作成
  - `packages/backend/src/__tests__/d1-integration.test.ts`
- [x] wrangler の unstable_dev() APIを使用した実装

### ✅ Phase 6: フロントエンドAPI統合

- [x] API クライアントの作成
  - `packages/frontend/src/api/client.ts`
  - 型安全なAPI呼び出しの実装
- [x] カスタムフックの作成
  - `packages/frontend/src/hooks/useAPI.ts`
  - APIの状態管理（loading, error, data）

### ✅ Phase 7: ドキュメントの更新

- [x] D1_SETUP_GUIDE.md の更新
  - 実際に使用したコマンドを記録
  - トラブルシューティングセクションの追加
- [x] week3-plan.md の作成（本ファイル）

## 学んだこと・課題

### 技術的な発見

1. **wrangler v4の変更点**
   - `node_compat` → `compatibility_flags: ["nodejs_compat"]`
   - `persist_to`設定が削除された

2. **D1ローカル開発の仕組み**
   - `preview_database_id`でローカルDBを識別
   - データは`.wrangler/state/v3/d1`に永続化
   - `--local`フラグでローカルDBを使用

3. **統合テストの課題**
   - unstable_dev APIはまだ実験的
   - テスト環境でのD1接続に工夫が必要

### 初学者向けのポイント

1. **設定ファイルの選択**
   - wrangler.toml → wrangler.jsonc（コメントが書ける）
   - JSONCの方が初学者に分かりやすい

2. **マイグレーション管理**
   - Drizzle Kitで自動生成
   - SQLファイルで管理するため理解しやすい

3. **APIクライアントの抽象化**
   - fetch関数をラップして使いやすく
   - エラーハンドリングを一元化

## 次のステップ（Week4に向けて）

1. **UI実装の本格化**
   - [ ] スタート画面の実装
   - [ ] モンスター一覧画面の実装
   - [ ] バトル画面の実装
   - [ ] 編集・削除機能のUI

2. **フロントエンド・バックエンド統合**
   - [ ] 実際のAPI接続
   - [ ] エラーハンドリングの実装
   - [ ] ローディング状態の管理

3. **Cloudflareへのデプロイ準備**
   - [ ] 本番用D1データベースの作成
   - [ ] 環境変数の設定
   - [ ] CIパイプラインの構築

## 参考資料

- [Cloudflare D1 Local Development](https://developers.cloudflare.com/d1/best-practices/local-development)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Drizzle ORM D1 Driver](https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1)

## 初学者向けアドバイス

1. **段階的に進める**
   - まずはローカルで動作確認
   - 次に統合テスト
   - 最後に本番デプロイ

2. **エラーメッセージを読む**
   - Cloudflareのエラーは具体的
   - ドキュメントへのリンクも提供される

3. **公式ドキュメントを参照**
   - Cloudflareのドキュメントは充実
   - 最新の変更に注意（wrangler v4など）