# Week 5: Battle System & Backend Integration Implementation

## 概要

Week 5では、モンスター収集ゲームの核となるバトルシステムを実装し、フロントエンドとバックエンドの統合を完成させます。

## 実装目標

### 🎯 主要目標
- ✅ **バトルシステム**: 完全なバトル画面とロジックの実装
- ✅ **モンスター捕獲**: バトル勝利後のモンスター捕獲機能
- ✅ **バックエンド統合**: フロントエンドをバックエンドAPIと接続
- ✅ **データ永続化**: LocalStorageからD1データベースへの移行

### 🔧 技術目標
- TDD（Test-Driven Development）の実践
- OpenAPI仕様に基づくAPI設計
- TypeScript型安全性の確保
- E2Eテストの実バックエンド対応

## Phase 1: バトルシステム設計 📋

### 1.1 バトル画面 UI設計
```
┌─────────────────────────────────────┐
│ 野生のモンスターが現れた！           │
│                                     │
│ [敵画像]          [味方画像]        │
│ フレイムビースト   スパークドラゴン  │
│ HP: ████████░░ 80%  HP: ██████░░░░ 60% │
│                                     │
│ [たたかう] [つかまえる] [にげる]    │
└─────────────────────────────────────┘
```

### 1.2 バトル状態管理
- **Turn-based戦闘**: プレイヤー → 敵 → プレイヤー...
- **HP計算**: ダメージ計算とHP減少
- **勝利条件**: 敵のHP = 0
- **捕獲条件**: 敵のHP < 30%
- **バトル後遷移**: 勝利・敗北・逃走全てマップ画面に戻る

### 1.3 マップからバトルへの遷移
- **遭遇条件**: 草タイル上の移動時に確率で発生（20%程度）
- **敵モンスター**: 1種類固定（フレイムビースト）
- **バトル開始**: マップ画面 → バトル画面に自動遷移

### 1.4 必要コンポーネント
- `BattleScreen`: メインバトル画面
- `MonsterBattleCard`: バトル中のモンスター表示
- `BattleActions`: アクションボタン群
- `BattleLog`: バトルログ表示

## Phase 2: バックエンドAPI設計 🔗

### 2.1 バトル関連API方針
- **バトル処理**: フロントエンドで完結（サーバー不要）
- **バトル後処理**: モンスター状態更新のみAPIを使用
- **敵モンスター**: 固定データ（フレイムビースト1種類）

### 2.2 必要なAPIエンドポイント
```typescript
// バトル終了後の所持モンスター更新API
PUT  /api/monsters/:id/hp    // モンスターHP更新（バトル後）
POST /api/monsters/add       // 新モンスター追加（捕獲後）
```

### 2.3 API仕様（OpenAPI）
```yaml
/api/monsters/{id}/hp:
  put:
    summary: モンスターHP更新
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              currentHp:
                type: integer
                minimum: 0
    responses:
      200:
        description: HP更新成功

/api/monsters/add:
  post:
    summary: 新モンスター追加（捕獲）
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              playerId:
                type: string
              monsterId:
                type: string
              name:
                type: string
              currentHp:
                type: integer
              maxHp:
                type: integer
    responses:
      201:
        description: モンスター追加成功
```

## Phase 3: フロントエンド実装 ⚛️

### 3.1 バトル状態管理
```typescript
// hooks/useBattle.ts
export interface BattleState {
  wildMonster: Monster | null
  playerMonster: Monster | null
  status: 'idle' | 'active' | 'won' | 'lost' | 'fled'
  turn: 'player' | 'enemy'
  log: BattleLogEntry[]
}

// 固定の敵モンスターデータ
const WILD_FLAME_BEAST: Monster = {
  id: 'wild-flame-beast',
  name: 'フレイムビースト',
  type: 'fire',
  maxHp: 100,
  currentHp: 100,
  attack: 25,
  defense: 15
}

export function useBattle() {
  const [battleState, setBattleState] = useState<BattleState>(initialState)
  const { updateMonsterHp, addMonster } = useMonsters()
  const navigate = useNavigate()
  
  const startBattle = (playerMonster: Monster) => {
    setBattleState({
      wildMonster: { ...WILD_FLAME_BEAST, currentHp: WILD_FLAME_BEAST.maxHp },
      playerMonster,
      status: 'active',
      turn: 'player',
      log: []
    })
  }
  
  const performAction = (action: BattleAction) => {
    // フロントエンドでダメージ計算・HP更新
    // バトル終了時にAPIでモンスター状態を永続化
  }
  
  const endBattle = async (result: 'won' | 'lost' | 'fled') => {
    if (result === 'won') {
      // 所持モンスターのHP更新API呼び出し
      await updateMonsterHp(battleState.playerMonster!.id, battleState.playerMonster!.currentHp)
    }
    
    // マップ画面に戻る
    navigate('/map')
  }
  
  return { battleState, startBattle, performAction, endBattle }
}
```

### 3.2 マップからバトル遷移処理
```typescript
// components/game/GameMap.tsx（更新）
export function GameMap() {
  const { battleState, startBattle } = useBattle()
  const { player } = usePlayer()
  const navigate = useNavigate()
  
  const handlePlayerMove = (newX: number, newY: number) => {
    // プレイヤー移動処理
    movePlayer(newX, newY)
    
    // 草タイルでのランダムエンカウント
    if (isGrassTile(newX, newY) && Math.random() < 0.2) {
      // バトル開始
      const playerMonster = player.monsters[0] // 最初のモンスター
      startBattle(playerMonster)
      navigate('/battle')
    }
  }
  
  return (
    <div className="game-map">
      {/* マップ描画 */}
    </div>
  )
}
```

### 3.3 バトル画面コンポーネント
```typescript
// components/game/BattleScreen.tsx
export function BattleScreen() {
  const { battleState, performAction, endBattle } = useBattle()
  
  const handleAttack = () => performAction({ type: 'attack' })
  const handleCapture = () => performAction({ type: 'capture' })
  const handleRun = () => endBattle('fled')
  
  if (battleState.status === 'won') {
    return <BattleVictoryScreen onContinue={() => endBattle('won')} />
  }
  
  if (battleState.status === 'lost') {
    return <BattleDefeatScreen onContinue={() => endBattle('lost')} />
  }
  
  return (
    <div className="battle-screen" data-testid="battle-screen">
      <div className="battle-message">
        野生のフレイムビーストが現れた！
      </div>
      <BattleField 
        wildMonster={battleState.wildMonster}
        playerMonster={battleState.playerMonster}
      />
      <BattleActions 
        onAttack={handleAttack}
        onCapture={handleCapture}
        onRun={handleRun}
        disabled={battleState.turn !== 'player'}
      />
      <BattleLog entries={battleState.log} />
    </div>
  )
}
```

## Phase 4: バックエンド統合 🔌

### 4.1 API クライアント更新
```typescript
// lib/api-client.ts（更新版）
export class ApiClient {
  private baseURL: string
  
  constructor(baseURL: string) {
    this.baseURL = baseURL
  }
  
  // プレイヤーAPI
  async createPlayer(name: string): Promise<Player> { /* ... */ }
  async getPlayer(id: string): Promise<Player> { /* ... */ }
  
  // モンスターAPI
  async getPlayerMonsters(playerId: string): Promise<Monster[]> { /* ... */ }
  
  // バトル終了後のモンスター更新API
  async updateMonsterHp(monsterId: string, currentHp: number): Promise<void> {
    await this.request(`/api/monsters/${monsterId}/hp`, {
      method: 'PUT',
      body: JSON.stringify({ currentHp })
    })
  }
  
  async addCapturedMonster(monster: Omit<Monster, 'id'>): Promise<Monster> {
    return await this.request('/api/monsters/add', {
      method: 'POST',
      body: JSON.stringify(monster)
    })
  }
}
```

### 4.2 LocalStorageからAPI移行
```typescript
// hooks/usePlayer.ts（更新版）
export function usePlayer() {
  const [player, setPlayer] = useState<Player | null>(null)
  const apiClient = useApiClient()
  
  const createPlayer = async (name: string) => {
    // LocalStorage → API呼び出しに変更
    const newPlayer = await apiClient.createPlayer(name)
    setPlayer(newPlayer)
    return newPlayer
  }
  
  const loadPlayer = async (id: string) => {
    const player = await apiClient.getPlayer(id)
    setPlayer(player)
    return player
  }
  
  return { player, createPlayer, loadPlayer }
}
```

## Phase 5: E2Eテスト更新 🧪

### 5.1 テスト戦略更新
- **Mock → Real API**: E2EテストでReal APIを使用
- **Database Cleanup**: テスト後のデータクリーンアップ
- **Battle Flow Testing**: バトル全体フローのテスト

### 5.2 更新対象テスト
```typescript
// e2e/tests/battle-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Battle System E2E', () => {
  test('map encounter and battle flow', async ({ page }) => {
    // 1. プレイヤー作成
    await page.goto('/start')
    await page.fill('[data-testid="player-name-input"]', 'TestPlayer')
    await page.click('[data-testid="start-game-button"]')
    
    // 2. モンスター選択
    await page.click('[data-testid="monster-select-button-0"]')
    
    // 3. マップ移動でエンカウント（確率的なため複数回試行）
    await page.goto('/map')
    
    let battleTriggered = false
    for (let i = 0; i < 20 && !battleTriggered; i++) {
      // 草タイルに移動
      await page.click('[data-testid="map-cell-grass-1-1"]')
      
      // バトル画面に遷移したかチェック
      try {
        await expect(page.locator('[data-testid="battle-screen"]')).toBeVisible({ timeout: 1000 })
        battleTriggered = true
      } catch {
        // エンカウントしなかった場合は続行
      }
    }
    
    // 4. バトル画面確認
    expect(battleTriggered).toBe(true)
    await expect(page.locator('.battle-message')).toContainText('フレイムビースト')
    
    // 5. バトルアクション実行
    await page.click('[data-testid="attack-button"]')
    
    // 6. バトル終了後マップに戻る
    // （バトル結果に応じてテストを分岐）
  })
  
  test('battle victory and monster capture', async ({ page }) => {
    // バトル勝利→捕獲のテストケース
    // （開発者ツールでバトル状態を直接設定してテスト）
  })
})
```

## Phase 6: 統合テスト 🔧

### 6.1 テスト方針
- **Unit Tests**: 各機能の個別テスト（Vitest）
- **Integration Tests**: API + Database統合テスト
- **E2E Tests**: ユーザーシナリオ全体テスト（Playwright）

### 6.2 テスト実行フロー
```bash
# 1. Unit Tests実行
pnpm test

# 2. Backend統合テスト
pnpm test:backend

# 3. E2Eテスト実行（Real API）
pnpm test:e2e

# 4. 全テスト実行
pnpm test:all
```

## 実装チェックリスト 📝

### バトルシステム
- [ ] バトル画面UIコンポーネント
- [ ] バトル状態管理Hook（フロントエンド完結）
- [ ] HP計算とダメージシステム
- [ ] ターン制御ロジック
- [ ] 勝利・敗北・逃走処理
- [ ] マップからバトル遷移（草タイル20%確率）
- [ ] 固定敵モンスター（フレイムビースト）実装

### バックエンドAPI
- [ ] モンスターHP更新エンドポイント
- [ ] モンスター追加エンドポイント（捕獲用）
- [ ] API統合テスト

### フロントエンド統合
- [ ] APIクライアント実装
- [ ] LocalStorage→API移行
- [ ] エラーハンドリング強化
- [ ] ロード状態管理

### テスト
- [ ] バトルシステムUnit Tests
- [ ] API統合テスト
- [ ] E2Eテストの実API対応
- [ ] CI/CDパイプライン更新

## 技術的な課題と解決策 🛠️

### 課題1: リアルタイム性の実現
**問題**: バトルのスムーズな進行
**解決策**: Optimistic UIパターンの採用

### 課題2: 状態管理の複雑性
**問題**: バトル状態とUI状態の同期
**解決策**: React Queryによるサーバー状態管理

### 課題3: エラーハンドリング
**問題**: ネットワークエラーやAPI障害
**解決策**: Retry機構とFallback UI

## Week 6への準備 🚀

Week 5完了時点で以下が達成される想定：
- ✅ 完全なバトルシステム
- ✅ フロントエンド・バックエンド統合
- ✅ Real APIでのE2Eテスト
- ✅ Cloudflareデプロイ準備完了

これにより、Week 6では：
- Cloudflare Pages + Workers + D1デプロイ
- パフォーマンス最適化
- プロダクションレベルの品質向上
- ドキュメント整備

に集中できる体制を構築します。

## 学習目標 📚

このWeek 5を通じて、初学者は以下を学習できます：
- **Full-stack開発**: フロントエンドとバックエンドの統合方法
- **API設計**: RESTful APIとOpenAPI仕様
- **データベース設計**: リレーショナルデータベースの正規化
- **状態管理**: 複雑なアプリケーション状態の管理方法
- **テスト戦略**: Unit/Integration/E2Eテストの使い分け
- **TypeScript活用**: 型安全性を活かした開発手法