# 🛠️ 環境構築手順書

**最終更新**: 2025年7月5日  
**対象OS**: macOS, Linux, Windows (WSL2)

## 📋 前提条件

### 必要なツール
- **Node.js**: v20.x以上
- **pnpm**: v10.12.1
- **Git**: 最新版
- **VS Code**: 推奨エディタ（拡張機能含む）

### Cloudflare関連（オプション）
- Cloudflareアカウント
- Wrangler CLI

## 🚀 クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/okayus/pokemon-like-game-tutorial.git
cd pokemon-like-game-tutorial

# pnpmのインストール（未インストールの場合）
npm install -g pnpm@10.12.1

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

## 📝 詳細セットアップ手順

### 1. Node.js環境の準備

#### macOS/Linux
```bash
# nvmを使用する場合（推奨）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc  # または ~/.zshrc

# Node.js v20のインストール
nvm install 20
nvm use 20
```

#### Windows (WSL2)
```bash
# WSL2でUbuntuをインストール後、上記のLinux手順を実行
# またはnvm-windowsを使用
```

### 2. pnpmのセットアップ

```bash
# グローバルインストール
npm install -g pnpm@10.12.1

# バージョン確認
pnpm --version  # 10.12.1

# pnpmの設定（オプション）
pnpm config set store-dir ~/.pnpm-store
```

### 3. プロジェクトのセットアップ

```bash
# リポジトリクローン
git clone https://github.com/okayus/pokemon-like-game-tutorial.git
cd pokemon-like-game-tutorial

# ブランチ切り替え（必要に応じて）
git checkout feature/database-environment-separation

# 依存関係インストール
pnpm install

# ビルド確認
pnpm build
```

### 4. 環境変数の設定

#### バックエンド（packages/backend/）
```bash
# .env.exampleをコピー
cd packages/backend
cp .env.example .env.development

# 必要に応じて編集
# ENVIRONMENT=development
# DATABASE_PATH=./data/local.db
```

#### Cloudflare認証情報（デプロイ用）
```bash
# .dev.varsファイルを作成（gitignore済み）
cat > .dev.vars << EOF
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
EOF
```

### 5. データベースセットアップ

```bash
cd packages/backend

# ローカルデータベースの初期化
mkdir -p data
touch data/local.db

# マイグレーション実行（開発環境）
pnpm db:migrate:dev

# Drizzle Studioでデータベース確認（オプション）
pnpm db:studio
```

### 6. VS Code拡張機能（推奨）

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "burkeholland.simple-react-snippets",
    "prisma.prisma",
    "drizzle-team.drizzle-orm-driver"
  ]
}
```

## 🧪 動作確認

### 開発サーバー起動
```bash
# ルートディレクトリで全体起動
pnpm dev

# 個別起動
cd packages/backend && pnpm dev  # http://localhost:8787
cd packages/frontend && pnpm dev # http://localhost:5173
```

### テスト実行
```bash
# バックエンドテスト
cd packages/backend
pnpm test

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

### ビルド確認
```bash
# 全体ビルド
pnpm build

# 個別ビルド
cd packages/backend && pnpm build
cd packages/frontend && pnpm build
```

## 🌐 Cloudflare開発環境

### Wrangler CLIセットアップ
```bash
# インストール済み（package.jsonに含まれる）
# グローバルインストールも可能
npm install -g wrangler

# ログイン
wrangler login

# 設定確認
wrangler whoami
```

### ローカルでのCloudflare環境エミュレーション
```bash
cd packages/backend

# D1データベースを含むローカル開発
wrangler dev --local

# 本番環境に近い開発（要認証）
wrangler dev
```

## 🐛 トラブルシューティング

### よくある問題と解決策

#### 1. pnpm installが失敗する
```bash
# キャッシュクリア
pnpm store prune

# node_modulesを削除して再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. better-sqlite3のビルドエラー
```bash
# Python環境が必要
# macOS
brew install python

# Ubuntu/Debian
sudo apt-get install python3 python3-pip build-essential

# 再ビルド
cd packages/backend
pnpm rebuild better-sqlite3
```

#### 3. TypeScriptエラー
```bash
# VSCodeの再起動
# TypeScriptバージョン確認
pnpm list typescript

# 型定義の再生成
pnpm typecheck
```

#### 4. ポート競合
```bash
# 使用中のポート確認
lsof -i :8787  # バックエンド
lsof -i :5173  # フロントエンド

# プロセスキル
kill -9 <PID>

# または環境変数でポート変更
PORT=8788 pnpm dev
```

## 📁 プロジェクト構造

```
pokemon-like-game-tutorial/
├── packages/
│   ├── backend/      # APIサーバー（Hono + Workers）
│   ├── frontend/     # Webアプリ（React + Vite）
│   └── shared/       # 共通型定義
├── docs/            # ドキュメント
├── .github/         # GitHub Actions
└── 設定ファイル群
```

## 🔗 関連リンク

### 公式ドキュメント
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Hono](https://hono.dev/)
- [Vite](https://vitejs.dev/)

### プロジェクト固有
- [CLAUDE.md](/CLAUDE.md) - プロジェクトルール
- [project-context.md](./project-context.md) - プロジェクト概要
- [cloudflare-config.md](./cloudflare-config.md) - Cloudflare設定

## 💡 Tips

1. **開発効率化**
   - `pnpm dev`でフロントエンド・バックエンド同時起動
   - HMR（Hot Module Replacement）でリアルタイム反映

2. **デバッグ**
   - Chrome DevToolsでフロントエンドデバッグ
   - `wrangler tail`でWorkerログ確認

3. **パフォーマンス**
   - pnpmのハードリンクで高速インストール
   - Viteの高速ビルド

---

*この手順書に従って環境構築を行えば、スムーズに開発を開始できます。*