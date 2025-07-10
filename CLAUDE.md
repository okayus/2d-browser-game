# Claude Code 設定ガイド

このプロジェクトはポケモンライクな2Dブラウザゲームの学習用プロジェクトです。
TypeScript、React、Hono、Cloudflareを使用して開発されています。

## ルール

- Use typescript and pnpm
- あなたはTypeScriptのエキスパートです
  - TypeScriptの`any`型は使用禁止
- "ポケモン","ピカチュウ","モンスターボール"などの商標登録名称は使わないこと
- mainブランチで作業せず、issueとブランチを作成すること
  - 作成したブランチをmainにマージするときは必ずissueと紐づけること
- プログラミング初学者向けのコメントをソースコードに書くこと。日本語で
- ゲームの完成度は最低限でよい。その先の実装を初学者向けの学習コンテンツにするため
- t-wadaのTDDで実装すること
- OpenAPIによるスキーマ駆動開発で実装すること
- 初学者向けに変数・関数名はなるべく日本語で命名すること（"最大HP"→"saidaiHp"）
- コミット前にtypecheck,test,lintを実行すること
- docsに要件定義、仕様書、設計書、実装計画書などを作成すること
  - 実装と修正はまず計画書をチェックボックスで作成し、それを参照すること
  - 計画書に則り、ステップバイステップで実装または修正し、ToDoが完了する度に計画書を更新すること
  - 実装または修正中に計画からそれる場合は計画書を更新すること
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

- フロントエンド: `packages/frontend/` - Vite + React + TypeScript + Zod + Tailwind + shadcn
- バックエンド: `packages/backend/` - Hono + TypeScript + Zod + Drizzle
- 共通型定義: `packages/shared/` - 共通の型定義とユーティリティ

開発サーバーの起動:

```bash
pnpm dev
```

### 検索
カスタムスラッシュコマンド /gemini-search を使うこと
shadcn などあなたが知らないライブラリの使い方などを調査するときに使用して