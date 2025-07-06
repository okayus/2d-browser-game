# 🔧 技術的な注意事項

**最終更新**: 2025年7月5日  
**重要度**: 🟡 中（実装時の参考情報）

## 🏗️ アーキテクチャ上の注意点

### データベース環境分離

#### 重要な原則
1. **環境変数で分岐しない**
   ```typescript
   // ❌ 悪い例
   const db = process.env.NODE_ENV === 'production' ? d1 : sqlite;
   
   // ✅ 良い例
   const db = DatabaseFactory.create(env);
   ```

2. **アダプターインターフェースを守る**
   - 全てのアダプターは`DatabaseAdapter`インターフェースを実装
   - 新規メソッド追加時は全アダプターを更新

3. **トランザクション処理**
   - D1: `batch()`を使用
   - SQLite: `transaction()`を使用
   - Mock: 擬似的に実装（ロールバック非対応）

### 型安全性

#### any型禁止の徹底
```typescript
// ❌ 絶対NG
const data: any = await fetch(...);

// ✅ unknown → 型ガード
const data: unknown = await fetch(...);
if (isValidData(data)) {
  // dataは正しい型として扱える
}

// ✅ ジェネリクス活用
function processData<T>(data: T): T {
  return data;
}
```

#### 型アサーションの最小化
```typescript
// ❌ 避けるべき
const value = someValue as string;

// ✅ 型ガードを使用
if (typeof someValue === 'string') {
  // someValueはstring型
}

// やむを得ない場合のみアサーション
const row = result.filter(Boolean) as TableRow[];
```

## 💻 Cloudflare Workers特有の制限

### 利用できないNode.js API
```typescript
// ❌ 使えない
fs.readFileSync()
process.env
__dirname
Buffer（一部制限あり）

// ✅ 代替方法
c.env.VARIABLE      // 環境変数
importしたデータ   // ファイル読み込み
TextEncoder/Decoder // Buffer代替
```

### CPU時間制限
- 無料プラン: 10ms
- 有料プラン: 50ms
- 長時間処理は避ける

### メモリ制限
- 128MB上限
- 大量データの一括処理注意

## 🗃️ データベース設計の注意点

### D1の制限事項

#### サポートされないSQL機能
```sql
-- ❌ 使えない
WITH RECURSIVE
窓関数（一部）
ストアドプロシージャ

-- ✅ 代替案
-- 再帰はアプリケーション側で実装
-- 集計は複数クエリで対応
```

#### パフォーマンス考慮
```typescript
// ❌ N+1問題
const pokemons = await db.getAll('SELECT * FROM pokemon');
for (const pokemon of pokemons) {
  const moves = await db.getAll(`SELECT * FROM moves WHERE pokemon_id = ?`, pokemon.id);
}

// ✅ JOINまたは一括取得
const result = await db.getAll(`
  SELECT p.*, m.*
  FROM pokemon p
  LEFT JOIN moves m ON p.id = m.pokemon_id
`);
```

### マイグレーション戦略

#### 順序性の維持
```
migrations/
├── 0001_initial.sql
├── 0002_players.sql
├── 0003_items.sql
└── 0004_pokemon.sql
```

#### ロールバック考慮
```sql
-- マイグレーションファイルに含める
-- UP
CREATE TABLE new_table (...);

-- DOWN（コメントで記載）
-- DROP TABLE new_table;
```

## 🧪 テスト実装の注意点

### モックの適切な使用

#### SimplifiedMockAdapter
```typescript
// 特徴
- SQL構文の簡易パース
- メモリ内データ操作
- トランザクション模擬

// 制限
- 複雑なSQL非対応
- インデックス効果なし
- 同時実行制御なし
```

### テストデータの管理
```typescript
// ✅ 各テストで独立したデータ
beforeEach(() => {
  db.exec('DELETE FROM players');
  db.exec('INSERT INTO players ...');
});

// ❌ テスト間でデータ共有
// グローバルなテストデータは避ける
```

## 🚀 パフォーマンス最適化

### バンドルサイズ削減

#### Tree Shaking活用
```typescript
// ❌ 全体インポート
import * as utils from './utils';

// ✅ 必要な関数のみ
import { specificFunction } from './utils';
```

#### 動的インポート
```typescript
// 重い処理は遅延ロード
const heavyModule = await import('./heavy-module');
```

### レスポンス最適化

#### キャッシュ活用
```typescript
// Cache-Controlヘッダー設定
return c.json(data, {
  headers: {
    'Cache-Control': 'public, max-age=3600'
  }
});
```

#### ページネーション実装
```typescript
// 大量データは分割
const page = parseInt(c.req.query('page') || '1');
const limit = 20;
const offset = (page - 1) * limit;
```

## 🔐 セキュリティ考慮事項

### 入力値検証

#### SQLインジェクション対策
```typescript
// ❌ 危険
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ パラメータバインディング
const query = 'SELECT * FROM users WHERE id = ?';
db.prepare(query).bind(userId);
```

#### 型検証
```typescript
// Zodを使用した検証（予定）
const schema = z.object({
  name: z.string().min(1).max(100),
  level: z.number().int().min(1).max(100)
});
```

### 認証・認可

#### 現在の状態
- 認証システム未実装
- 全APIが公開状態

#### 将来の実装予定
- JWT認証
- ロールベースアクセス制御
- APIレート制限

## 📝 コーディング規約

### 命名規則の詳細

#### 日本語命名の使い分け
```typescript
// ビジネスロジック: 日本語
const プレイヤー情報取得 = async () => {};
const ポケモン捕獲処理 = () => {};

// 技術的な処理: 英語
const parseSQL = () => {};
const validateInput = () => {};
```

#### ファイル名規則
```
routes/pokemon.ts      // 英語（単数形）
db/playerRepository.ts // 英語（キャメルケース）
types/env.ts          // 英語（小文字）
```

### コメント規約

#### 必須コメント
```typescript
// 初学者向け：この関数の目的を説明
export const 複雑な処理 = () => {
  // 初学者向け：なぜこの処理が必要か
  // 初学者向け：どのような値が期待されるか
};
```

#### 型定義のコメント
```typescript
export interface PlayerData {
  /** プレイヤーの一意識別子 */
  id: string;
  /** プレイヤー名（最大20文字） */
  name: string;
  /** 現在のマップ上の座標 */
  position: { x: number; y: number };
}
```

## 🔄 継続的改善

### 技術的負債の管理

#### 現在の負債
1. SimplifiedMockAdapterの型定義
2. ItemRepositoryテストの不整合
3. Drizzle移行の未完了

#### 改善計画
- 定期的なリファクタリング
- テストカバレッジ向上
- ドキュメント更新

### モニタリング項目

#### パフォーマンス指標
- API応答時間
- ビルドサイズ
- テスト実行時間

#### 品質指標
- TypeScriptエラー数
- ESLint警告数
- テストカバレッジ率

---

*この技術ノートは、実装時の参考情報として継続的に更新されます。*