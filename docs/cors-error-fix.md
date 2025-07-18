# CORSエラー調査・修正報告書

## 問題の概要

Cloudflare PagesにデプロイされたフロントエンドからバックエンドAPIへのアクセスがCORSポリシーによりブロックされていました。

### エラーメッセージ
```
Access to fetch at 'http://localhost:8787/api/players' from origin 'https://0fa50877.monster-game-frontend.pages.dev' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173' that is not equal to the supplied origin.
```

## 原因分析

### 1. 環境変数の設定不足
- フロントエンドが本番環境（Cloudflare Pages）でホストされているにも関わらず、APIクライアントがローカルホスト（`http://localhost:8787`）にリクエストを送信していた
- 原因: `.env.production`ファイルが存在せず、環境変数`VITE_API_BASE_URL`が設定されていなかった

### 2. コードベースの状況
- **フロントエンドAPIクライアント** (`packages/frontend/src/lib/api.ts`):
  ```typescript
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
  ```
  
- **バックエンドCORS設定** (`packages/backend/src/index.ts`):
  - 元々は配列形式で`https://*.pages.dev`を含んでいたが、ワイルドカードが正しく機能していなかった

## 実施した修正

### 1. 本番環境用の環境変数ファイルを作成
`packages/frontend/.env.production`を作成：
```env
# フロントエンド本番環境変数
# バックエンドAPIのURL（Cloudflare Workers）
# TODO: 実際のCloudflare WorkersのURLに変更してください
# 例: https://monster-game-api.your-account.workers.dev
VITE_API_BASE_URL=https://your-api.workers.dev
```

### 2. バックエンドのCORS設定を改善
動的なorigin検証機能を実装し、Cloudflare Pagesのすべてのサブドメインを許可：
```typescript
app.use('/*', cors({
  origin: (origin, callback) => {
    // originがない場合（同一オリジンからのリクエスト）は許可
    if (!origin) {
      return callback(null, true);
    }
    
    // 許可するオリジンのパターン
    const allowedOrigins = [
      'http://localhost:5173', // Vite開発サーバー
      'http://localhost:5174', // Vite開発サーバー
      'http://localhost:5175', // Vite開発サーバー
      'http://localhost:3000', // 代替ポート
    ];
    
    // 完全一致するオリジンがあれば許可
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Cloudflare Pagesのパターンマッチング（*.pages.dev）
    if (origin.match(/^https:\/\/[a-zA-Z0-9-]+\.pages\.dev$/)) {
      return callback(null, true);
    }
    
    // その他のオリジンは拒否
    callback(new Error('Not allowed by CORS'));
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

## 今後の対応

1. **バックエンドのデプロイ**
   - 修正したCORS設定を含むバックエンドをCloudflare Workersにデプロイする必要があります

2. **環境変数の設定**
   - `packages/frontend/.env.production`の`VITE_API_BASE_URL`を実際のCloudflare WorkersのURLに更新する必要があります
   - 例: `VITE_API_BASE_URL=https://monster-game-api.your-account.workers.dev`

3. **フロントエンドの再デプロイ**
   - 環境変数を更新した後、フロントエンドを再度Cloudflare Pagesにデプロイする必要があります

## 追加の発見事項

プロジェクトには2つの異なるAPIクライアントが存在しています：
1. `src/lib/api.ts` - Firebase認証対応、実際に使用されている
2. `src/api/client.ts` - 古いAPIクライアント、使用されていない

今後の混乱を避けるため、使用していない`src/api/client.ts`の削除を検討することをお勧めします。

## 初学者向けメモ：CORSとは

**CORS (Cross-Origin Resource Sharing)** は、ブラウザのセキュリティ機能の一つです。

### なぜCORSが必要か
- ブラウザは、異なるドメイン（オリジン）へのリクエストをデフォルトでブロックします
- これは悪意のあるサイトがユーザーの情報を盗むのを防ぐためです

### CORSの仕組み
1. ブラウザは異なるオリジンへのリクエスト前に「プリフライトリクエスト」を送信
2. サーバーは許可するオリジンを`Access-Control-Allow-Origin`ヘッダーで返答
3. ブラウザは返答を確認し、許可されていれば実際のリクエストを送信

### 今回の問題
- フロントエンド: `https://0fa50877.monster-game-frontend.pages.dev`
- バックエンド: `http://localhost:8787`（間違った設定）
- バックエンドのCORS設定: `http://localhost:5173`のみ許可

これらが一致しないため、ブラウザがリクエストをブロックしていました。