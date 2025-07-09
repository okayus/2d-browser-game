# shadcn/ui導入実装計画書

**Issue**: #8 - shadcn/ui導入とUIコンポーネントシステム実装  
**ブランチ**: `feature/shadcn-ui-integration`  
**実装者**: Claude Code  
**実装方式**: TDD (Test-Driven Development)

## 📋 実装チェックリスト

### Phase 1: プロジェクト設定・基盤整備
- [ ] TypeScript設定更新（path alias `@/*` 追加）
- [ ] Vite設定更新（resolve alias設定）
- [ ] @types/node 依存関係追加
- [ ] shadcn/ui 初期化実行
- [ ] components.json 設定確認

### Phase 2: 基本コンポーネント導入（TDD方式）
- [x] Button コンポーネント
  - [x] Buttonテスト作成
  - [x] Button実装
  - [ ] Button リファクタリング
- [ ] Card コンポーネント
  - [ ] Cardテスト作成
  - [ ] Card実装
  - [ ] Card リファクタリング
- [ ] Input コンポーネント
  - [ ] Inputテスト作成
  - [ ] Input実装
  - [ ] Input リファクタリング
- [ ] Alert コンポーネント
  - [ ] Alertテスト作成
  - [ ] Alert実装
  - [ ] Alert リファクタリング
- [ ] Badge コンポーネント
  - [ ] Badgeテスト作成
  - [ ] Badge実装
  - [ ] Badge リファクタリング

### Phase 3: ゲーム専用コンポーネント開発
- [ ] MonsterCard（モンスター選択カード）
  - [ ] MonsterCardテスト作成
  - [ ] MonsterCard実装
  - [ ] MonsterCard リファクタリング
- [ ] GameMap（2Dマップ表示）
  - [ ] GameMapテスト作成
  - [ ] GameMap実装
  - [ ] GameMap リファクタリング
- [ ] PlayerStatus（プレイヤー情報）
  - [ ] PlayerStatusテスト作成
  - [ ] PlayerStatus実装
  - [ ] PlayerStatus リファクタリング
- [ ] MessageLog（ゲームメッセージ）
  - [ ] MessageLogテスト作成
  - [ ] MessageLog実装
  - [ ] MessageLog リファクタリング

### Phase 4: 画面実装（プロトタイプ移行）
- [ ] スタート画面実装
  - [ ] プレイヤー名入力機能
  - [ ] ゲーム開始ボタン
  - [ ] バリデーション機能
  - [ ] データ永続化
- [ ] プレイヤー作成画面実装
  - [ ] プレイヤー情報表示
  - [ ] モンスター選択機能
  - [ ] 選択状態プレビュー
  - [ ] 冒険開始機能
- [ ] マップ画面実装
  - [ ] 2Dマップ表示
  - [ ] プレイヤー移動機能
  - [ ] 当たり判定システム
  - [ ] メッセージシステム

### Phase 5: テスト・品質保証
- [ ] ユニットテスト実装
  - [ ] 全コンポーネントテストカバレッジ90%以上
  - [ ] 型安全性テスト
  - [ ] エラーハンドリングテスト
- [ ] E2Eテスト実装
  - [ ] Playwrightでプロトタイプ操作性確認
  - [ ] 画面遷移テスト
  - [ ] データ永続化テスト
- [ ] アクセシビリティ監査
  - [ ] キーボードナビゲーション
  - [ ] スクリーンリーダー対応
  - [ ] WCAG準拠チェック

### Phase 6: ドキュメント・学習コンテンツ
- [ ] UI設計書作成 (`docs/02-design/ui-component-design.md`)
- [ ] 初学者向けshadcn/ui学習ガイド作成
- [ ] コンポーネント使用方法ドキュメント
- [ ] 実装パターン解説ドキュメント

## 🎯 TDD実装プロセス

各コンポーネントで以下のサイクルを実践：

1. **テスト作成（Red）**
   ```typescript
   // 例: Button コンポーネント
   describe('Button', () => {
     test('クリック時にonClickが呼ばれること', () => {
       // テストケース実装
     });
   });
   ```

2. **実装（Green）**
   ```typescript
   /**
    * ボタンコンポーネント
    * 
    * 初学者向けメモ:
    * - shadcn/ui の Button をベースにカスタマイズ
    * - variant プロパティでデザインパターンを切り替え
    * - TypeScript厳密型定義でプロパティを制限
    */
   export const Button: React.FC<ButtonProps> = ({ ... }) => {
     // 実装
   };
   ```

3. **リファクタリング（Refactor）**
   - コードの可読性向上
   - パフォーマンス最適化
   - 型安全性強化

## 🎮 ゲーム特化要素

### コンポーネント設計方針
- **再利用性**: 汎用的な設計で他のゲームでも使用可能
- **カスタマイズ性**: ゲーム固有のデザインに対応
- **アクセシビリティ**: 全ユーザーが利用可能
- **パフォーマンス**: 60fps維持可能な軽量実装

### 日本語変数・関数名
```typescript
// CLAUDE.md ルールに従い、初学者向けに日本語命名
export interface モンスターカードProps {
  モンスター情報: モンスター型;
  選択状態: boolean;
  選択時処理: (モンスターID: string) => void;
}

export const モンスターカード: React.FC<モンスターカードProps> = ({
  モンスター情報,
  選択状態,
  選択時処理
}) => {
  // 実装
};
```

## 📊 進捗管理

- **開始日**: 実装開始時更新
- **完了予定**: Phase別に設定
- **現在フェーズ**: 実装中のPhaseを明記
- **課題・ブロッカー**: 発生時に記録

## 🔄 計画変更履歴

実装中に計画から逸脱する場合、以下に記録：

1. **変更日**: 
   - **変更内容**: 
   - **理由**: 
   - **影響範囲**: 

## 📚 技術学習ポイント

### shadcn/ui 理解項目
- [ ] "コピー&ペースト"アプローチの利点
- [ ] Radix UI プリミティブの活用
- [ ] CVA (Class Variance Authority) 使用方法
- [ ] カスタムデザインシステム構築

### React/TypeScript実践項目
- [ ] 厳密型定義の実装
- [ ] Props interface設計
- [ ] カスタムフック実装
- [ ] コンポーネント合成パターン

### テスト実践項目
- [ ] Testing Library 使用方法
- [ ] モックとスタブの使い分け
- [ ] E2Eテストシナリオ設計
- [ ] テストカバレッジ測定

---

**更新履歴**
- 2025-07-09: 初版作成
- 次回更新: 実装開始時