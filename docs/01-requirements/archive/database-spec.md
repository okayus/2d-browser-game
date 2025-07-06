# データベース仕様書

## 概要

このドキュメントは、モンスター収集型ゲームのデータベース構造と操作に関する仕様を定義します。

## 使用技術

- **データベース**: Cloudflare D1 (SQLite互換)
- **ORM/クエリビルダー**: なし（生のSQL使用）
- **バックエンドフレームワーク**: Hono

## データベーススキーマ

### users テーブル

ユーザーアカウント情報を管理します。

| カラム名   | 型       | 制約                      | 説明                     |
| ---------- | -------- | ------------------------- | ------------------------ |
| id         | INTEGER  | PRIMARY KEY AUTOINCREMENT | ユーザーID               |
| username   | TEXT     | UNIQUE NOT NULL           | ユーザー名               |
| password   | TEXT     | NOT NULL                  | パスワード（ハッシュ化） |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 作成日時                 |

### saves テーブル

ゲームのセーブデータを管理します。

| カラム名   | 型       | 制約                      | 説明                 |
| ---------- | -------- | ------------------------- | -------------------- |
| id         | INTEGER  | PRIMARY KEY AUTOINCREMENT | セーブID             |
| user_id    | INTEGER  | NOT NULL, FK(users.id)    | ユーザーID           |
| slot       | INTEGER  | NOT NULL, CHECK(1-3)      | セーブスロット番号   |
| data       | TEXT     | NOT NULL                  | セーブデータ（JSON） |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新日時             |

**制約**: (user_id, slot) の組み合わせはユニーク

### progress テーブル

ゲームの進行状況を管理します。

| カラム名     | 型      | 制約                      | 説明                   |
| ------------ | ------- | ------------------------- | ---------------------- |
| id           | INTEGER | PRIMARY KEY AUTOINCREMENT | プログレスID           |
| user_id      | INTEGER | NOT NULL, FK(users.id)    | ユーザーID             |
| achievements | TEXT    | DEFAULT '[]'              | 実績データ（JSON配列） |
| play_time    | INTEGER | DEFAULT 0                 | プレイ時間（秒）       |

**制約**: user_id はユニーク

## APIエンドポイント仕様

### プレイヤー関連

#### GET /api/player/:playerId

プレイヤー情報を取得します。

**レスポンス例**:

```json
{
  "id": "1",
  "name": "Player",
  "position": { "x": 7, "y": 5 },
  "direction": "down",
  "sprite": "player"
}
```

#### POST /api/player

新規プレイヤーを作成します。

**リクエスト例**:

```json
{
  "name": "新しいプレイヤー"
}
```

### セーブデータ関連

#### GET /api/saves/:userId

ユーザーの全セーブデータを取得します。

**レスポンス例**:

```json
{
  "saves": [
    {
      "slot": 1,
      "data": {
        "player": { ... },
        "currentMap": "town",
        "playTime": 3600
      },
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/saves/:userId/:slot

セーブデータを保存します。

**リクエスト例**:

```json
{
  "player": {
    "position": { "x": 5, "y": 3 },
    "direction": "up"
  },
  "currentMap": "town",
  "playTime": 1234
}
```

#### GET /api/saves/:userId/:slot

特定スロットのセーブデータを取得します。

#### DELETE /api/saves/:userId/:slot

特定スロットのセーブデータを削除します。

## 初学者向け学習ポイント

1. **SQLの基礎**

   - テーブル作成（CREATE TABLE）
   - データ挿入（INSERT）
   - データ取得（SELECT）
   - データ更新（UPDATE）
   - データ削除（DELETE）

2. **トランザクション処理**

   - 複数の操作をまとめて実行
   - エラー時のロールバック

3. **インデックスの重要性**

   - 検索速度の向上
   - 適切なインデックス設計

4. **セキュリティ**
   - SQLインジェクション対策
   - パスワードのハッシュ化
   - 認証・認可の実装
