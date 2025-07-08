# Cloudflare D1 データベース設定ガイド

このガイドでは、2DブラウザゲームプロジェクトでCloudflare D1データベースを設定する手順を説明します。

## 最新のセットアップ手順（2025年7月7日実施）

以下は実際に実施してテスト済みの手順です。

## 1. wrangler.jsonc の作成（推奨）

最新のCloudflareドキュメントでは、`wrangler.toml`の代わりに`wrangler.jsonc`の使用が推奨されています。

```bash
cd packages/backend
```

`wrangler.jsonc`ファイルを作成：

```json
{
  // Cloudflare Workers 設定ファイル (wrangler.jsonc)
  "name": "monster-game-backend",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"],
  
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "monster-game-dev",
      "database_id": "YOUR_DATABASE_ID_HERE",
      "preview_database_id": "local-monster-game"
    }
  ]
}
```

## 2. D1データベースの作成

### 開発環境用データベースの作成

```bash
# 開発用データベースを作成
npx wrangler d1 create monster-game-dev

# 実際の出力例：
# ⛅️ wrangler 4.23.0
# ───────────────────
# ✅ Successfully created DB 'monster-game-dev' in region APAC
# Created your new D1 database.
# 
# {
#   "d1_databases": [
#     {
#       "binding": "DB",
#       "database_name": "monster-game-dev", 
#       "database_id": "deb0b7fc-c860-49df-978c-dda97da702b2"
#     }
#   ]
# }
```

取得した`database_id`を`wrangler.jsonc`に設定します。

### 本番環境用データベースの作成

```bash
# 本番用データベースを作成
npx wrangler d1 create game-database-production

# ステージング用データベースを作成（必要に応じて）
npx wrangler d1 create game-database-staging
```

## 3. Drizzle ORM の設定

`drizzle.config.ts`を更新して、wrangler.jsoncを参照するように設定：

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/スキーマ.ts',
  out: './migrations',
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: './wrangler.jsonc',  // .tomlから.jsoncに変更
    dbName: 'monster-game-dev',
  },
} satisfies Config;
```

## 3. TypeScript型定義の生成

プロジェクトのルートディレクトリで以下のコマンドを実行：

```bash
# TypeScript型定義を生成
npx wrangler types

# 生成されたファイル: worker-configuration.d.ts
```

## 4. TypeScript設定の確認

### src/index.ts での使用例

```typescript
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // D1データベースを使用
    const result = await env.DB.prepare("SELECT * FROM players").all();
    return Response.json(result);
  },
};
```

### tsconfig.json の設定

```json
{
  "compilerOptions": {
    "types": ["@cloudflare/workers-types", "./worker-configuration"]
  }
}
```

## 4. マイグレーションの生成と適用

### マイグレーションディレクトリの作成

```bash
mkdir -p migrations
```

### Drizzle Kitでマイグレーション生成

```bash
npx drizzle-kit generate:sqlite

# 実際の出力例：
# drizzle-kit: v0.20.0
# drizzle-orm: v0.29.0
# 
# No config path provided, using default 'drizzle.config.ts'
# Reading config file '/home/okayu/dev/2d-browser-game/packages/backend/drizzle.config.ts'
# 3 tables
# players 4 columns 0 indexes 0 fks
# monster_species 6 columns 0 indexes 0 fks
# owned_monsters 8 columns 0 indexes 2 fks
# 
# [✓] Your SQL migration file ➜ migrations/0000_massive_legion.sql 🚀
```

### マイグレーションをローカルD1に適用

```bash
npx wrangler d1 migrations apply monster-game-dev --local

# 実際の出力例：
# ⛅️ wrangler 4.23.0
# ───────────────────
# Migrations to be applied:
# ┌─────────────────────────┐
# │ name                    │
# ├─────────────────────────┤
# │ 0000_massive_legion.sql │
# └─────────────────────────┘
# 🌀 Executing on local database monster-game-dev (local-monster-game) from .wrangler/state/v3/d1:
# 🚣 4 commands executed successfully.
```

### 初期データの投入

`migrations/0001_seed_initial_data.sql`を作成:

```sql
-- 初期データの投入
INSERT INTO monster_species (id, name, base_hp, description, created_at, updated_at) VALUES
  ('electric_mouse', 'でんきネズミ', 35, '黄色い毛並みと長い耳が特徴的な電気タイプのモンスター。頬の電気袋から電撃を放つ。', unixepoch(), unixepoch()),
  ('fire_lizard', 'ほのおトカゲ', 40, '尻尾に炎を灯す小型の爬虫類モンスター。感情が高ぶると炎が大きくなる。', unixepoch(), unixepoch()),
  ('water_turtle', 'みずガメ', 45, '青い甲羅を持つ亀型のモンスター。甲羅から強力な水流を放つことができる。', unixepoch(), unixepoch()),
  ('grass_seed', 'くさダネ', 45, '背中に大きな球根を持つ植物型モンスター。光合成でエネルギーを蓄える。', unixepoch(), unixepoch()),
  ('rock_snake', 'いわヘビ', 50, '岩でできた巨大な蛇型モンスター。地中を自在に移動できる。', unixepoch(), unixepoch());
```

再度マイグレーションを適用：

```bash
npx wrangler d1 migrations apply monster-game-dev --local
```

### マイグレーションの実行

```bash
# 開発環境にマイグレーションを適用
npx wrangler d1 migrations apply game-database --local

# 本番環境にマイグレーションを適用
npx wrangler d1 migrations apply game-database-production --env production
```

## 6. ローカル開発

### 開発サーバーの起動

```bash
# ローカル開発サーバーを起動（ローカルD1を使用）
npx wrangler dev

# リモートD1を使用して開発サーバーを起動
npx wrangler dev --remote
```

### データベースの確認

```bash
# ローカルD1データベースの確認
npx wrangler d1 execute game-database --local --command "SELECT * FROM players"

# リモートD1データベースの確認
npx wrangler d1 execute game-database --command "SELECT * FROM players"
```

## 7. デプロイ

### 本番環境へのデプロイ

```bash
# 本番環境にデプロイ
npx wrangler deploy --env production

# または通常のデプロイ（開発環境設定を使用）
npx wrangler deploy
```

## 5. 統合テストの実装

### シンプルなテスト用エンドポイントの作成

`src/index.simple.ts`を作成して、D1接続をテスト：

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/スキーマ';

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors({ origin: '*' }));

app.get('/health', async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const result = await db.select().from(schema.モンスター種族).limit(1);
    return c.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    return c.json({ status: 'unhealthy', error: error.message }, 500);
  }
});

export default app;
```

### ローカルでのテスト実行

```bash
# 開発サーバーを起動
npx wrangler dev

# 別ターミナルでヘルスチェック
curl http://localhost:8787/health

# 期待される結果：
# {"status":"healthy","database":"connected"}
```

## 6. トラブルシューティング

### よくある問題と解決方法

1. **wrangler v4でのnode_compatエラー**
   ```
   The "node_compat" field is no longer supported as of Wrangler v4
   ```
   解決策：`compatibility_flags: ["nodejs_compat"]`を使用

2. **D1_ERROR: no such table**
   ```bash
   # データベースのテーブルを確認
   npx wrangler d1 execute monster-game-dev --local --command "SELECT name FROM sqlite_master WHERE type='table';"
   
   # マイグレーションを再適用
   npx wrangler d1 migrations apply monster-game-dev --local
   ```

3. **preview_database_idの設定**
   - ローカル開発では`preview_database_id`を使用してローカルDBを分離
   - データは`.wrangler/state/v3/d1`に保存される

## 9. 参考リンク

- [Cloudflare D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Workers バインディング API](https://developers.cloudflare.com/d1/worker-api/)
- [Wrangler 設定ガイド](https://developers.cloudflare.com/workers/wrangler/configuration/)

## 次のステップ

1. マイグレーションファイルを作成してデータベーススキーマを定義
2. Honoフレームワークを使用してAPIエンドポイントを実装
3. フロントエンドとの接続テスト
4. 本番環境へのデプロイ