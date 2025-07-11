/**
 * プレイヤー作成フローのE2Eテスト
 * ゲーム開始からプレイヤー名入力までの完全なフローをテスト
 */

import { test, expect } from '@playwright/test'
import { StartPage } from '../pages/start-page'
import { MapPage } from '../pages/map-page'
import { clearLocalStorage, setPlayerData } from '../utils/helpers'
import { testPlayers, errorMessages, testUrls } from '../fixtures/test-data'

test.describe('プレイヤー作成フロー', () => {
  let startPage: StartPage
  let mapPage: MapPage

  test.beforeEach(async ({ page }) => {
    startPage = new StartPage(page)
    mapPage = new MapPage(page)
    
    // テスト前にLocalStorageをクリア
    await clearLocalStorage(page)
  })

  test.describe('新規プレイヤー作成', () => {
    test('正常フロー: プレイヤー作成からゲーム開始まで', async ({ page }) => {
      // API レスポンスをモック
      await page.route('**/api/players', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            data: {
              id: 'test-player-id',
              name: testPlayers.valid.name,
              createdAt: new Date().toISOString()
            }
          })
        })
      })
      
      // スタートページに移動
      await startPage.navigateToStart()
      
      // プレイヤー作成フォームが表示されることを確認
      await startPage.expectNewGameForm()
      
      // プレイヤー名を入力してゲーム開始（Enterキーも含めてテスト）
      await startPage.enterPlayerName(testPlayers.valid.name)
      await startPage.submitFormWithEnter()
      
      // アプリの遷移を待つ
      await startPage.page.waitForTimeout(2000)
      
      // プレイヤー作成ページに遷移することを確認
      await startPage.expectUrl(testUrls.playerCreation)
    })
  })

  test.describe('既存ゲーム継続フロー', () => {
    test('既存ゲームの検出と継続・新規作成の選択', async ({ page }) => {
      // 既存のプレイヤーデータを設定
      await setPlayerData(page, testPlayers.valid.name)
      
      await startPage.navigateToStart()
      
      // 既存ゲームの選択肢が表示されることを確認
      await startPage.expectExistingGameOptions()
      
      // ゲームを続きから開始
      await startPage.clickContinueGame()
      
      // マップページに遷移し、プレイヤー名が保持されることを確認
      await mapPage.expectUrl(testUrls.map)
      await mapPage.expectPlayerName(testPlayers.valid.name)
    })
  })
})