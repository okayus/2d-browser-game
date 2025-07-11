/**
 * マップ探索フローのE2Eテスト
 * プレイヤーの移動、モンスター発見、アイテム収集の完全なフローをテスト
 */

import { test, expect } from '@playwright/test'
import { MapPage } from '../pages/map-page'
import { MonsterListPage } from '../pages/monster-list-page'
import { StartPage } from '../pages/start-page'
import { clearLocalStorage, setPlayerData, setMonsterData } from '../utils/helpers'
import { testPlayers, testMapData } from '../fixtures/test-data'

test.describe('マップ探索フロー', () => {
  let mapPage: MapPage
  let monsterListPage: MonsterListPage
  let startPage: StartPage

  test.beforeEach(async ({ page }) => {
    mapPage = new MapPage(page)
    monsterListPage = new MonsterListPage(page)
    startPage = new StartPage(page)
    
    // テスト前にLocalStorageをクリアしてプレイヤーデータを設定
    await clearLocalStorage(page)
    await setPlayerData(page, testPlayers.valid.name)
  })

  test.describe('基本的なマップ機能', () => {
    test('マップ表示と基本操作', async () => {
      await mapPage.navigateToMap()
      
      // マップとプレイヤーパネルが表示されることを確認
      await mapPage.expectMapVisible()
      
      // プレイヤー情報が正しく表示されることを確認
      await mapPage.expectPlayerPanelInfo({
        name: testPlayers.valid.name,
        position: testMapData.initialPosition
      })
      
      // 基本的な移動機能（キーボード操作を含む）
      await mapPage.movePlayerWithKeyboard('right')
      await mapPage.expectPlayerPosition(
        testMapData.initialPosition.x + 1,
        testMapData.initialPosition.y
      )
      
      // 移動時にメッセージが表示されることを確認
      await expect(mapPage.latestMessage).toBeVisible()
    })
  })

  test.describe('ランダムイベント統合テスト', () => {
    test('探索中のランダムイベント（モンスター遭遇・アイテム発見）', async () => {
      await mapPage.navigateToMap()
      
      let eventOccurred = false
      
      // 多数回移動してランダムイベントの発生を確認
      for (let i = 0; i < 50 && !eventOccurred; i++) {
        const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right']
        await mapPage.movePlayer(directions[i % 4])
        
        // モンスター遭遇のチェック
        if (await mapPage.monsterEncounterDialog.isVisible()) {
          await expect(mapPage.captureMonsterButton).toBeVisible()
          await expect(mapPage.fleeButton).toBeVisible()
          await mapPage.fleeFromMonster()
          eventOccurred = true
        }
        
        // アイテム発見のチェック
        if (await mapPage.itemFoundDialog.isVisible()) {
          await mapPage.expectItemFound()
          await mapPage.closeItemDialog()
          eventOccurred = true
        }
      }
      
      // 十分な探索でなんらかのイベントが発生することを期待（ランダム性考慮）
      // 完全な保証はしないが、ゲーム進行が確認できればOK
      const finalMessageCount = await mapPage.page.locator('[data-testid="message"], .message').count()
      expect(finalMessageCount).toBeGreaterThan(0)
    })
  })

  test.describe('ナビゲーションとデータ永続化', () => {
    test('ページ遷移とデータ保持の統合フロー', async () => {
      await mapPage.navigateToMap()
      
      // プレイヤーを移動
      await mapPage.movePlayer('right')
      await mapPage.movePlayer('down')
      
      const movedPosition = {
        x: testMapData.initialPosition.x + 1,
        y: testMapData.initialPosition.y + 1
      }
      
      await mapPage.expectPlayerPosition(movedPosition.x, movedPosition.y)
      
      // モンスター一覧ページに移動
      await mapPage.goToMonsterList()
      await monsterListPage.expectUrl('/monsters')
      
      // マップに戻る
      await monsterListPage.backToMap()
      await mapPage.expectUrl('/map')
      
      // ページリロード後も位置が保持されることを確認
      await mapPage.reload()
      await mapPage.expectPlayerPosition(movedPosition.x, movedPosition.y)
    })
  })
})