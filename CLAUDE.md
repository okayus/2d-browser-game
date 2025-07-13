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
- 初学者向けに変数・関数にJSDocを日本語で書くこと
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

## Firebase Authentication 設定

このプロジェクトではFirebase Authenticationを使用してユーザー認証を実装します。

### 概要

- **認証方式**: Firebase Authentication (Email/Password, Google)
- **JWT検証**: Community Library (Cloudflare Workers対応)
- **セッション管理**: Cloudflare KV (JWT公開鍵キャッシュ)
- **設定管理**: Workers Secrets (Firebase設定)

### 必要なリソース

#### 1. Firebase Project設定
- Firebase Console: https://console.firebase.google.com/
- Authentication設定（Email/Password、Google）
- Project ID（環境変数で設定）

#### 2. Cloudflareリソース
- **KV Namespace**: JWT公開鍵キャッシュ用
- **Workers Secrets**: Firebase Project ID等の機密情報
- **Environment Variables**: 各種設定値

#### 3. ライブラリ・ツール
- Frontend: Firebase SDK v9+
- Backend: Community JWT Library (Workers対応)
- Configuration: wrangler.jsonc

### 実装フロー

1. **バックエンド認証ミドルウェア**
   - JWT token検証
   - Firebase UIDと内部プレイヤーID関連付け
   - API保護

2. **フロントエンド認証UI**
   - ログイン/サインアップフォーム
   - 認証状態管理
   - APIリクエスト時のtoken付与

### セキュリティ考慮事項

- JWTトークンの適切な検証（exp, aud, iss, sub）
- HTTPS必須
- Firebase Admin SDKは使用不可（Node.js依存のため）
- Community libraryまたは手動JWT検証を使用

### 参考ドキュメント

- Firebase Auth Documentation: https://firebase.google.com/docs/auth
- Firebase ID Token Verification: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Cloudflare Workers KV: https://developers.cloudflare.com/kv/
- Cloudflare Workers Secrets: https://developers.cloudflare.com/workers/configuration/secrets/