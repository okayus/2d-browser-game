# 🎮 ポケモンライクゲーム - プロジェクトコンテキスト

**最終更新**: 2025年7月5日  
**現在のブランチ**: feature/database-environment-separation  
**プロジェクトステータス**: 開発中（基本機能実装済み）

## 📋 プロジェクト概要

### 目的
- プログラミング初学者向けの学習用プロジェクト
- ポケモンライクな2Dブラウザゲームの開発を通じてWeb開発を学習
- 実践的なコードを書きながら段階的にスキルアップ

### 技術スタック
- **フロントエンド**: React + TypeScript + Vite + Tailwind CSS + Shadcn
- **バックエンド**: Hono + TypeScript + Cloudflare Workers
- **データベース**: 
  - 本番: Cloudflare D1
  - 開発: SQLite (better-sqlite3)
  - テスト: In-Memory Mock Database
- **ORM**: Drizzle ORM（移行中）
- **デプロイ**: Cloudflare Pages（フロント）+ Workers（API）

### 主要な特徴
- **初学者向け設計**: 日本語変数名、詳細なコメント、段階的実装
- **型安全性重視**: TypeScript strict mode、anyの使用禁止
- **環境分離**: 開発・テスト・本番環境の完全分離
- **TDD実践**: テスト駆動開発の実践

## 🏗️ 現在の実装状況

### ✅ 実装済み機能

#### バックエンド
1. **ポケモン管理システム**
   - 種族データ管理（マスターデータ）
   - 個体ポケモン管理（所有ポケモン）
   - パーティ編成機能
   - ポケモン捕獲システム

2. **アイテム管理システム**
   - アイテムマスターデータ
   - プレイヤーインベントリ
   - カテゴリ別検索

3. **バトルシステム（基本）**
   - バトル開始・終了
   - 技の使用
   - ダメージ計算
   - バトルログ記録

4. **データベース環境分離システム**
   - 環境別アダプター（D1/SQLite/Mock）
   - 統一インターフェース
   - 自動マイグレーション

#### フロントエンド
- 基本的なゲーム画面
- マップ表示（モック）
- プレイヤー移動（基本）

### 🔄 進行中の作業

1. **Drizzle ORM移行**
   - スキーマ定義完了
   - リポジトリ層の移行中
   - 型安全性の向上

2. **CI/CD問題の解決**
   - TypeScript型エラー（3個）
   - ESLintエラー対応
   - テスト失敗修正（ItemRepository）

### ❌ 未実装機能

1. **ゲームシステム**
   - NPCバトル
   - ポケモン進化
   - 状態異常
   - レベルアップ

2. **マップシステム**
   - マップ間移動
   - イベント処理
   - エンカウント

3. **セーブ/ロード**
   - 完全な状態保存
   - セッション管理

## 🚨 既知の問題と注意点

### 現在の問題
1. **CI失敗**
   - Drizzle関連の型エラー（3個）
   - ItemRepositoryテスト失敗（3件）

2. **技術的負債**
   - SimplifiedMockAdapterの型定義
   - 一部のany型使用（修正済みだが要確認）

### 重要な注意事項
1. **CLAUDE.mdの遵守**
   - anyの使用は絶対禁止
   - 日本語変数名を使用
   - 初学者向けコメント必須
   - TDD実践

2. **ブランチ戦略**
   - mainブランチでの直接作業禁止
   - 必ずissueと紐づけたブランチ作成
   - PR作成時は丁寧な説明

3. **環境変数**
   - `ENVIRONMENT`: development/test/production
   - `DB`: D1データベースバインディング

## 🔧 よく使うコマンド

### 開発
```bash
# 開発サーバー起動（ルートディレクトリで）
pnpm dev

# バックエンドのみ
cd packages/backend
pnpm dev

# フロントエンドのみ
cd packages/frontend
pnpm dev
```

### テスト
```bash
# バックエンドテスト
cd packages/backend
pnpm test

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

### ビルド・デプロイ
```bash
# ビルド
pnpm build

# デプロイ（要Cloudflare設定）
pnpm deploy
```

## 📁 重要なファイルパス

### 設定ファイル
- `/CLAUDE.md` - プロジェクトルール（必読）
- `/packages/backend/wrangler.toml` - Cloudflare設定
- `/packages/backend/.env.example` - 環境変数サンプル

### 主要コード
- `/packages/backend/src/index.ts` - APIエントリーポイント
- `/packages/backend/src/database/factory.ts` - DB環境分離
- `/packages/backend/src/adapters/` - DBアダプター群
- `/packages/backend/src/routes/` - APIルート定義

### テスト
- `/packages/backend/src/**/*.test.ts` - 各種テストファイル
- `/packages/backend/src/test-utils/` - テストユーティリティ

## 🎯 次のステップ

1. **緊急対応**
   - CI失敗の解決
   - テスト修正

2. **短期目標**
   - Drizzle ORM完全移行
   - 基本機能の品質向上

3. **中期目標**
   - マップシステム実装
   - セーブ/ロード機能
   - NPCバトル実装

## 📚 関連ドキュメント

- `cloudflare-config.md` - Cloudflare詳細設定
- `environment-setup.md` - 環境構築手順
- `common-issues.md` - トラブルシューティング
- `work-history.md` - 作業履歴

---

*このドキュメントは、Claude Codeが作業を開始する際の最初の参照点として機能します。*