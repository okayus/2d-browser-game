/**
 * E2Eテスト用共通ヘルパー関数
 * テスト間で再利用できる便利な機能を提供
 */

import { Page, expect } from '@playwright/test'
import { testPlayers, waitTimes } from '../fixtures/test-data'

/**
 * LocalStorageをクリアする
 * テスト間でのデータ汚染を防ぐ
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear()
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear()
      }
    })
  } catch (error) {
    // LocalStorageアクセスエラーを無視（開発サーバーが起動していない場合など）
    console.warn('LocalStorage clear failed:', error)
  }
}

/**
 * プレイヤーデータをLocalStorageに設定
 * テストの前提条件として使用
 */
export async function setPlayerData(page: Page, playerName: string = testPlayers.valid.name): Promise<void> {
  try {
    await page.evaluate((name) => {
      if (typeof localStorage !== 'undefined') {
        const gameState = {
          playerName: name,
          playerId: 'test-player-id',
          currentLocation: { x: 5, y: 5 },
          lastSave: new Date().toISOString()
        }
        localStorage.setItem('gameState', JSON.stringify(gameState))
        localStorage.setItem('player_id', 'test-player-id')
        localStorage.setItem('player_name', name)
      }
    }, playerName)
  } catch (error) {
    console.warn('LocalStorage setPlayerData failed:', error)
  }
}

/**
 * モンスターデータをLocalStorageに設定
 * モンスター一覧画面のテスト用
 */
export async function setMonsterData(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      if (typeof localStorage !== 'undefined') {
        const monsters = [
          {
            id: 'monster-1',
            species: { name: 'ファイアドラゴン', type: 'fire' },
            nickname: 'ポチ',
            level: 5,
            hp: 100,
            capturedAt: new Date().toISOString()
          },
          {
            id: 'monster-2', 
            species: { name: 'ウォータータートル', type: 'water' },
            nickname: '',
            level: 3,
            hp: 80,
            capturedAt: new Date().toISOString()
          }
        ]
        localStorage.setItem('monsters', JSON.stringify(monsters))
      }
    })
  } catch (error) {
    console.warn('LocalStorage setMonsterData failed:', error)
  }
}

/**
 * ページが完全に読み込まれるまで待機
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(waitTimes.short)
}

/**
 * エラーメッセージが表示されることを確認
 */
export async function expectErrorMessage(page: Page, message: string): Promise<void> {
  await expect(page.locator(`text=${message}`)).toBeVisible()
}

/**
 * 成功メッセージが表示されることを確認
 */
export async function expectSuccessMessage(page: Page, message: string): Promise<void> {
  await expect(page.locator(`text=${message}`)).toBeVisible()
}

/**
 * フォーム入力とSubmitのヘルパー
 */
export async function fillFormAndSubmit(
  page: Page, 
  formSelector: string, 
  fieldValues: Record<string, string>,
  submitSelector: string
): Promise<void> {
  const form = page.locator(formSelector)
  
  for (const [field, value] of Object.entries(fieldValues)) {
    await form.locator(`input[name="${field}"], input[placeholder*="${field}"]`).fill(value)
  }
  
  await form.locator(submitSelector).click()
}

/**
 * テーブル内のデータを検証
 */
export async function expectTableData(
  page: Page, 
  tableSelector: string, 
  expectedData: string[][]
): Promise<void> {
  const table = page.locator(tableSelector)
  
  for (let rowIndex = 0; rowIndex < expectedData.length; rowIndex++) {
    const row = table.locator('tr').nth(rowIndex)
    
    for (let colIndex = 0; colIndex < expectedData[rowIndex].length; colIndex++) {
      const cell = row.locator('td').nth(colIndex)
      await expect(cell).toContainText(expectedData[rowIndex][colIndex])
    }
  }
}

/**
 * モーダルダイアログを確認して閉じる
 */
export async function handleModal(
  page: Page, 
  expectedText: string, 
  action: 'confirm' | 'cancel' = 'confirm'
): Promise<void> {
  const modal = page.locator('[role="dialog"], .modal')
  await expect(modal).toBeVisible()
  await expect(modal).toContainText(expectedText)
  
  const buttonText = action === 'confirm' ? /確認|はい|OK/ : /キャンセル|いいえ|Cancel/
  await modal.locator(`button:has-text("${buttonText.source}")`).click()
  
  await expect(modal).not.toBeVisible()
}

/**
 * ローディング状態の待機
 */
export async function waitForLoading(page: Page): Promise<void> {
  // ローディングスピナーが表示される場合
  const spinner = page.locator('[data-testid="loading"], .loading, .spinner')
  
  try {
    await spinner.waitFor({ state: 'visible', timeout: 1000 })
    await spinner.waitFor({ state: 'hidden', timeout: 10000 })
  } catch {
    // ローディング表示がない場合はスキップ
  }
}

/**
 * 要素が画面に表示されるまでスクロール
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector)
  await element.scrollIntoViewIfNeeded()
  await element.waitFor({ state: 'visible' })
}

/**
 * キーボード操作でのナビゲーション
 */
export async function navigateWithKeyboard(page: Page, direction: 'up' | 'down' | 'left' | 'right'): Promise<void> {
  const keyMap = {
    up: 'ArrowUp',
    down: 'ArrowDown', 
    left: 'ArrowLeft',
    right: 'ArrowRight'
  }
  
  await page.keyboard.press(keyMap[direction])
  await page.waitForTimeout(waitTimes.short)
}

/**
 * ネットワークレスポンスのモック設定
 */
export async function mockApiResponse(
  page: Page, 
  url: string, 
  response: any, 
  status: number = 200
): Promise<void> {
  await page.route(url, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response)
    })
  })
}