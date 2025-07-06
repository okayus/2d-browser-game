# Claude Code 設定ガイド

このプロジェクトはポケモンライクな2Dブラウザゲームの学習用プロジェクトです。
TypeScript、React、Hono、Cloudflareを使用して開発されています。

## ルール

- Use typescript and pnpm
- あなたはTypeScriptのエキスパートです。
- "ポケモン","ピカチュウ","モンスターボール"などの商標登録名称は使わないこと。
- mainブランチで作業せず、issueとブランチを作成すること
- 作成したブランチをmainにマージするときは必ずissueと紐づけること
- プログラミング初学者向けのコメントをソースコードに書くこと。日本語で
- ゲームの完成度は最低限でよい。その先の実装を初学者向けの学習コンテンツにするため
- t-wadaのTDDで実装すること
- 初学者向けに変数・関数名はなるべく日本語で命名すること
- docsに要件定義、仕様書、設計書、実装計画書などを作成すること
- 実装と修正はまず計画書をチェックボックスで作成し、それを参照すること
- 計画書に則り、ステップバイステップで実装または修正し、ToDoが完了する度に計画書を更新すること
- 実装または修正中に計画からそれる場合は計画書を更新すること
- TypeScriptの`any`型は使用禁止。適切な型定義を行うこと
- フロントエンドはGridでレイアウトすること

## バックエンド実装ルール

- バックエンドの実装は設計とドキュメント作成から始めること
- Mermaid記法を使用してシーケンス図、ER図、フローチャートを作成すること
- データベース設計は必ずER図から始め、正規化を適切に行うこと
- API設計はOpenAPI仕様書とシーケンス図で明確に定義すること
- 初学者向けに設計思想と実装理由を詳細に文書化すること

## MCPサーバー設定

このプロジェクトには以下のCloudflare MCPサーバーが設定されています：

### 1. Cloudflare Documentation Server

- **名前**: cloudflare
- **用途**: Cloudflareのドキュメントを検索
- **使用例**:
  ```
  @cloudflare で Workers のコストについて教えて
  @cloudflare で Workers Analytics Engine のインデックス数の制限は？
  @cloudflare で Workers AutoRAG バインディングの使い方を教えて
  ```

### 2. Cloudflare Workers Bindings Server

- **名前**: workers-bindings
- **用途**: Cloudflareリソースの管理（アカウント、KV、Workers、R2、D1、Hyperdrive）
- **使用例**:
  ```
  @workers-bindings でアカウント一覧を表示
  @workers-bindings でKVネームスペース一覧を表示
  @workers-bindings でWorkers一覧を表示
  @workers-bindings でR2バケット一覧を表示
  @workers-bindings でD1データベース一覧を表示
  ```

## プロジェクトのデプロイ

このプロジェクトはCloudflareにデプロイすることを前提としています。
MCPサーバーを使用してCloudflareのドキュメントを参照しながら、以下の設定を行うことができます：

1. Workers の設定とデプロイ
2. KV ネームスペースの作成と管理
3. R2 バケットの設定（必要に応じて）
4. D1 データベースの設定（必要に応じて）

## 開発時の注意事項

- フロントエンド: `packages/frontend/` - Vite + React + TypeScript
- バックエンド: `packages/backend/` - Hono + TypeScript
- 共通型定義: `packages/shared/` - 共通の型定義とユーティリティ

開発サーバーの起動:

```bash
pnpm dev
```

## フロントエンドのデバッグ

### Playwrightを使用したブラウザテスト・デバッグ

このプロジェクトではPlaywrightを使用してブラウザでの動作確認とデバッグを行っています。
特にUIの問題やユーザーインタラクションの不具合を特定する際に有効です。

#### Playwrightの基本的な使用方法

**1. 開発サーバーを起動:**

```bash
# バックグラウンドで開発サーバーを起動
pnpm dev &
```

**2. ブラウザでページにアクセス:**

```javascript
// ホームページにアクセス
await page.goto('http://localhost:5173/');

// マップページに直接アクセス
await page.goto('http://localhost:5173/map/始まりの町?x=10&y=7');
```

**3. ページの状態を確認:**

```javascript
// ページのスナップショットを取得
await browser_snapshot();

// 特定の要素をクリック
await browser_click('新しいゲームを開始ボタン', 'e9');

// キーボード操作をシミュレート
await browser_press_key('ArrowRight');
```

**4. コンソールログの確認:**

```javascript
// ブラウザのコンソールメッセージを取得
await browser_console_messages();
```

#### 実際のデバッグシナリオ例

**問題: プレイヤーが矢印キーで移動しない**

```javascript
// 1. マップページにアクセス
await page.goto('http://localhost:5173/map/始まりの町?x=10&y=7');

// 2. 初期状態を確認
const snapshot = await browser_snapshot();
// 現在地表示を確認: "現在地: はじまりの町 (10, 7)"

// 3. 矢印キーを押す
await browser_press_key('ArrowRight');

// 4. 結果を確認
const newSnapshot = await browser_snapshot();
// 期待: "現在地: はじまりの町 (11, 7)"

// 5. コンソールログを確認
const logs = await browser_console_messages();
// 期待ログ: "プレイヤー移動が呼ばれました: {方向: '右'}"
```

**問題: URLルーティングで404エラー**

```javascript
// 1. 日本語マップIDでアクセス
await page.goto('http://localhost:5173/map/始まりの町');

// 2. 404ページが表示されないことを確認
const snapshot = await browser_snapshot();
// 404ページではなく、正常なマップページが表示されることを確認

// 3. URLエンコードされたケースもテスト
await page.goto('http://localhost:5173/map/%E5%A7%8B%E3%81%BE%E3%82%8A%E3%81%AE%E7%94%BA');
```

#### デバッグ時の推奨手順

1. **症状の再現**

   ```javascript
   // 問題となっている操作を再現
   await browser_click('問題のボタン', 'ref');
   await browser_press_key('ArrowUp');
   ```

2. **状態の確認**

   ```javascript
   // ページの現在状態をキャプチャ
   await browser_snapshot();
   ```

3. **ログの分析**

   ```javascript
   // ブラウザコンソールでエラーや期待するログを確認
   await browser_console_messages();
   ```

4. **要素の検証**
   ```javascript
   // 特定の要素が正しく表示されているか確認
   const snapshot = await browser_snapshot();
   // スナップショット内で要素を探す
   ```

#### トラブルシューティングでのPlaywright活用

**症状別のデバッグアプローチ:**

- **UI表示の問題**: `browser_snapshot()` でビジュアル確認
- **インタラクションの問題**: `browser_press_key()` や `browser_click()` で操作再現
- **JavaScript エラー**: `browser_console_messages()` でログ確認
- **ページ遷移の問題**: `browser_navigate()` で遷移テスト

**初学者向けのデバッグプロセス:**

1. **問題の分離**: 最小限の操作で問題を再現
2. **ログ確認**: コンソールメッセージで内部状態を把握
3. **段階的テスト**: 一つずつ操作して問題箇所を特定
4. **修正の検証**: 修正後に同じ操作で改善を確認

#### 注意事項

- **開発サーバーの起動**: Playwrightテスト前に必ず開発サーバーを起動
- **ポート番号の確認**: デフォルトは `http://localhost:5173/`
- **タイムアウト**: ページ読み込みやアニメーションの待機時間を考慮
- **日本語URL**: エンコード/デコードの問題に注意

この方法により、ブラウザ上での実際のユーザー体験を正確に再現し、
効率的にフロントエンドの問題を特定・解決することができます。
