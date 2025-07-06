# ☁️ Cloudflare設定情報

**最終更新**: 2025年7月5日  
**重要度**: 🔴 高（デプロイ・開発に必須）

## 🔑 基本設定情報

### D1データベース
```toml
# Production
database_name = "pokemon-game-db"
database_id = "189590d0-ecbb-43c9-81d7-911f41f5e851"
binding = "DB"

# Development（ローカル）
database_name = "pokemon-game-db"
database_id = "local-pokemon-game-db"
binding = "DB"
```

### Workersプロジェクト
```toml
name = "pokemon-game-api"
main = "src/index.ts"
compatibility_date = "2025-01-01"
```

### Pagesプロジェクト
```yaml
projectName: pokemon-game-frontend
directory: packages/frontend/dist
```

## 🌍 環境変数

### Workers環境変数
```toml
[vars]
ENVIRONMENT = "production"

[env.development]
vars = { ENVIRONMENT = "development" }
```

### GitHub Secrets（CI/CD用）
```bash
CLOUDFLARE_API_TOKEN    # Cloudflare APIトークン
CLOUDFLARE_ACCOUNT_ID   # CloudflareアカウントID
```

## 🚀 デプロイ設定

### Wrangler設定（packages/backend/wrangler.toml）
```toml
name = "pokemon-game-api"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[vars]
ENVIRONMENT = "production"

# Production database configuration
[[d1_databases]]
binding = "DB"
database_name = "pokemon-game-db"
database_id = "189590d0-ecbb-43c9-81d7-911f41f5e851"

[env.development]
vars = { ENVIRONMENT = "development" }

# For local development
[[env.development.d1_databases]]
binding = "DB"
database_name = "pokemon-game-db"
database_id = "local-pokemon-game-db"
```

### デプロイコマンド

#### ローカル開発
```bash
# バックエンド開発サーバー
cd packages/backend
pnpm dev
# または
npx wrangler dev --port 8787

# フロントエンド開発サーバー
cd packages/frontend
pnpm dev
```

#### 本番デプロイ
```bash
# バックエンド（Workers）
cd packages/backend
npx wrangler deploy

# フロントエンド（Pages）
cd packages/frontend
pnpm build
npx wrangler pages deploy dist
```

## 📊 D1データベース操作

### データベース作成
```bash
# 本番データベース作成（既に作成済み）
npx wrangler d1 create pokemon-game-db
```

### マイグレーション実行
```bash
# マイグレーションファイル実行
npx wrangler d1 execute pokemon-game-db --file=./migrations/0001_initial.sql
npx wrangler d1 execute pokemon-game-db --file=./migrations/0002_players.sql
# ... 以下同様
```

### データベース確認
```bash
# SQLコンソール起動
npx wrangler d1 execute pokemon-game-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# ローカルDBファイル確認
npx wrangler d1 execute pokemon-game-db --local --command="SELECT * FROM players;"
```

## 🔧 ローカル開発設定

### .env.development（サンプル）
```env
# ローカル開発用設定
ENVIRONMENT=development
DATABASE_PATH=./data/local.db
```

### ローカルD1エミュレーション
```bash
# ローカルでD1を使用（Wranglerが自動で処理）
cd packages/backend
npx wrangler dev

# ローカルDBは以下に作成される
# .wrangler/state/v3/d1/
```

## 🌐 API エンドポイント

### 本番環境
```
https://pokemon-game-api.{your-subdomain}.workers.dev
```

### 開発環境
```
http://localhost:8787
```

## 📝 重要な注意事項

1. **D1データベースID**
   - `189590d0-ecbb-43c9-81d7-911f41f5e851`は実際のD1インスタンスID
   - 変更不可（新規作成時は新しいIDが発行される）

2. **環境分離**
   - 本番: Cloudflare D1を直接使用
   - 開発: SQLite（better-sqlite3）を使用
   - テスト: In-Memoryモックを使用

3. **認証情報の管理**
   - `CLOUDFLARE_API_TOKEN`と`CLOUDFLARE_ACCOUNT_ID`は絶対に公開しない
   - GitHub Secretsで安全に管理
   - ローカル開発では`.dev.vars`ファイルを使用可能

4. **デプロイ前チェック**
   - wrangler.tomlの設定確認
   - マイグレーションの実行状況確認
   - 環境変数の設定確認

## 🔐 セキュリティ設定

### APIトークンの権限
必要最小限の権限のみ付与：
- Workers Scripts:Edit
- D1:Edit
- Account:Read

### CORS設定
現在は全オリジン許可（開発用）：
```typescript
app.use('/*', cors())
```

本番環境では特定のドメインのみ許可に変更予定。

## 🆘 トラブルシューティング

### よくある問題

1. **D1接続エラー**
   ```
   Error: D1_ERROR: no such table: players
   ```
   → マイグレーションが実行されていない

2. **デプロイ失敗**
   ```
   Error: Authentication error
   ```
   → APIトークンの権限不足または期限切れ

3. **ローカル開発でのDB接続エラー**
   ```
   Error: Cannot find module 'better-sqlite3'
   ```
   → `pnpm install`を実行

## 📚 参考リンク

- [Cloudflare D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Wrangler CLI ドキュメント](https://developers.cloudflare.com/workers/wrangler/)
- [Workers 環境変数](https://developers.cloudflare.com/workers/platform/environment-variables/)

---

*このドキュメントは、Cloudflare関連の設定を一元管理するためのものです。*