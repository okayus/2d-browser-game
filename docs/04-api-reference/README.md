# 📖 API仕様書

このディレクトリには、APIの詳細仕様を配置します。

## 📁 ファイル構成

- **openapi.yaml** - OpenAPI仕様書（Swagger）
- **endpoints/** - エンドポイント別の詳細仕様
- **examples/** - リクエスト/レスポンスの実例

## 🎯 目的

- APIの仕様を正確に文書化
- フロントエンド開発者への情報提供
- API利用者向けのリファレンス
- 自動テストの基準

## 🔧 使用方法

### OpenAPI仕様書の閲覧
```bash
# Swagger UIでの閲覧
npx @redocly/openapi-cli preview-docs openapi.yaml
```

### エンドポイント仕様
各エンドポイントの詳細は `endpoints/` ディレクトリ内の個別ファイルを参照

### 実装例
`examples/` ディレクトリに各APIの使用例を記載

## 📝 更新ルール

- APIの変更時は必ず仕様書も更新
- 破壊的変更は事前にレビュー必須
- バージョニング戦略に従う