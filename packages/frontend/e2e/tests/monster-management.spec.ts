/**
 * モンスター管理フローのE2Eテスト
 * モンスターのCRUD操作の完全なフローをテスト
 */

import { test, expect } from '@playwright/test'
import { MonsterListPage } from '../pages/monster-list-page'
import { MapPage } from '../pages/map-page'
import { clearLocalStorage, setPlayerData, setMonsterData } from '../utils/helpers'
import { testPlayers, testMonsters, errorMessages } from '../fixtures/test-data'

test.describe('モンスター管理フロー', () => {
  let monsterListPage: MonsterListPage
  let mapPage: MapPage

  test.beforeEach(async ({ page }) => {
    monsterListPage = new MonsterListPage(page)
    mapPage = new MapPage(page)
    
    // テスト前にLocalStorageをクリアしてプレイヤーデータを設定
    await clearLocalStorage(page)
    await setPlayerData(page, testPlayers.valid.name)
  })

  test.describe('モンスター基本機能', () => {
    test('空の状態とモンスター表示', async ({ page }) => {
      // 最初は空の状態
      await monsterListPage.navigateToMonsterList()
      await monsterListPage.expectEmptyState()
      
      // テスト用モンスターデータを設定
      await setMonsterData(page)
      await monsterListPage.reload()
      
      // モンスターが表示されることを確認
      await monsterListPage.expectMonsterCount(2)
      await monsterListPage.expectMonsterInList(0, {
        name: 'ファイアドラゴン',
        nickname: 'ポチ',
        type: 'fire'
      })
    })
  })

  test.describe('CRUD操作', () => {
    test('モンスター編集（ニックネーム変更）', async ({ page }) => {
      await setMonsterData(page)
      await monsterListPage.navigateToMonsterList()
      
      // ニックネームを編集
      const newNickname = 'ニューポチ'
      await monsterListPage.getMonsterCardElement(0, 'edit').click()
      await monsterListPage.expectEditMode(0, true)
      await monsterListPage.editMonster(0, newNickname)
      
      // 編集が反映されることを確認
      await monsterListPage.expectEditMode(0, false)
      await monsterListPage.expectMonsterInList(0, {
        nickname: newNickname
      })
    })

    test('モンスター削除機能', async ({ page }) => {
      await setMonsterData(page)
      await monsterListPage.navigateToMonsterList()
      
      // 削除機能のテスト
      await monsterListPage.expectMonsterCount(2)
      await monsterListPage.deleteMonster(0, true)
      await monsterListPage.expectMonsterCount(1)
      
      // 残ったモンスターの確認
      await monsterListPage.expectMonsterInList(0, {
        name: 'ウォータータートル'
      })
    })
  })

  test.describe('ナビゲーションとデータ永続化', () => {
    test('ページ遷移とデータ保持の統合テスト', async ({ page }) => {
      await setMonsterData(page)
      await monsterListPage.navigateToMonsterList()
      
      // データ永続化テスト
      await monsterListPage.expectMonsterCount(2)
      await monsterListPage.reload()
      await monsterListPage.expectMonsterCount(2)
      
      // ナビゲーションテスト
      await monsterListPage.backToMap()
      await mapPage.expectUrl('/map')
      await mapPage.expectMapVisible()
      
      // 再度戻ってデータ確認
      await mapPage.goToMonsterList()
      await monsterListPage.expectUrl('/monsters')
      await monsterListPage.expectMonsterCount(2)
    })
  })
})