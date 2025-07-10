# 🚀 Week 3 React実装計画書

**作成日**: 2025年7月10日  
**バージョン**: v1.0  
**ステータス**: 実装中

## 📋 概要

プロトタイプ（HTML/CSS/JavaScript）をReact + TypeScriptで再実装します。コンポーネント設計とAPI連携を中心に、再利用可能で保守性の高いコードを実装します。

## 🎯 実装目標

### 技術目標
1. **コンポーネント指向設計** - 再利用可能なUIコンポーネント
2. **型安全性** - TypeScriptによる厳密な型定義
3. **状態管理** - React Hooksによる効率的な状態管理
4. **API連携** - バックエンドとの非同期通信実装

### 学習目標
1. **React基礎** - コンポーネント、Props、State
2. **TypeScript活用** - 型定義、インターフェース
3. **カスタムフック** - ロジックの共通化
4. **レスポンシブUI** - Grid Layoutの活用

## 🏗️ アーキテクチャ設計

### ディレクトリ構造
```
packages/frontend/src/
├── components/           # UIコンポーネント
│   ├── common/          # 共通コンポーネント
│   ├── game/            # ゲーム関連コンポーネント
│   └── layout/          # レイアウトコンポーネント
├── hooks/               # カスタムフック
├── pages/               # ページコンポーネント
├── services/            # API通信
├── stores/              # 状態管理
├── types/               # 型定義
└── utils/               # ユーティリティ関数
```

### コンポーネント設計

#### 1. 共通コンポーネント
- `Button` - 汎用ボタンコンポーネント
- `Card` - カード型UI
- `Message` - メッセージ表示
- `Modal` - モーダルダイアログ
- `Loading` - ローディング表示

#### 2. ゲームコンポーネント
- `MonsterCard` - モンスター表示カード
- `GameMap` - ゲームマップ
- `PlayerCharacter` - プレイヤーキャラクター
- `TileInfo` - タイル情報表示

#### 3. レイアウトコンポーネント
- `Header` - ヘッダー
- `Footer` - フッター
- `PageLayout` - ページレイアウト

### 状態管理設計
```typescript
// ゲーム状態の型定義
interface GameState {
  player: {
    id: string;
    name: string;
    position: { x: number; y: number };
  } | null;
  selectedMonster: Monster | null;
  ownedMonsters: Monster[];
  gamePhase: 'start' | 'playerCreation' | 'playing' | 'battle';
}
```

## 📝 実装タスク

### Phase 1: 基盤構築 ✅
- [x] フロントエンドパッケージのセットアップ
- [x] React Router設定
- [x] Tailwind CSS設定
- [x] 基本的な型定義

### Phase 2: 共通コンポーネント実装
- [ ] Buttonコンポーネント
  - [ ] バリエーション対応（primary, secondary, danger）
  - [ ] ローディング状態
  - [ ] アイコン対応
- [ ] Cardコンポーネント
  - [ ] 選択可能カード
  - [ ] ホバーエフェクト
- [ ] Messageコンポーネント
  - [ ] 成功/エラー/警告/情報タイプ
  - [ ] 自動消去機能
- [ ] Modalコンポーネント
  - [ ] 確認ダイアログ
  - [ ] フォームモーダル

### Phase 3: ページ実装

#### 3.1 スタート画面
- [ ] StartPageコンポーネント作成
- [ ] プレイヤー名入力フォーム
  - [ ] バリデーション（3-20文字）
  - [ ] リアルタイム文字数カウント
- [ ] ゲーム開始ボタン
- [ ] 既存ゲーム検出と続行機能
- [ ] リセット機能

#### 3.2 プレイヤー作成画面
- [ ] PlayerCreationPageコンポーネント作成
- [ ] プレイヤー情報表示
- [ ] モンスター選択機能
  - [ ] MonsterCardコンポーネント
  - [ ] 選択状態管理
  - [ ] プレビュー表示
- [ ] 冒険開始ボタン
- [ ] 進行状況チェックリスト

#### 3.3 マップ画面
- [ ] MapPageコンポーネント作成
- [ ] GameMapコンポーネント
  - [ ] タイルグリッド生成
  - [ ] プレイヤー配置
  - [ ] 移動アニメーション
- [ ] キーボード操作
  - [ ] 矢印キー/WASD対応
  - [ ] スペースキーで情報表示
- [ ] タッチ操作（モバイル対応）
- [ ] プレイヤー情報パネル
- [ ] メッセージログ

#### 3.4 モンスター一覧画面
- [ ] MonsterListPageコンポーネント作成
- [ ] モンスター一覧表示
  - [ ] グリッドレイアウト
  - [ ] ソート機能
  - [ ] フィルター機能
- [ ] モンスター詳細表示
- [ ] ニックネーム編集機能
- [ ] 解放（削除）機能

#### 3.5 バトル画面
- [ ] BattlePageコンポーネント作成
- [ ] バトルUI
  - [ ] モンスター表示
  - [ ] HP表示
  - [ ] アクションボタン
- [ ] バトルロジック
  - [ ] ダメージ計算
  - [ ] 捕獲判定
- [ ] アニメーション効果

### Phase 4: API連携
- [ ] APIクライアント実装
  - [ ] axios設定
  - [ ] エラーハンドリング
  - [ ] 型定義との連携
- [ ] API呼び出し実装
  - [ ] プレイヤー作成
  - [ ] モンスター取得
  - [ ] モンスター一覧取得
  - [ ] ニックネーム更新
  - [ ] モンスター削除

### Phase 5: カスタムフック実装
- [ ] `useGameState` - ゲーム状態管理
- [ ] `usePlayer` - プレイヤー情報管理
- [ ] `useMonsters` - モンスター管理
- [ ] `useKeyboard` - キーボード操作
- [ ] `useLocalStorage` - ローカルストレージ連携

### Phase 6: 統合テスト
- [ ] ページ遷移テスト
- [ ] API連携テスト
- [ ] エラーハンドリングテスト
- [ ] レスポンシブデザインテスト

## 🔧 技術詳細

### 使用ライブラリ
- **React** 18.x
- **TypeScript** 5.x
- **React Router** 6.x
- **Tailwind CSS** 3.x
- **shadcn/ui** - UIコンポーネント
- **axios** - HTTP通信
- **zod** - バリデーション

### コーディング規約
```typescript
// コンポーネント例
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  onClick,
  children,
}) => {
  // 実装
};
```

### 状態管理パターン
```typescript
// カスタムフック例
export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    player: null,
    selectedMonster: null,
    ownedMonsters: [],
    gamePhase: 'start',
  });

  const updatePlayer = useCallback((player: Player) => {
    setGameState(prev => ({ ...prev, player }));
  }, []);

  return {
    gameState,
    updatePlayer,
    // その他のメソッド
  };
};
```

## 📊 進捗管理

### Day 1-2: 基盤構築と共通コンポーネント
- 環境設定
- 共通コンポーネント実装
- 型定義作成

### Day 3-4: 画面実装
- スタート画面
- プレイヤー作成画面
- マップ画面基本実装

### Day 5-6: 機能実装
- モンスター一覧画面
- バトル画面
- API連携

### Day 7: テストとリファクタリング
- 統合テスト
- バグ修正
- パフォーマンス最適化

## 🎓 学習ポイント

### 初学者向けチェックリスト
- [ ] Reactコンポーネントの基本を理解
- [ ] Props と State の違いを理解
- [ ] useEffect の使い方を習得
- [ ] カスタムフックの作成方法を学習
- [ ] TypeScriptの型定義を活用
- [ ] 非同期処理の実装パターンを理解

### 発展的な学習
- [ ] パフォーマンス最適化（memo, useMemo, useCallback）
- [ ] コード分割（lazy loading）
- [ ] テスト駆動開発（TDD）
- [ ] アクセシビリティ対応

## 📌 注意事項

### セキュリティ
- APIキーの管理（環境変数使用）
- XSS対策（React標準で対応）
- 入力値のサニタイズ

### パフォーマンス
- 不要な再レンダリング防止
- 画像の遅延読み込み
- バンドルサイズの最適化

### アクセシビリティ
- キーボード操作対応
- ARIA属性の適切な使用
- スクリーンリーダー対応

## 🚀 次のステップ

Week 3完了後：
1. **Week 4**: フロントエンド・バックエンド統合
2. **追加機能**: マップ移動、ランダムエンカウント
3. **最適化**: パフォーマンスチューニング
4. **デプロイ**: Cloudflare Pages へのデプロイ