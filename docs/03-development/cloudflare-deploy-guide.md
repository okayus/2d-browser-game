# Cloudflareデプロイガイド

モンスター収集ゲームをCloudflare Workers + D1 + Pagesにデプロイする完全手順書

## 📋 前提条件

- Node.js 18以上がインストール済み
- pnpmがインストール済み
- Cloudflareアカウントを作成済み
- GitHubアカウントを作成済み（Pages用）

## 🚀 デプロイ手順

### 1. Cloudflare認証

```bash
cd /home/okayu/dev/2d-browser-game/packages/backend
npx wrangler login
```

- ブラウザが開いてCloudflareアカウントでの認証を求められます
- 「Allow」をクリックして認証を完了

### 2. アカウント情報確認

```bash
npx wrangler whoami
```

アカウントIDとメールアドレスが表示されることを確認

### 3. 本番用D1データベース作成

```bash
npx wrangler d1 create monster-game-prod
```

**重要**: 出力された`database_id`をメモしてください。
```
[[d1_databases]]
binding = "DB"
database_name = "monster-game-prod"
database_id = "ここに表示されたID"
```

### 4. 設定ファイル更新

`packages/backend/wrangler.toml`の本番環境設定を更新：

```toml
# 本番環境設定
[[env.production.d1_databases]]
binding = "DB"
database_name = "monster-game-prod"
database_id = "ステップ3で取得したID"
```

### 5. データベースマイグレーション実行

```bash
# 本番データベースにスキーマとシードデータを適用
npx wrangler d1 migrations apply monster-game-prod --remote
```

確認メッセージが表示されたら「y」で承認

### 6. バックエンド（Workers）デプロイ

```bash
# 本番環境でデプロイ
npx wrangler deploy --env production
```

**成功時の出力例**:
```
✅ Deployed monster-game-backend triggers (1.23 sec)
  https://monster-game-backend.your-username.workers.dev
```

**重要**: 表示されたWorker URLをメモしてください。

### 7. フロントエンド（Pages）デプロイ

#### 方法A: CLI（推奨）- Direct Upload

##### 7A.1 フロントエンドビルド

```bash
cd /home/okayu/dev/2d-browser-game/packages/frontend
npm run build
```

TypeScriptエラーが発生した場合は修正してから再ビルドしてください。

##### 7A.2 Pagesプロジェクト作成

```bash
npx wrangler pages project create monster-game-frontend --production-branch main
```

成功時の出力例:
```
✨ Successfully created the 'monster-game-frontend' project. 
It will be available at https://monster-game-frontend.pages.dev/
```

##### 7A.3 環境変数設定

```bash
# Worker URLを環境変数として設定（ステップ6で取得したURLを使用）
echo "https://your-worker-url.workers.dev" | npx wrangler pages secret put VITE_API_URL --project-name monster-game-frontend
```

例:
```bash
echo "https://monster-game-backend-production.toshiaki-mukai-9981.workers.dev" | npx wrangler pages secret put VITE_API_URL --project-name monster-game-frontend
```

##### 7A.4 デプロイ実行

```bash
npx wrangler pages deploy dist --project-name monster-game-frontend --commit-dirty=true
```

成功時の出力例:
```
✨ Deployment complete! Take a peek over at https://abc123.monster-game-frontend.pages.dev
```

**重要**: 表示されたPages URLをメモしてください。

#### 方法B: Git連携

##### 7B.1 GitHubリポジトリ作成・プッシュ

```bash
# プロジェクトルートで
git add .
git commit -m "feat: Cloudflareデプロイ用設定完了

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# GitHubリポジトリを作成してプッシュ
git remote add origin https://github.com/your-username/2d-browser-game.git
git push -u origin main
```

##### 7B.2 Cloudflare Pagesプロジェクト作成

1. [Cloudflareダッシュボード](https://dash.cloudflare.com/)にログイン
2. **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**
3. GitHubリポジトリを選択: `your-username/2d-browser-game`
4. 設定を入力:
   - **Project name**: `monster-game-frontend`
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `cd packages/frontend && npm run build`
   - **Build output directory**: `packages/frontend/dist`

##### 7B.3 環境変数設定

Pages設定の**Settings** > **Environment variables**で以下を追加:

```
VITE_API_URL = https://your-worker-url.workers.dev
```

（ステップ6で取得したWorker URLを使用）

##### 7B.4 デプロイ実行

**Save and Deploy**をクリックしてデプロイ開始

## ✅ デプロイ確認

### バックエンド確認

```bash
# ヘルスチェック
curl https://monster-game-backend.your-username.workers.dev/health

# プレイヤー一覧取得
curl https://monster-game-backend.your-username.workers.dev/api/players
```

### フロントエンド確認

1. Pagesのデプロイ完了を待つ（通常1-3分）
2. 提供されたPages URL（`https://monster-game-frontend.pages.dev`）にアクセス
3. プレイヤー作成とゲーム機能をテスト

## 🔧 トラブルシューティング

### よくあるエラーと解決方法

#### 1. `Couldn't find a D1 DB with the name`

**原因**: データベース名の設定ミス
**解決**: `wrangler.toml`の`database_name`が正しいか確認

#### 2. `Failed to connect to API`

**原因**: フロントエンドの環境変数設定ミス
**解決**: Pages環境変数の`VITE_API_URL`を再確認

#### 3. `Migration failed`

**原因**: SQLスキーマエラー
**解決**: `migrations/`フォルダのSQLファイルを確認

#### 4. `CORS error`

**原因**: バックエンドのCORS設定ミス
**解決**: `src/index.ts`のCORS originにPages URLを追加

#### 5. `TypeScript compilation error`

**原因**: フロントエンドのTypeScript型エラー
**解決**: エラー箇所を修正してから再ビルド

例:
```typescript
// ❌ エラー: 'response.データ' is of type 'unknown'
navigate(`/map/${response.データ.id}`);

// ✅ 修正: 型アサーションを追加
const responseData = response.データ as { id: string };
navigate(`/map/${responseData.id}`);
```

#### 6. `Pages environment variable not working`

**原因**: 環境変数がビルド時に読み込まれていない
**解決**: 
- CLI: `wrangler pages secret put`で設定
- Dashboard: Pages設定で環境変数を追加後、再デプロイ

#### 7. `Project not found`

**原因**: Pagesプロジェクトが作成されていない
**解決**:
```bash
npx wrangler pages project create your-project-name --production-branch main
```

## 📊 料金情報

### 無料枠（学習用途では十分）

- **Workers**: 100,000リクエスト/日
- **D1 Database**: 25,000行読み取り/日、5GBストレージ
- **Pages**: 500回ビルド/月、無制限リクエスト

### 有料プラン（本格運用時）

- **Workers Paid**: $5/月～（10Mリクエスト含む）
- **D1 Paid**: $5/月～（25Mクエリ含む）

## 🔄 継続的デプロイ

### CLI デプロイの場合（推奨）

#### バックエンド更新手順

```bash
cd /home/okayu/dev/2d-browser-game/packages/backend
# コード変更後
npx wrangler deploy --env production
```

#### フロントエンド更新手順

```bash
cd /home/okayu/dev/2d-browser-game/packages/frontend
# コード変更後
npm run build
npx wrangler pages deploy dist --project-name monster-game-frontend
```

#### 開発フロー（CLI）

1. ローカルで開発・テスト
2. バックエンド: `wrangler deploy --env production`
3. フロントエンド: `npm run build` → `wrangler pages deploy`
4. 動作確認

### Git連携デプロイの場合

#### 自動デプロイ設定

1. **バックエンド**: 
   ```bash
   # コード変更後
   git push origin main
   npx wrangler deploy --env production
   ```

2. **フロントエンド**: 
   GitHubにプッシュすると自動でPages再デプロイ

#### 開発フロー（Git連携）

1. ローカルで開発・テスト
2. GitHubにプッシュ
3. バックエンドは手動デプロイ
4. フロントエンドは自動デプロイ

## 🎯 次のステップ

- [ ] カスタムドメイン設定
- [ ] CI/CDパイプライン構築
- [ ] モニタリング・ログ設定
- [ ] パフォーマンス最適化

## 📚 参考リンク

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [D1 データベース ドキュメント](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Wrangler CLI リファレンス](https://developers.cloudflare.com/workers/wrangler/)