# 📋 MVP実装計画書 - モンスターCRUD機能

**作成日**: 2025年7月6日  
**バージョン**: v1.0  
**ステータス**: 実装中

## 🎯 実装目標

モンスター収集型ゲームのMVPとして、所持モンスターのCRUD操作を実装します。
- **C**: バトルでモンスターゲット
- **R**: ゲットしたモンスターを確認
- **U**: ゲットしたモンスターのニックネーム変更
- **D**: ゲットしたモンスターを逃がす

## 📅 実装スケジュール（4週間）

### Week 1: 基盤構築
- [ ] プロジェクトセットアップ
- [ ] データベーススキーマ作成
- [ ] 基本的なAPI実装（プレイヤー作成）
- [ ] フロントエンドルーティング設定

### Week 2: CRUD API実装
- [ ] モンスター獲得API（Create）
- [ ] モンスター一覧API（Read）
- [ ] ニックネーム変更API（Update）
- [ ] モンスター解放API（Delete）

### Week 3: UI実装
- [ ] スタート画面
- [ ] モンスター一覧画面
- [ ] バトル画面
- [ ] 編集・削除機能のUI

### Week 4: 統合・デプロイ
- [ ] フロントエンド・バックエンド統合
- [ ] エラーハンドリング強化
- [ ] Cloudflareへのデプロイ
- [ ] 動作確認・バグ修正

## 🔧 技術実装計画

### 1. プロジェクトセットアップ

#### 1.1 環境設定
- [ ] Node.js 18+ のインストール確認
- [ ] pnpm の設定
- [ ] TypeScript strict mode の設定
- [ ] ESLint + Prettier の設定

#### 1.2 モノレポ構成
```
packages/
├── frontend/     # React + TypeScript
├── backend/      # Hono API
└── shared/       # 共通型定義
```

#### 1.3 開発環境
- [ ] `pnpm dev` で開発サーバー起動
- [ ] Hot reload の設定
- [ ] 環境変数の管理（.env）

### 2. データベース設計・実装

#### 2.1 スキーマ作成
```sql
-- プレイヤーテーブル
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- モンスター種族マスタ
CREATE TABLE monster_species (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_hp INTEGER NOT NULL,
  rarity TEXT NOT NULL
);

-- 所持モンスターテーブル
CREATE TABLE owned_monsters (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  species_id TEXT NOT NULL,
  nickname TEXT,
  current_hp INTEGER NOT NULL,
  max_hp INTEGER NOT NULL,
  captured_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (species_id) REFERENCES monster_species(id)
);
```

#### 2.2 マイグレーション
- [ ] Drizzle ORM の設定
- [ ] 開発環境（SQLite）の設定
- [ ] 本番環境（Cloudflare D1）の設定
- [ ] 初期データの投入

#### 2.3 初期データ作成
```sql
-- モンスター種族データ
INSERT INTO monster_species (id, name, base_hp, rarity) VALUES
  ('1', 'でんきネズミ', 35, 'common'),
  ('2', 'ほのおトカゲ', 40, 'common'),
  ('3', 'みずガメ', 45, 'rare');
```

### 3. バックエンドAPI実装

#### 3.1 プレイヤー管理
- [ ] **POST /api/players** - プレイヤー作成
  - 名前のバリデーション（3-20文字）
  - 初期モンスター1体を自動付与
  - レスポンス: プレイヤーID + 初期モンスター情報

- [ ] **GET /api/players/:id** - プレイヤー情報取得
  - プレイヤーの基本情報
  - 所持モンスター数

#### 3.2 モンスター管理
- [ ] **POST /api/players/:playerId/monsters** - モンスター獲得
  - 種族IDを指定して獲得
  - デフォルト名で保存
  - HP情報の初期化

- [ ] **GET /api/players/:playerId/monsters** - 所持モンスター一覧
  - ソート機能（獲得日時順）
  - 種族別フィルタ機能
  - ページネーション（将来対応）

- [ ] **PUT /api/monsters/:monsterId** - モンスター情報更新
  - ニックネーム変更（1-20文字）
  - バリデーション実装

- [ ] **DELETE /api/monsters/:monsterId** - モンスター削除
  - 物理削除（論理削除は将来検討）
  - カスケード削除の確認

#### 3.3 バトル機能
- [ ] **POST /api/battles** - バトル開始
  - ランダムな野生モンスター生成
  - バトル状態の管理

- [ ] **PUT /api/battles/:battleId/action** - バトルアクション
  - たたかう・つかまえる・にげる
  - ダメージ計算・捕獲判定

#### 3.4 エラーハンドリング
- [ ] Zodによる入力値バリデーション
- [ ] 適切なHTTPステータスコード
- [ ] 日本語エラーメッセージ
- [ ] ログ出力の実装

### 4. フロントエンド実装

#### 4.1 ルーティング設定
```typescript
// React Router構成
/                    # スタート画面
/game/:playerId      # メインゲーム画面
/battle/:battleId    # バトル画面
```

#### 4.2 コンポーネント設計
```
components/
├── pages/
│   ├── StartPage.tsx        # スタート画面
│   ├── GamePage.tsx         # メインゲーム画面
│   └── BattlePage.tsx       # バトル画面
├── monsters/
│   ├── MonsterCard.tsx      # モンスターカード
│   ├── MonsterList.tsx      # モンスター一覧
│   └── MonsterEditModal.tsx # 編集モーダル
├── ui/
│   ├── Button.tsx           # ボタンコンポーネント
│   ├── Input.tsx            # 入力フィールド
│   └── Modal.tsx            # モーダル
└── layout/
    ├── Header.tsx           # ヘッダー
    └── Layout.tsx           # レイアウト
```

#### 4.3 状態管理
- [ ] useState/useEffect による基本的な状態管理
- [ ] カスタムフックの作成
```typescript
// カスタムフック例
usePlayer(playerId)     # プレイヤー情報
useMonsters(playerId)   # モンスター一覧
useBattle(battleId)     # バトル状態
```

#### 4.4 API通信
- [ ] fetch APIによる通信
- [ ] エラーハンドリング
- [ ] ローディング状態の管理
```typescript
// API関数例
const api = {
  createPlayer: (name: string) => Promise<Player>,
  getMonsters: (playerId: string) => Promise<Monster[]>,
  updateMonster: (id: string, data: UpdateMonsterData) => Promise<Monster>,
  deleteMonster: (id: string) => Promise<void>
};
```

#### 4.5 UI実装
- [ ] **スタート画面**
  - プレイヤー名入力フォーム
  - バリデーション表示
  - ゲーム開始ボタン

- [ ] **メインゲーム画面**
  - Grid Layoutによる響応的なレイアウト
  - モンスター一覧表示
  - バトル開始ボタン

- [ ] **モンスターカード**
  - モンスター情報表示
  - ニックネーム編集機能
  - 削除ボタン

- [ ] **バトル画面**
  - 敵モンスター表示
  - アクションボタン
  - バトル結果表示

#### 4.6 スタイリング
- [ ] Tailwind CSSの基本設定
- [ ] Shadcn/uiコンポーネントの導入
- [ ] レスポンシブデザイン
- [ ] ダークモード対応（将来）

### 5. 統合・テスト

#### 5.1 API統合テスト
- [ ] 各エンドポイントの動作確認
- [ ] エラーケースの確認
- [ ] データの整合性確認

#### 5.2 フロントエンド統合
- [ ] API通信の確認
- [ ] ユーザーフロー全体の動作確認
- [ ] レスポンシブデザインの確認

#### 5.3 E2Eテスト
- [ ] Playwrightによるテスト
- [ ] 主要なユーザーシナリオの自動化
```typescript
// E2Eテスト例
test('モンスターCRUDフロー', async ({ page }) => {
  // プレイヤー作成
  await page.goto('/');
  await page.fill('input[name="playerName"]', 'テストプレイヤー');
  await page.click('button[type="submit"]');
  
  // モンスター一覧確認
  await expect(page.locator('[data-testid="monster-card"]')).toHaveCount(1);
  
  // バトル・獲得
  await page.click('button[data-testid="battle-start"]');
  await page.click('button[data-testid="battle-capture"]');
  
  // ニックネーム変更
  await page.click('[data-testid="monster-edit"]');
  await page.fill('input[name="nickname"]', 'ピカ');
  await page.click('button[data-testid="save"]');
  
  // 削除
  await page.click('[data-testid="monster-delete"]');
  await page.click('button[data-testid="confirm-delete"]');
});
```

### 6. デプロイ・運用

#### 6.1 Cloudflareデプロイ
- [ ] Cloudflare Pagesの設定
- [ ] Cloudflare Workersの設定
- [ ] D1データベースの設定
- [ ] 環境変数の設定

#### 6.2 CI/CD設定
- [ ] GitHub Actionsの設定
- [ ] テスト自動実行
- [ ] 自動デプロイ設定

#### 6.3 監視・ログ
- [ ] 基本的なエラーログ
- [ ] パフォーマンスモニタリング
- [ ] 使用状況の確認

## 📊 進捗管理

### 進捗確認方法
- [ ] 各週末に進捗レビュー
- [ ] 課題・ブロッカーの早期発見
- [ ] スケジュール調整の検討

### 品質管理
- [ ] コードレビューの実施
- [ ] テストカバレッジの確認
- [ ] TypeScript型エラーの解消

### ドキュメント更新
- [ ] 実装に合わせて仕様書更新
- [ ] README.mdの更新
- [ ] API仕様書の更新

## 🚨 リスク管理

### 技術的リスク
1. **Cloudflare制限の回避**
   - 対策: 効率的なクエリ設計
   - 監視: リクエスト数の定期確認

2. **データベース設計の変更**
   - 対策: マイグレーション戦略の準備
   - 監視: パフォーマンス測定

3. **フロントエンド・バックエンドの連携**
   - 対策: 早期統合・継続的テスト
   - 監視: API互換性の確認

### スケジュールリスク
1. **実装の遅延**
   - 対策: 機能の優先順位付け
   - 監視: 週次進捗確認

2. **品質問題の発生**
   - 対策: 定期的なコードレビュー
   - 監視: テスト結果の確認

## 🎯 成功基準

### 機能基準
- [ ] プレイヤー作成・モンスター初期付与
- [ ] バトル・モンスター獲得
- [ ] モンスター一覧表示
- [ ] ニックネーム変更
- [ ] モンスター削除

### 品質基準
- [ ] TypeScript型エラー: 0件
- [ ] ESLintエラー: 0件
- [ ] E2Eテスト: 主要フロー通過
- [ ] Cloudflareデプロイ: 正常動作

### 学習基準
- [ ] CRUD操作の理解
- [ ] API設計の理解
- [ ] React状態管理の理解
- [ ] データベース設計の理解

## 📚 参考リソース

### 技術ドキュメント
- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [React Documentation](https://react.dev/)

### 初学者向けリソース
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [REST API Design Guidelines](https://restfulapi.net/)
- [Database Design Best Practices](https://www.freecodecamp.org/news/database-design-best-practices/)

## 🔄 定期レビュー

### 週次レビュー項目
- [ ] 実装進捗の確認
- [ ] 技術課題の共有
- [ ] 次週の計画調整
- [ ] 学習効果の確認

### 月次レビュー項目
- [ ] 全体スケジュールの見直し
- [ ] 技術スタック選択の評価
- [ ] 学習コンテンツとしての改善点
- [ ] 次フェーズの計画検討