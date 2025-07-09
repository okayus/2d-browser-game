# UI コンポーネント設計書

**プロジェクト**: モンスター収集ゲーム  
**対象**: shadcn/ui 導入とコンポーネントシステム  
**目的**: プロトタイプからReact+TypeScript実装への移行

## 🎯 設計方針

### 基本原則
1. **プロトタイプ一貫性**: 既存UIデザインの踏襲
2. **初学者配慮**: 理解しやすいコンポーネント設計
3. **型安全性**: TypeScript厳密型定義
4. **アクセシビリティ**: WCAG準拠実装
5. **再利用性**: 汎用的なコンポーネント設計

### shadcn/ui選択理由
- **コピー&ペースト方式**: 依存関係を増やさずカスタマイズ自由
- **Radix UI基盤**: アクセシビリティ担保済み
- **Tailwind統合**: 既存CSSフレームワークとの親和性
- **TypeScript対応**: 型安全性確保
- **学習効果**: モダンReact開発パターン習得

## 🎨 デザインシステム

### カラーパレット
プロトタイプから継承するゲーム専用カラー：

```css
:root {
  /* ゲーム基本色 */
  --game-primary: #3b82f6;     /* 青 - メインアクション */
  --game-secondary: #6366f1;   /* 紫 - 特別アクション */
  --game-success: #10b981;     /* 緑 - 成功状態 */
  --game-warning: #f59e0b;     /* 黄 - 注意状態 */
  --game-error: #ef4444;       /* 赤 - エラー状態 */
  
  /* モンスター関連色 */
  --monster-electric: #fbbf24; /* 電気タイプ */
  --monster-fire: #dc2626;     /* 炎タイプ */
  --monster-water: #2563eb;    /* 水タイプ */
  
  /* レア度色 */
  --rarity-common: #6b7280;    /* コモン */
  --rarity-rare: #7c3aed;      /* レア */
  --rarity-epic: #db2777;      /* エピック */
}
```

### タイポグラフィ
```css
/* 日本語フォント最適化 */
.game-text {
  font-family: "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", 
               "Yu Gothic Medium", "游ゴシック Medium", 
               "メイリオ", sans-serif;
}
```

## 🧩 コンポーネント設計

### 基本コンポーネント

#### 1. Button
```typescript
/**
 * ゲーム用ボタンコンポーネント
 * 
 * 設計思想:
 * - shadcn/ui Button をベースにゲーム用variant追加
 * - サイズ、色、状態のvariant定義
 * - アクセシビリティ標準対応
 */
interface ゲームボタンProps {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

**使用場面**:
- スタート画面: ゲーム開始ボタン
- プレイヤー作成: モンスター選択、冒険開始
- マップ画面: 移動、アクションボタン

#### 2. Card
```typescript
/**
 * 情報表示カードコンポーネント
 * 
 * 設計思想:
 * - 情報のグループ化とレイアウト統一
 * - ネストした情報構造の表現
 * - ホバー、選択状態の視覚フィードバック
 */
interface ゲームカードProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'interactive';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}
```

**使用場面**:
- プレイヤー情報表示パネル
- モンスター選択カード
- ゲーム説明エリア
- ステータス表示

#### 3. Input
```typescript
/**
 * 入力フィールドコンポーネント
 * 
 * 設計思想:
 * - リアルタイムバリデーション対応
 * - エラー状態の明確な表示
 * - ラベル、ヘルプテキスト統合
 */
interface ゲーム入力フィールドProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helpText?: string;
  maxLength?: number;
  required?: boolean;
}
```

**使用場面**:
- プレイヤー名入力
- 検索フィールド
- 設定値入力

### ゲーム専用コンポーネント

#### 1. MonsterCard（モンスター選択カード）
```typescript
/**
 * モンスター選択用カードコンポーネント
 * 
 * 設計思想:
 * - モンスター情報の構造化表示
 * - 選択状態の明確な視覚表現
 * - アクセシビリティ（キーボード操作）対応
 * - レア度による色分け表示
 */
interface モンスターカードProps {
  モンスター: {
    id: string;
    名前: string;
    説明: string;
    アイコン: string;
    基本HP: number;
    レア度: 'common' | 'rare' | 'epic';
  };
  選択状態: boolean;
  選択可能: boolean;
  選択時処理: (モンスターID: string) => void;
}
```

#### 2. GameMap（ゲームマップ）
```typescript
/**
 * 2Dマップ表示コンポーネント
 * 
 * 設計思想:
 * - グリッドベースマップの効率的レンダリング
 * - プレイヤー位置のリアルタイム更新
 * - タイル情報のツールチップ表示
 * - レスポンシブ対応（モバイル・デスクトップ）
 */
interface ゲームマップProps {
  マップデータ: マップタイル[][];
  プレイヤー位置: { x: number; y: number };
  プレイヤー移動処理: (方向: 移動方向) => void;
  タイル情報表示: boolean;
}
```

#### 3. PlayerStatus（プレイヤー情報）
```typescript
/**
 * プレイヤー状態表示コンポーネント
 * 
 * 設計思想:
 * - 重要情報の階層的表示
 * - リアルタイム状態更新
 * - コンパクトな情報密度
 */
interface プレイヤーステータスProps {
  プレイヤー名: string;
  パートナーモンスター?: モンスター;
  現在位置: { x: number; y: number; 地名: string };
  ゲーム状態: 'playing' | 'paused' | 'menu';
}
```

#### 4. MessageLog（メッセージログ）
```typescript
/**
 * ゲームメッセージ表示コンポーネント
 * 
 * 設計思想:
 * - メッセージ種別による色分け
 * - 自動スクロール・フェード機能
 * - メッセージ履歴管理
 */
interface メッセージログProps {
  メッセージ一覧: ゲームメッセージ[];
  最大表示件数: number;
  自動削除時間: number;
}
```

## 📱 レスポンシブ設計

### ブレイクポイント
```css
/* Tailwind CSS ブレイクポイント活用 */
.responsive-layout {
  /* モバイル: ~640px */
  @apply grid-cols-1 gap-2 p-2;
  
  /* タブレット: 640px~ */
  @media (min-width: 640px) {
    @apply grid-cols-2 gap-4 p-4;
  }
  
  /* デスクトップ: 1024px~ */
  @media (min-width: 1024px) {
    @apply grid-cols-3 gap-6 p-6;
  }
}
```

### 画面別レイアウト
1. **スタート画面**: シングルカラム、中央揃え
2. **プレイヤー作成**: 2カラム（情報 + 選択）
3. **マップ画面**: 3カラム（メイン + サイドバー + 情報）

## ♿ アクセシビリティ設計

### キーボードナビゲーション
```typescript
// フォーカス管理のカスタムフック例
const useKeyboardNavigation = (items: HTMLElement[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          // 上移動処理
          break;
        case 'ArrowDown':
          // 下移動処理
          break;
        case 'Enter':
          // 選択処理
          break;
        case 'Escape':
          // キャンセル処理
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);
};
```

### ARIA ラベル設計
```typescript
// アクセシビリティ属性の標準化
interface アクセシビリティProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  role?: string;
  tabIndex?: number;
}
```

## 🎨 アニメーション設計

### マイクロインタラクション
```css
/* ボタンホバー効果 */
.game-button {
  @apply transition-all duration-200 ease-in-out;
  @apply hover:scale-105 hover:shadow-lg;
  @apply active:scale-95;
}

/* カード選択効果 */
.monster-card {
  @apply transition-all duration-300 ease-in-out;
  @apply hover:shadow-xl hover:-translate-y-1;
}

.monster-card.selected {
  @apply ring-2 ring-blue-500 shadow-blue-500/25;
}
```

### ページ遷移アニメーション
```typescript
// React Transition Group または Framer Motion 検討
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};
```

## 🧪 テスト設計方針

### ユニットテスト
```typescript
// コンポーネントテストの標準パターン
describe('MonsterCard', () => {
  test('モンスター情報が正しく表示される', () => {
    // Arrange: テストデータ準備
    // Act: コンポーネントレンダリング
    // Assert: 期待される表示確認
  });
  
  test('選択状態が視覚的に表現される', () => {
    // 選択状態のスタイリング確認
  });
  
  test('クリック時に選択処理が呼ばれる', () => {
    // イベントハンドラーの動作確認
  });
});
```

### E2Eテスト
```typescript
// Playwright による画面操作テスト
test('プロトタイプと同等の操作性', async ({ page }) => {
  // プレイヤー作成からマップ表示まで
  // プロトタイプの操作フローを再現
});
```

## 📚 実装パターン

### Compound Component Pattern
```typescript
// 複合コンポーネントによる柔軟な構成
export const MonsterCard = ({ children, ...props }) => {
  return <Card {...props}>{children}</Card>;
};

MonsterCard.Header = ({ children }) => <CardHeader>{children}</CardHeader>;
MonsterCard.Content = ({ children }) => <CardContent>{children}</CardContent>;
MonsterCard.Actions = ({ children }) => <CardActions>{children}</CardActions>;
```

### Custom Hook Pattern
```typescript
// ロジックの再利用とテスト容易性
export const useMonsterSelection = () => {
  const [selectedMonster, setSelectedMonster] = useState<string | null>(null);
  
  const selectMonster = useCallback((monsterId: string) => {
    setSelectedMonster(monsterId);
    // ゲーム状態更新ロジック
  }, []);
  
  return { selectedMonster, selectMonster };
};
```

---

**作成日**: 2025-07-09  
**更新日**: 実装進捗に応じて更新  
**レビュー**: 実装完了時に設計と実装の差分を記録