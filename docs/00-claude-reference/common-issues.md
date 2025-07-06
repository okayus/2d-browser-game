# 🐛 よくある問題と解決策

**最終更新**: 2025年7月5日  
**重要度**: 🟡 中（トラブルシューティング時に参照）

## 🔴 緊急度: 高

### 1. CI/CDパイプライン失敗

#### TypeScriptの型エラー
**症状**: 
```
error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string | number | boolean | null'
```

**原因**: SimplifiedMockAdapterでのパラメータバインディング型不整合

**解決策**:
```typescript
// 修正前
newRow[column] = this.boundParams[index];

// 修正後
newRow[column] = this.boundParams[index] as string | number | boolean | null | undefined;
```

#### ESLint any型警告
**症状**:
```
ESLint found 38 warnings (maximum: 0)
```

**原因**: CLAUDE.mdルールでany型禁止

**解決策**:
1. 具体的な型を定義
2. unknownを使用して段階的に型を絞る
3. 型アサーションは最小限に

### 2. テスト失敗

#### ItemRepositoryテスト
**症状**: 3テスト失敗（期待値と実際の値の不一致）

**原因**: テストデータとモックアダプターの不整合

**解決策**:
```typescript
// テストデータを実際の動作に合わせる
expect(result.カテゴリ).toBe('かいふく'); // 期待値を修正
```

#### MockD1Database互換性問題
**症状**: 338テスト失敗

**原因**: prepare().bind()チェーン未実装

**解決策**: SimplifiedMockAdapter作成（完全互換実装）

## 🟡 緊急度: 中

### 3. データベース接続エラー

#### D1接続エラー（本番環境）
**症状**:
```
Error: D1_ERROR: no such table: players
```

**原因**: マイグレーション未実行

**解決策**:
```bash
# 各マイグレーションファイルを実行
npx wrangler d1 execute pokemon-game-db --file=./migrations/0001_initial.sql
npx wrangler d1 execute pokemon-game-db --file=./migrations/0002_players.sql
# ... 以降同様
```

#### SQLiteエラー（開発環境）
**症状**:
```
Error: Cannot find module 'better-sqlite3'
```

**原因**: ネイティブモジュールのビルド失敗

**解決策**:
```bash
# 再インストール
cd packages/backend
pnpm rebuild better-sqlite3

# または完全再インストール
rm -rf node_modules
pnpm install
```

### 4. 環境変数の問題

#### 環境変数が読み込まれない
**症状**: `process.env.ENVIRONMENT`がundefined

**原因**: Cloudflare Workers環境ではprocess.envが使えない

**解決策**:
```typescript
// Honoのコンテキストから取得
app.get('/test', (c) => {
  const env = c.env.ENVIRONMENT; // ✅ 正しい
  // const env = process.env.ENVIRONMENT; // ❌ 間違い
});
```

## 🟢 緊急度: 低

### 5. 開発環境の問題

#### ポート競合
**症状**:
```
Error: listen EADDRINUSE: address already in use :::8787
```

**解決策**:
```bash
# プロセス確認
lsof -i :8787
# プロセス終了
kill -9 <PID>
# または別ポート使用
PORT=8788 pnpm dev
```

#### pnpm-lock.yaml不整合
**症状**:
```
ERR_PNPM_LOCKFILE_CONFIG_MISMATCH
```

**解決策**:
```bash
# lockfile再生成
rm pnpm-lock.yaml
pnpm install
```

### 6. Drizzle ORM関連

#### drizzle-zod型エラー
**症状**: createInsertSchema関数の型エラー

**原因**: バージョン互換性問題

**対応**: 一時的にZod統合を無効化

#### マイグレーション生成エラー
**症状**: `drizzle-kit generate`が失敗

**解決策**:
```bash
# 設定ファイル確認
cat drizzle.config.ts
# スキーマファイルパス確認
ls src/db/schema/
```

## 💡 予防策

### 1. 開発前チェックリスト
- [ ] `git pull`で最新取得
- [ ] `pnpm install`で依存関係更新
- [ ] `pnpm test`でテスト確認
- [ ] `pnpm typecheck`で型チェック

### 2. コミット前チェックリスト
- [ ] `pnpm lint`でLintエラーなし
- [ ] `pnpm test`で全テスト成功
- [ ] `pnpm build`でビルド成功
- [ ] 不要なconsole.log削除

### 3. デバッグTips

#### ログ出力強化
```typescript
// 開発環境のみ詳細ログ
if (c.env.ENVIRONMENT === 'development') {
  console.log('詳細情報:', JSON.stringify(data, null, 2));
}
```

#### エラーハンドリング改善
```typescript
try {
  // 処理
} catch (error) {
  console.error('エラー詳細:', {
    message: error.message,
    stack: error.stack,
    context: { /* 関連情報 */ }
  });
  throw error;
}
```

## 🔧 便利なデバッグコマンド

### データベース確認
```bash
# テーブル一覧
npx wrangler d1 execute pokemon-game-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# データ確認
npx wrangler d1 execute pokemon-game-db --local --command="SELECT * FROM players LIMIT 10;"
```

### TypeScript型確認
```bash
# 特定ファイルの型情報
npx tsc --noEmit --listFiles | grep simplifiedMockAdapter

# 型定義の生成
npx tsc --declaration --emitDeclarationOnly
```

### パフォーマンス分析
```bash
# ビルド時間計測
time pnpm build

# バンドルサイズ確認
du -sh packages/backend/dist
du -sh packages/frontend/dist
```

## 📚 参考リンク

### 公式ドキュメント
- [Cloudflare Workers Troubleshooting](https://developers.cloudflare.com/workers/platform/troubleshooting/)
- [TypeScript Error Messages](https://www.typescriptlang.org/docs/handbook/2/understanding-errors.html)
- [ESLint Rules](https://eslint.org/docs/rules/)

### プロジェクト固有
- [troubleshooting.md](/docs/troubleshooting.md) - 詳細なトラブルシューティング
- [work-history.md](./work-history.md) - 過去の問題と解決履歴

## ⚠️ 既知の未解決問題

1. **ItemRepositoryテスト失敗（3件）**
   - 一時的にスキップ中
   - Drizzle移行で解決予定

2. **Drizzle型定義の重複**
   - database.tsとdrizzleDatabase.tsの統合必要

3. **CI環境でのTypeScriptエラー**
   - ローカルでは発生しない
   - Node.jsバージョンの差異が原因の可能性

---

*このドキュメントは、開発中に遭遇する問題を素早く解決するためのリファレンスです。*