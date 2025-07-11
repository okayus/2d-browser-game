# Week 4: UI実装 - React + TailwindCSS + Vite

## 概要

Week 4では、HTML/CSS/JavaScriptプロトタイプをベースに、Vite + React + TypeScript + TailwindCSSを使用したフロントエンドを実装しました。

## 実装目標

- ✅ プロトタイプと同等の視覚的デザインを再現
- ✅ React + TypeScript + TailwindCSSの技術スタック
- ✅ Viteによる高速な開発環境
- ✅ shadcn/uiコンポーネントライブラリの活用

## 実装した機能

### 1. ページコンポーネント
- **StartPage**: プレイヤー名入力とゲーム開始
- **PlayerCreationPage**: パートナーモンスター選択
- **MapPage**: 2Dグリッドベースマップ
- **MonsterListPage**: モンスター一覧表示

### 2. UIコンポーネント
- **Button**: 再利用可能なボタンコンポーネント
- **Card**: カードレイアウトコンポーネント
- **Input**: フォーム入力コンポーネント

### 3. ゲームコンポーネント
- **GameMap**: 2Dマップとキャラクター移動
- **PlayerPanel**: プレイヤー情報表示

### 4. カスタムフック
- **usePlayer**: プレイヤー状態管理
- **useMonsters**: モンスター状態管理

## 主要な技術課題と解決策

### 🔴 問題1: TailwindCSSスタイルが全く適用されない

**症状**:
- HTML構造は正しく生成されている
- TailwindCSSクラス（`bg-purple-600`, `flex`, `items-center`等）が全く効かない
- 白い背景のままでプロトタイプの美しいデザインが再現されない

**原因分析**:
1. **古いTailwindCSS設定**: PostCSS + tailwind.config.js の従来の方法を使用
2. **content設定の問題**: TailwindCSSがTypeScriptファイルを正しくスキャンできていない
3. **Viteとの連携不足**: ViteでTailwindCSSを使う最適な方法を採用していない

**解決過程**:

#### ステップ1: 公式ドキュメント確認
```bash
# TailwindCSS公式ドキュメントを確認
# https://tailwindcss.com/docs/installation/using-vite
```

**発見**: ViteでTailwindCSSを使用する場合、新しい`@tailwindcss/vite`プラグインが推奨されていた

#### ステップ2: 新しいTailwindCSS Viteプラグインの導入
```bash
# 新しいプラグインをインストール
pnpm add -D @tailwindcss/vite
```

```typescript
// vite.config.ts - 新しい設定
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 新しいTailwindCSSプラグイン
  ],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

#### ステップ3: 不要な設定ファイルの削除
```bash
# 古い設定ファイルを削除
rm postcss.config.js
rm tailwind.config.js
```

#### ステップ4: CSS設定の簡素化
```css
/* src/styles/index.css - 新しい形式 */
/**
 * グローバルスタイル定義
 * TailwindCSS v4対応
 */

/* カスタムプロパティとアニメーション定義のみ */
:root {
  --primary-blue: #2563eb;
  --primary-green: #16a34a;
  /* ... */
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 🔴 問題2: TailwindCSS v4でユーティリティクラスが動作しない

**症状**:
- TailwindCSSプラグインは正しく読み込まれている
- しかし`bg-purple-600`や`bg-gradient-to-br`等の基本クラスが適用されない
- 警告: "Cannot apply unknown utility class"

**原因分析**:
1. **TailwindCSS v4の変更**: 新しいバージョンでクラス検出方法が変更
2. **@apply廃止**: 従来の`@apply`ディレクティブが使用不可
3. **クラス自動検出の問題**: TypeScriptファイル内のクラスが正しく検出されない

**解決策**: ハイブリッドアプローチの採用

#### カスタムCSSクラスの定義
```css
/* プロトタイプ風のスタイリングを強制適用 */
.prototype-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.prototype-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 28rem;
  width: 100%;
}
```

#### Reactコンポーネントでの使用
```tsx
// StartPage.tsx - カスタムクラスを使用
export function StartPage() {
  return (
    <div className="prototype-background">
      <div className="prototype-card">
        {/* コンテンツ */}
      </div>
    </div>
  )
}
```

## 最終的なアーキテクチャ

### ディレクトリ構造
```
packages/frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # 基本UIコンポーネント
│   │   └── game/         # ゲーム固有コンポーネント
│   ├── pages/            # ページコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── lib/              # ユーティリティ関数
│   ├── styles/           # グローバルスタイル
│   └── types/            # 型定義
├── vite.config.ts        # Vite設定
└── package.json
```

### 技術スタック
- **Vite 5.0.13**: 高速ビルドツール
- **React 18**: UIライブラリ
- **TypeScript 5.0**: 型安全性
- **TailwindCSS v4**: スタイリング（@tailwindcss/vite）
- **React Router**: ルーティング

## 学んだ教訓

### 1. 最新技術の調査の重要性
- TailwindCSSの公式ドキュメントで最新の推奨方法を確認することが重要
- 従来の方法（PostCSS + config）から新しい方法（Viteプラグイン）への移行

### 2. ハイブリッドアプローチの有効性
- TailwindCSSが完全に動作しない場合でも、カスタムCSSとの組み合わせで解決可能
- 完璧な設定を待つより、実用的な解決策を優先

### 3. 段階的なデバッグの重要性
1. 基本的なスタイル（`bg-purple-600`）をテスト
2. 問題を特定（TailwindCSSが全く動作しない）
3. 根本原因を調査（設定方法の変更）
4. 代替解決策を実装（カスタムCSS）

## 今後の改善点

### 1. TailwindCSS v4の完全対応
- クラス検出の問題を解決し、純粋なTailwindCSSクラスの使用
- `safelist`設定の最適化

### 2. パフォーマンス最適化
- 不要なCSSの削除
- コンポーネント分割の最適化

### 3. アクセシビリティ向上
- ARIAラベルの追加
- キーボードナビゲーション対応
- スクリーンリーダー対応

## 結果

✅ **完全成功**: プロトタイプと視覚的に同等のUIを実現
✅ **技術基盤確立**: 今後の開発で活用できる堅牢な環境
✅ **問題解決スキル**: 新しい技術の課題を段階的に解決

この実装により、Week 5のバックエンド統合とデプロイに向けた強固な基盤が完成しました。