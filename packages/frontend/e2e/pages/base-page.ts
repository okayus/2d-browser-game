/**
 * ベースページクラス
 * すべてのページオブジェクトで共通する機能を提供
 */

import { Page, expect, Locator } from '@playwright/test'
import { clearLocalStorage, waitForPageLoad } from '../utils/helpers'

/**
 * すべてのページオブジェクトの基底クラス
 * 共通のナビゲーションとヘルパーメソッドを提供
 */
export abstract class BasePage {
  constructor(protected page: Page) {}

  /**
   * ページのタイトル要素
   */
  get title(): Locator {
    return this.page.locator('h1, [data-testid="page-title"]')
  }

  /**
   * ローディングスピナー
   */
  get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading"], .loading, .spinner')
  }

  /**
   * エラーメッセージ
   */
  get errorMessage(): Locator {
    return this.page.locator('[data-testid="error-message"], .error-message')
  }

  /**
   * 成功メッセージ
   */
  get successMessage(): Locator {
    return this.page.locator('[data-testid="success-message"], .success-message')
  }

  /**
   * ナビゲーションメニュー
   */
  get navigation(): Locator {
    return this.page.locator('nav, [data-testid="navigation"]')
  }

  /**
   * ページに移動
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url)
    await waitForPageLoad(this.page)
  }

  /**
   * ページタイトルを確認
   */
  async expectPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.title).toContainText(expectedTitle)
  }

  /**
   * ローディング状態の待機
   */
  async waitForLoading(): Promise<void> {
    try {
      await this.loadingSpinner.waitFor({ state: 'visible', timeout: 1000 })
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 })
    } catch {
      // ローディング表示がない場合はスキップ
    }
  }

  /**
   * エラーメッセージが表示されることを確認
   */
  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible()
    await expect(this.errorMessage).toContainText(message)
  }

  /**
   * 成功メッセージが表示されることを確認
   */
  async expectSuccess(message: string): Promise<void> {
    await expect(this.successMessage).toBeVisible()
    await expect(this.successMessage).toContainText(message)
  }

  /**
   * ページをリロード
   */
  async reload(): Promise<void> {
    await this.page.reload()
    await waitForPageLoad(this.page)
  }

  /**
   * LocalStorageをクリアしてページをリロード
   */
  async resetPage(): Promise<void> {
    await clearLocalStorage(this.page)
    await this.reload()
  }

  /**
   * モーダルダイアログの処理
   */
  async handleModal(expectedText: string, action: 'confirm' | 'cancel' = 'confirm'): Promise<void> {
    const modal = this.page.locator('[role="dialog"], .modal, [data-testid="modal"]')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText(expectedText)
    
    const buttonSelector = action === 'confirm' 
      ? 'button:has-text("確認"), button:has-text("はい"), button:has-text("OK")'
      : 'button:has-text("キャンセル"), button:has-text("いいえ"), button:has-text("Cancel")'
    
    await modal.locator(buttonSelector).click()
    await expect(modal).not.toBeVisible()
  }

  /**
   * フォームの入力とSubmit
   */
  async fillForm(formSelector: string, fieldValues: Record<string, string>): Promise<void> {
    const form = this.page.locator(formSelector)
    
    for (const [field, value] of Object.entries(fieldValues)) {
      const input = form.locator(`input[name="${field}"], input[data-testid="${field}"], input[placeholder*="${field}"]`)
      await input.fill(value)
    }
  }

  /**
   * 要素が表示されるまで待機
   */
  async waitForElement(selector: string, timeout: number = 5000): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout })
  }

  /**
   * 要素が非表示になるまで待機
   */
  async waitForElementHidden(selector: string, timeout: number = 5000): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout })
  }

  /**
   * キーボード操作
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key)
  }

  /**
   * スクリーンショットを撮影
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true })
  }

  /**
   * ページの現在のURLを取得
   */
  getCurrentUrl(): string {
    return this.page.url()
  }

  /**
   * 特定のURLにいることを確認
   */
  async expectUrl(expectedUrl: string): Promise<void> {
    expect(this.getCurrentUrl()).toContain(expectedUrl)
  }

  /**
   * ページが完全に読み込まれていることを確認
   */
  async expectPageLoaded(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
    await expect(this.page.locator('body')).toBeVisible()
  }
}