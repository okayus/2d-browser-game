# Cloudflare環境セットアップガイド

## 概要

このドキュメントは、ポケモンライクゲームをCloudflare環境にデプロイするためのセットアップ手順を説明します。
初学者向けに、段階的に環境構築を進めます。

## 前提条件

- Cloudflareアカウントの作成済み
- npmまたはpnpmがインストール済み
- Gitがインストール済み

## セットアップ手順

### 1. Wrangler CLI のインストール

```bash
# Cloudflare Wrangler CLIをグローバルインストール
npm install -g wrangler

# バージョン確認
wrangler --version
```

### 2. Cloudflareへの認証

#### 方法A: ブラウザ認証（推奨）

```bash
# ブラウザでCloudflareにログイン
wrangler login
```

#### 方法B: APIトークン認証

1. [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) にアクセス
2. 「Create Token」をクリック
3. 「Custom token」を選択
4. 以下の権限を設定：
   - Account: `Cloudflare Workers:Edit`
   - Zone: `Zone:Read`
   - Account: `D1:Edit`
5. 生成されたトークンを環境変数に設定：

```bash
export CLOUDFLARE_API_TOKEN=""
```

### 3. D1データベースの作成

```bash
# D1データベースを作成
wrangler d1 create pokemon-game-db
```

出力例：

```
✅ Successfully created DB 'pokemon-game-db' in region WEUR
Created your new D1 database.

[[d1_databases]]
binding = "DB"
database_name = "pokemon-game-db"
database_id = "12345678-1234-1234-1234-123456789abc"
```

この`database_id`を`wrangler.toml`ファイルに追加してください。

### 4. wrangler.toml の設定

```toml
name = "pokemon-like-game-tutorial"
main = "packages/backend/src/index.ts"
compatibility_date = "2024-12-01"

[[d1_databases]]
binding = "DB"
database_name = "pokemon-game-db"
database_id = "12345678-1234-1234-1234-123456789abc"  # 手順3で取得したID

[env.production.vars]
NODE_ENV = "production"

[env.development.vars]
NODE_ENV = "development"
```

### 5. データベースマイグレーションの実行

```bash
# プレイヤーテーブルの作成
wrangler d1 execute pokemon-game-db --file=packages/backend/migrations/0001_create_users.sql

# セーブデータテーブルの作成
wrangler d1 execute pokemon-game-db --file=packages/backend/migrations/0002_create_saves.sql

# プレイヤー情報テーブルの作成
wrangler d1 execute pokemon-game-db --file=packages/backend/migrations/0002_add_players.sql

# シンプルポケモンシステムの作成
wrangler d1 execute pokemon-game-db --file=packages/backend/migrations/0003_simple_pokemon_system.sql

# ポケモンマスタデータの投入
wrangler d1 execute pokemon-game-db --file=packages/backend/migrations/0004_simple_pokemon_data.sql
```

### 6. ローカル開発環境での確認

```bash
# ローカル開発サーバーを起動
wrangler dev

# または既存のpnpm scriptを使用
pnpm dev
```

### 7. 本番環境へのデプロイ

```bash
# Workers をデプロイ
wrangler deploy

# デプロイ後のURL例
# https://pokemon-like-game-tutorial.your-subdomain.workers.dev
```

## データベース操作

### D1データベースへの直接クエリ

```bash
# SQLクエリを直接実行
wrangler d1 execute pokemon-game-db --command="SELECT * FROM pokemon_master LIMIT 5;"

# ファイルからSQLを実行
wrangler d1 execute pokemon-game-db --file=query.sql
```

### バックアップとリストア

```bash
# データベースの情報を表示
wrangler d1 info pokemon-game-db

# データベース一覧を表示
wrangler d1 list
```

## トラブルシューティング

### よくある問題

1. **認証エラー**

   ```
   Error: Not logged in.
   ```

   解決策: `wrangler login` または APIトークンの設定

2. **データベースが見つからない**

   ```
   Error: No D1 database found with name 'pokemon-game-db'
   ```

   解決策: `wrangler.toml` の `database_id` を確認

3. **マイグレーションエラー**
   ```
   Error: table already exists
   ```
   解決策: 既存のテーブルを確認し、必要に応じて `DROP TABLE` を実行

### デバッグ方法

```bash
# 詳細ログでデバッグ
wrangler d1 execute pokemon-game-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Workers のログを確認
wrangler tail pokemon-like-game-tutorial
```

## セキュリティのベストプラクティス

1. **APIトークンの管理**

   - 本番環境ではAPIトークンを環境変数で管理
   - `.env` ファイルは `.gitignore` に追加

2. **データベースアクセス**

   - D1は自動的にCloudflarネットワーク内でセキュアに管理
   - 直接的な外部アクセスは不可

3. **Workers のセキュリティ**
   - CORS設定の適切な管理
   - 入力値の検証とサニタイズ

## 参考リンク

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/cli-wrangler/)

## 次のステップ

1. データベースが正常に作成されたことを確認
2. APIエンドポイントをテスト
3. フロントエンドとの統合テスト
4. 本番環境でのパフォーマンステスト
