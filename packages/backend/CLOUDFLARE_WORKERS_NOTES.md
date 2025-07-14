# Cloudflare Workers 互換性に関する注意事項

## 問題：Node.js モジュールの非互換性

Cloudflare Workers環境では、Node.jsの標準モジュール（`node:fs`, `node:path`など）は使用できません。

### 影響を受けるファイル

1. **seed-script.ts** → **seed-script.node.ts** にリネーム
   - `better-sqlite3` を使用（Node.js依存）
   - ローカル開発環境でのみ使用
   - TypeScriptのコンパイル対象から除外

2. **drizzle-orm/d1/migrator**
   - 内部でNode.jsモジュールを使用
   - 代替方法：Wrangler CLIでマイグレーションを実行

### 解決策

#### 1. シードスクリプトの分離
```bash
# ファイル名を .node.ts にして除外
mv src/db/seed-script.ts src/db/seed-script.node.ts

# tsconfig.json に除外設定を追加
"exclude": ["dist", "node_modules", "src/**/*.node.ts"]
```

#### 2. マイグレーションの実行方法

開発環境：
```bash
# D1データベースの作成
wrangler d1 create monster-game-dev

# マイグレーションファイルの生成
pnpm drizzle-kit generate:sqlite

# マイグレーションの実行（Wrangler CLI経由）
wrangler d1 migrations apply monster-game-dev --local
```

本番環境：
```bash
# 本番データベースへのマイグレーション
wrangler d1 migrations apply monster-game-prod
```

#### 3. データベース初期化の簡略化

`migration-simple.ts` を使用：
- マイグレーション機能を除外
- 純粋なデータベース接続のみ
- Workers環境で安全に動作

### 推奨される開発フロー

1. **スキーマ変更時**
   ```bash
   # 1. スキーマを編集
   # 2. マイグレーションファイルを生成
   pnpm drizzle-kit generate:sqlite
   # 3. ローカルに適用
   wrangler d1 migrations apply monster-game-dev --local
   ```

2. **初期データ投入**
   ```bash
   # Node.js環境で実行
   pnpm seed
   # またはリセット付き
   pnpm seed:reset
   ```

3. **開発サーバー起動**
   ```bash
   pnpm dev
   ```

### Cloudflare Workers で使用可能な代替手段

| Node.js モジュール | Workers 代替手段 |
|------------------|----------------|
| `node:fs` | Workers KV, R2, D1 |
| `node:path` | URL API |
| `node:crypto` | Web Crypto API |
| `node:buffer` | ArrayBuffer, Uint8Array |
| `node:stream` | ReadableStream, WritableStream |

### 今後の改善案

1. **マイグレーションの自動化**
   - GitHub Actionsでマイグレーションを自動実行
   - Wrangler CLIをCI/CDに統合

2. **シードデータのAPI化**
   - 管理者用APIエンドポイントを作成
   - Workers環境内でシードデータを投入

3. **開発環境の統一**
   - Docker環境でWranglerを含むすべてのツールを統合
   - VS Code Dev Containerの設定

## 参考リンク

- [Cloudflare Workers Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)
- [D1 Database Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)