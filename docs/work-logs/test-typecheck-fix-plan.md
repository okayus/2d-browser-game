# Test・TypeCheck修正計画

## 🔍 問題の整理

### TypeScript型エラー（バックエンド）
1. **未使用変数エラー**:
   - `src/api/player-me.test.ts:11` - `mockPlayer`が宣言されているが使用されていない
   - `src/index.ts:110` - `inArray`がインポートされているが使用されていない

2. **環境変数アクセスエラー** (5箇所):
   - `c.env.ENVIRONMENT` をインデックス記法 `c.env['ENVIRONMENT']` でアクセスする必要がある
   - 該当箇所: lines 337, 382, 467, 556, 644

### テスト失敗（バックエンド）
1. **認証テストの期待値エラー**:
   - `src/api/player-me.test.ts` - 期待値401だが実際は500エラー
   - 原因: データベース初期化ミドルウェアで`c.env.DB`が未定義

### フロントエンドテストの警告
1. **LocalStorage JSON解析エラー**:
   - `getStorageData`でプレーンテキストをJSON.parseしようとしている
   - 該当値: "playing", "test-player-id"

## 📋 修正計画

### ステップ1: TypeScript型エラー修正
1. **未使用変数の削除**
   - `src/api/player-me.test.ts`: `mockPlayer`変数を削除
   - `src/index.ts`: 未使用の`inArray`インポートを削除

2. **環境変数アクセス方法の修正**
   - 5箇所の`c.env.ENVIRONMENT`を`c.env['ENVIRONMENT']`に変更

### ステップ2: バックエンドテスト修正
1. **テスト環境セットアップ改善**
   - テスト実行時のモック環境変数設定
   - データベースモックの適切な設定

2. **認証テストの修正**
   - 期待されるエラーコードの調整
   - テスト環境での適切なエラーハンドリング確認

### ステップ3: フロントエンドテスト警告解決
1. **LocalStorage処理の改善**
   - `getStorageData`でプレーンテキストとJSONを区別する処理
   - テスト環境でのLocalStorage初期化改善

### ステップ4: 全体テスト実行確認
1. **型チェック実行**
   - `pnpm run typecheck`で全エラーが解消されることを確認

2. **テスト実行**
   - `pnpm run test`で全テストがパスすることを確認

## 🎯 期待される結果

- ✅ TypeScript型エラー: 0件
- ✅ バックエンドテスト: 全パス
- ✅ フロントエンドテスト: 警告なしで全パス
- ✅ CI/CDパイプライン: 正常通過

## 📝 修正対象ファイル

1. `packages/backend/src/index.ts` - 環境変数アクセス修正、未使用import削除
2. `packages/backend/src/api/player-me.test.ts` - 未使用変数削除、テスト修正
3. `packages/frontend/src/lib/utils.ts` - LocalStorage処理改善（必要に応じて）
4. テスト設定ファイル - モック環境変数設定（必要に応じて）

---

# ステップ1: TypeScript型エラー修正の詳細計画

## 🔍 エラー分析結果

### 1. 未使用変数エラー
#### ❌ `src/api/player-me.test.ts:11` - mockPlayer未使用
```typescript
// 現在のコード (Line 11-17)
const mockPlayer = {
  id: 'player-123',
  name: 'テストプレイヤー',
  firebaseUid: mockFirebaseUid,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
};
```
**問題**: `mockPlayer`オブジェクトが宣言されているが、テスト内で使用されていない

#### ❌ `src/index.ts:110` - inArray未使用（誤検出）
```typescript
// 現在のコード (Line 110)
const { eq, inArray } = await import('drizzle-orm');
```
**実際の使用状況確認**:
- Line 110: インポート（プレイヤー作成API内）
- Line 196: 再インポート（grantInitialMonster関数内）
- Line 207: 実際に使用

**修正方針**: Line 110の未使用inArrayのみ削除（Line 196-207は使用されているため残す）

### 2. 環境変数アクセスエラー（5箇所）

#### ❌ TypeScript strict modeでのインデックスアクセス
```typescript
// 現在のコード
c.env.ENVIRONMENT !== 'development'

// 修正後
c.env['ENVIRONMENT'] !== 'development'
```

**該当箇所**:
1. Line 337: `/api/test/players/:playerId/monsters` GET
2. Line 382: `/api/test/monsters/:monsterId` PUT  
3. Line 467: `/api/test/players/:playerId/monsters` POST
4. Line 556: `/api/test/monsters/:monsterId/nickname` PUT
5. Line 644: `/api/test/monsters/:monsterId` DELETE

## 📋 修正計画詳細

### 修正1: 未使用変数の削除

#### ファイル: `packages/backend/src/api/player-me.test.ts`
```typescript
// 削除対象 (Lines 11-17)
const mockPlayer = {
  id: 'player-123',
  name: 'テストプレイヤー',
  firebaseUid: mockFirebaseUid,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
};
```
**削除理由**: 現在のテストでは使用されておらず、将来的にモックデータが必要になった際に再追加可能

#### ファイル: `packages/backend/src/index.ts`
```typescript
// 修正前 (Line 110)
const { eq, inArray } = await import('drizzle-orm');

// 修正後 (Line 110)
const { eq } = await import('drizzle-orm');
```
**修正理由**: このスコープ内でinArrayが使用されていない（別の場所で再インポートされている）

### 修正2: 環境変数アクセス方法の統一

#### 対象：5箇所の環境変数チェック
```typescript
// 修正前
if (c.env.ENVIRONMENT !== 'development') {

// 修正後  
if (c.env['ENVIRONMENT'] !== 'development') {
```

**修正対象箇所**:
1. **Line 337** (`/api/test/players/:playerId/monsters` GET):
   ```typescript
   if (c.env['ENVIRONMENT'] !== 'development') {
   ```

2. **Line 382** (`/api/test/monsters/:monsterId` PUT):
   ```typescript
   if (c.env['ENVIRONMENT'] !== 'development') {
   ```

3. **Line 467** (`/api/test/players/:playerId/monsters` POST):
   ```typescript
   if (c.env['ENVIRONMENT'] !== 'development') {
   ```

4. **Line 556** (`/api/test/monsters/:monsterId/nickname` PUT):
   ```typescript
   if (c.env['ENVIRONMENT'] !== 'development') {
   ```

5. **Line 644** (`/api/test/monsters/:monsterId` DELETE):
   ```typescript
   if (c.env['ENVIRONMENT'] !== 'development') {
   ```

## 🎯 修正後の検証手順

### 1. 型チェック確認
```bash
cd /home/okayu/dev/2d-browser-game/packages/backend
pnpm run typecheck
```
**期待結果**: エラー0件

### 2. 機能動作確認
- 全5つのテストエンドポイントが正常に動作すること
- 環境変数チェックが適切に機能すること

## 📝 修正対象ファイルサマリー

1. **`packages/backend/src/api/player-me.test.ts`**
   - 未使用`mockPlayer`変数の削除 (Lines 11-17)

2. **`packages/backend/src/index.ts`**
   - 未使用`inArray`インポートの削除 (Line 110)
   - 環境変数アクセス修正 (Lines 337, 382, 467, 556, 644)

## ⚡ 影響範囲

- **破壊的変更**: なし
- **機能変更**: なし  
- **パフォーマンス**: 影響なし
- **既存テスト**: 影響なし（未使用コードの削除のみ）

この修正により、TypeScriptの厳格な型チェックに完全準拠し、CI/CDパイプラインが正常に通過するようになります。