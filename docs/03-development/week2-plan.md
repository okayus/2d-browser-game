# Week2 実装計画 - モンスターCRUD API実装

## 🎯 Week2の目標

Week1で構築した基盤の上に、モンスター管理機能のバックエンドAPIを実装します。

### 実装予定機能
1. **モンスター種族マスタデータ投入**
2. **モンスター獲得API（Create）**
3. **モンスター一覧API（Read）**
4. **ニックネーム変更API（Update）**
5. **モンスター解放API（Delete）**
6. **プレイヤー作成時の初期モンスター付与**

## 📋 実装タスク詳細

### 1. データベース初期化

#### 1.1 モンスター種族マスタ投入
```typescript
// packages/backend/src/db/seed.ts
const 初期モンスター種族 = [
  { id: '1', 名前: 'でんきネズミ', 基礎HP: 35, レアリティ: 'common' },
  { id: '2', 名前: 'ほのおトカゲ', 基礎HP: 40, レアリティ: 'common' },
  { id: '3', 名前: 'みずガメ', 基礎HP: 45, レアリティ: 'rare' },
  { id: '4', 名前: 'くさモグラ', 基礎HP: 30, レアリティ: 'common' },
  { id: '5', 名前: 'いわゴーレム', 基礎HP: 50, レアリティ: 'rare' }
];
```

### 2. API実装

#### 2.1 モンスター獲得API
**POST /api/players/:playerId/monsters**

リクエスト:
```json
{
  "種族ID": "1"
}
```

レスポンス:
```json
{
  "成功": true,
  "データ": {
    "id": "monster-uuid",
    "プレイヤーID": "player-uuid",
    "種族": {
      "id": "1",
      "名前": "でんきネズミ",
      "レアリティ": "common"
    },
    "ニックネーム": "でんきネズミ",
    "現在HP": 35,
    "最大HP": 35,
    "捕獲日時": "2025-07-06T10:00:00Z"
  }
}
```

#### 2.2 モンスター一覧API
**GET /api/players/:playerId/monsters**

クエリパラメータ:
- `sort`: 'captured_at' | 'name' | 'hp' (デフォルト: 'captured_at')
- `order`: 'asc' | 'desc' (デフォルト: 'desc')
- `種族ID`: フィルタリング用（オプション）

レスポンス:
```json
{
  "成功": true,
  "データ": [
    {
      "id": "monster-uuid",
      "種族": { ... },
      "ニックネーム": "ピカ",
      "現在HP": 30,
      "最大HP": 35,
      "捕獲日時": "2025-07-06T10:00:00Z"
    }
  ],
  "件数": 5
}
```

#### 2.3 ニックネーム変更API
**PUT /api/monsters/:monsterId**

リクエスト:
```json
{
  "ニックネーム": "新しい名前"
}
```

#### 2.4 モンスター解放API
**DELETE /api/monsters/:monsterId**

レスポンス:
```json
{
  "成功": true,
  "メッセージ": "モンスターを解放しました"
}
```

### 3. プレイヤー作成の拡張

#### 3.1 初期モンスター付与
プレイヤー作成時に自動的にランダムな初期モンスターを1体付与：

```typescript
// プレイヤー作成処理に追加
const ランダム種族 = ['1', '2', '4'][Math.floor(Math.random() * 3)];
await 所持モンスター作成({
  プレイヤーID: 新規プレイヤー.id,
  種族ID: ランダム種族
});
```

### 4. 共通型定義の拡張

#### 4.1 新規スキーマ追加
```typescript
// packages/shared/src/types/モンスタースキーマ.ts

// 所持モンスター作成
export const 所持モンスター作成スキーマ = z.object({
  種族ID: z.string().uuid()
});

// ニックネーム更新
export const ニックネーム更新スキーマ = z.object({
  ニックネーム: z.string().min(1).max(20)
});

// 一覧取得クエリ
export const モンスター一覧クエリスキーマ = z.object({
  sort: z.enum(['captured_at', 'name', 'hp']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  種族ID: z.string().uuid().optional()
});
```

### 5. エラーハンドリング

#### 5.1 バリデーションエラー
- プレイヤーが存在しない場合: 404
- 種族IDが無効な場合: 400
- ニックネームが長すぎる場合: 400

#### 5.2 権限チェック
- 他のプレイヤーのモンスターは操作不可: 403
- 存在しないモンスター: 404

### 6. テスト実装

#### 6.1 単体テスト
```typescript
// packages/backend/src/__tests__/monsters.test.ts
describe('モンスターAPI', () => {
  test('モンスター獲得が正常に動作する', async () => {
    // プレイヤー作成
    // モンスター獲得
    // レスポンス検証
  });
  
  test('ニックネーム変更が正常に動作する', async () => {
    // モンスター作成
    // ニックネーム変更
    // 変更確認
  });
});
```

## 🚀 開発手順

### Day 1-2: データベース準備
1. [ ] seed.tsファイル作成
2. [ ] モンスター種族データ投入スクリプト
3. [ ] マイグレーション実行確認

### Day 3-4: API実装
1. [ ] モンスター獲得API
2. [ ] モンスター一覧API
3. [ ] ニックネーム変更API
4. [ ] モンスター解放API

### Day 5: プレイヤー機能拡張
1. [ ] 初期モンスター付与機能
2. [ ] プレイヤー詳細にモンスター数追加

### Day 6-7: テスト・統合
1. [ ] 単体テスト作成
2. [ ] API統合テスト
3. [ ] エラーケーステスト

## 📝 注意事項

### 初学者向けポイント
- **日本語変数名**: 一貫性を保つ
- **詳細なコメント**: 各処理の意図を明記
- **エラーメッセージ**: 日本語で分かりやすく

### 技術的配慮
- **トランザクション**: 複数テーブル更新時は必須
- **N+1問題**: JOINを適切に使用
- **型安全性**: Zodスキーマを活用

## 🎯 Week2完了基準

### 機能要件
- [ ] 全APIエンドポイントが動作
- [ ] エラーハンドリング実装
- [ ] 初期モンスター付与機能

### 品質要件
- [ ] TypeScriptエラー: 0件
- [ ] ESLintエラー: 0件
- [ ] テストカバレッジ: 主要フロー網羅

### ドキュメント
- [ ] API仕様書更新
- [ ] 実装メモ追加
- [ ] 学習ポイント記載

## 🔄 Week3への引き継ぎ事項

Week2完了後、Week3では以下を実装：
- フロントエンドのモンスター管理UI
- バトルシステムの基礎
- モンスター獲得フロー

## 📚 参考資料

- [Drizzle ORM Relations](https://orm.drizzle.team/docs/relations)
- [Hono Validation](https://hono.dev/guides/validation)
- [Zod Schema Composition](https://zod.dev/?id=schema-composition)