/**
 * スタートページのPageObjectクラス
 * プレイヤー名入力とゲーム開始機能をテスト
 */

import { Page, expect, Locator } from '@playwright/test'
import { BasePage } from './base-page'
import { testUrls, testPlayers } from '../fixtures/test-data'

/**
 * スタートページ（プレイヤー名入力画面）のPageObject
 */
export class StartPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  /**
   * プレイヤー名入力フィールド
   */
  get playerNameInput(): Locator {
    return this.page.locator('[data-testid="player-name-input"], input[placeholder*="プレイヤー名"], input[name="playerName"]')
  }

  /**
   * ゲーム開始ボタン
   */
  get startGameButton(): Locator {
    return this.page.locator('[data-testid="start-game-button"], button:has-text("ゲーム開始"), button:has-text("開始")')
  }

  /**
   * 続きからプレイボタン
   */
  get continueGameButton(): Locator {
    return this.page.locator('[data-testid="continue-game-button"], button:has-text("続きから"), button:has-text("ゲーム再開")')
  }

  /**
   * 新しくプレイボタン
   */
  get newGameButton(): Locator {
    return this.page.locator('[data-testid="new-game-button"], button:has-text("新しく"), button:has-text("最初から")')
  }

  /**
   * バリデーションエラーメッセージ
   */
  get validationError(): Locator {
    return this.page.locator('[data-testid="validation-error"], .error-message, .text-red-600')
  }

  /**
   * プレイヤー名入力フォーム
   */
  get playerForm(): Locator {
    return this.page.locator('form, [data-testid="player-form"]')
  }

  /**
   * 既存ゲーム検出メッセージ
   */
  get existingGameMessage(): Locator {
    return this.page.locator('[data-testid="existing-game"], :text("既存のゲーム")')
  }

  /**
   * スタートページに移動
   */
  async navigateToStart(): Promise<void> {
    await this.navigateTo(testUrls.start)
    await this.expectPageLoaded()
  }

  /**
   * プレイヤー名を入力
   */
  async enterPlayerName(name: string): Promise<void> {
    await this.playerNameInput.fill(name)
  }

  /**
   * ゲーム開始ボタンをクリック
   */
  async clickStartGame(): Promise<void> {
    await this.startGameButton.click()
    await this.waitForLoading()
  }

  /**
   * 続きからプレイボタンをクリック
   */
  async clickContinueGame(): Promise<void> {
    await this.continueGameButton.click()
    await this.waitForLoading()
  }

  /**
   * 新しくプレイボタンをクリック
   */
  async clickNewGame(): Promise<void> {
    await this.newGameButton.click()
    await this.waitForLoading()
  }

  /**
   * プレイヤー名を入力してゲーム開始
   */
  async startGameWithName(name: string = testPlayers.valid.name): Promise<void> {
    await this.enterPlayerName(name)
    await this.clickStartGame()
  }

  /**
   * フォームをSubmit（Enterキー）
   */
  async submitFormWithEnter(): Promise<void> {
    await this.playerNameInput.press('Enter')
    await this.waitForLoading()
  }

  /**
   * バリデーションエラーが表示されることを確認
   */
  async expectValidationError(expectedMessage: string): Promise<void> {
    await expect(this.validationError).toBeVisible()
    await expect(this.validationError).toContainText(expectedMessage)
  }

  /**
   * プレイヤー名入力フィールドの状態を確認
   */
  async expectPlayerNameInput(expectedValue: string = ''): Promise<void> {
    await expect(this.playerNameInput).toBeVisible()
    if (expectedValue) {
      await expect(this.playerNameInput).toHaveValue(expectedValue)
    }
  }

  /**
   * ゲーム開始ボタンの状態を確認
   */
  async expectStartGameButton(enabled: boolean = true): Promise<void> {
    await expect(this.startGameButton).toBeVisible()
    if (enabled) {
      await expect(this.startGameButton).toBeEnabled()
    } else {
      await expect(this.startGameButton).toBeDisabled()
    }
  }

  /**
   * 既存ゲームの選択肢が表示されることを確認
   */
  async expectExistingGameOptions(): Promise<void> {
    await expect(this.existingGameMessage).toBeVisible()
    await expect(this.continueGameButton).toBeVisible()
    await expect(this.newGameButton).toBeVisible()
  }

  /**
   * プレイヤー名入力フォームのみが表示されることを確認
   */
  async expectNewGameForm(): Promise<void> {
    await expect(this.playerForm).toBeVisible()
    await expect(this.playerNameInput).toBeVisible()
    await expect(this.startGameButton).toBeVisible()
    await expect(this.continueGameButton).not.toBeVisible()
  }

  /**
   * 入力フィールドをクリア
   */
  async clearPlayerName(): Promise<void> {
    await this.playerNameInput.clear()
  }

  /**
   * フィールドフォーカス状態を確認
   */
  async expectPlayerNameFocused(): Promise<void> {
    await expect(this.playerNameInput).toBeFocused()
  }

  /**
   * プレースホルダーテキストを確認
   */
  async expectPlaceholder(expectedText: string): Promise<void> {
    await expect(this.playerNameInput).toHaveAttribute('placeholder', expectedText)
  }

  /**
   * フォームの送信状態（ローディング）を確認
   */
  async expectFormSubmitting(): Promise<void> {
    await expect(this.startGameButton).toBeDisabled()
    // ローディング状態の表示があれば確認
    try {
      await expect(this.loadingSpinner).toBeVisible()
    } catch {
      // ローディング表示がない場合はスキップ
    }
  }

  /**
   * キャラクター数制限のテキストを確認
   */
  async expectCharacterLimit(currentLength: number, maxLength: number): Promise<void> {
    const limitText = this.page.locator(`text=${currentLength} / ${maxLength}文字`)
    await expect(limitText).toBeVisible()
  }
}