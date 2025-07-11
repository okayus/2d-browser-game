/**
 * モンスター一覧ページのPageObjectクラス
 * モンスターのCRUD操作をテスト
 */

import { Page, expect, Locator } from '@playwright/test'
import { BasePage } from './base-page'
import { testUrls } from '../fixtures/test-data'

/**
 * モンスター一覧ページのPageObject
 */
export class MonsterListPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  /**
   * モンスターカードのリスト
   */
  get monsterCards(): Locator {
    return this.page.locator('[data-testid*="monster-card-"], [data-testid="monster-card"], .monster-card')
  }

  /**
   * 空の状態メッセージ
   */
  get emptyStateMessage(): Locator {
    return this.page.locator('[data-testid="empty-state"], [data-testid="empty-monsters"], :text("モンスターがいません")')
  }

  /**
   * ソート選択
   */
  get sortSelect(): Locator {
    return this.page.locator('[data-testid="sort-select"], select[name="sortBy"]')
  }

  /**
   * フィルター選択
   */
  get filterSelect(): Locator {
    return this.page.locator('[data-testid="filter-select"], select[name="filterSpecies"]')
  }

  /**
   * 検索入力フィールド
   */
  get searchInput(): Locator {
    return this.page.locator('[data-testid="search-input"], input[placeholder*="検索"]')
  }

  /**
   * 新しいモンスター追加ボタン
   */
  get addMonsterButton(): Locator {
    return this.page.locator('[data-testid="add-monster-button"], button:has-text("追加")')
  }

  /**
   * マップに戻るボタン
   */
  get backToMapButton(): Locator {
    return this.page.locator('[data-testid="back-to-map-button"], [data-testid="back-to-map"], button:has-text("マップに戻る")')
  }

  /**
   * モンスター一覧ページに移動
   */
  async navigateToMonsterList(): Promise<void> {
    await this.navigateTo(testUrls.monsterList)
    await this.expectPageLoaded()
  }

  /**
   * 特定のモンスターカードを取得
   */
  getMonsterCard(index: number): Locator {
    return this.monsterCards.nth(index)
  }

  /**
   * モンスターカード内の要素を取得
   */
  getMonsterCardElement(index: number, element: 'name' | 'nickname' | 'level' | 'type' | 'edit' | 'delete'): Locator {
    const card = this.getMonsterCard(index)
    
    switch (element) {
      case 'name':
        return card.locator('[data-testid*="monster-name-"], [data-testid="monster-name"], .monster-name')
      case 'nickname':
        return card.locator('[data-testid="monster-nickname"], .monster-nickname')
      case 'level':
        return card.locator('[data-testid="monster-level"], .monster-level')
      case 'type':
        return card.locator('[data-testid="monster-type"], .monster-type')
      case 'edit':
        return card.locator('[data-testid*="edit-button-"], [data-testid="edit-monster"], button:has-text("編集")')
      case 'delete':
        return card.locator('[data-testid*="release-button-"], [data-testid="delete-monster"], button:has-text("逃がす"), button:has-text("削除")')
      default:
        throw new Error(`Unknown element: ${element}`)
    }
  }

  /**
   * モンスターの総数を取得
   */
  async getMonsterCount(): Promise<number> {
    return await this.monsterCards.count()
  }

  /**
   * 空の状態であることを確認
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyStateMessage).toBeVisible()
    await expect(this.monsterCards).toHaveCount(0)
  }

  /**
   * 指定した数のモンスターが表示されることを確認
   */
  async expectMonsterCount(expectedCount: number): Promise<void> {
    await expect(this.monsterCards).toHaveCount(expectedCount)
  }

  /**
   * 特定のモンスターが表示されることを確認
   */
  async expectMonsterInList(index: number, expectedData: {
    name?: string
    nickname?: string
    level?: string
    type?: string
  }): Promise<void> {
    const card = this.getMonsterCard(index)
    await expect(card).toBeVisible()

    if (expectedData.name) {
      await expect(this.getMonsterCardElement(index, 'name')).toContainText(expectedData.name)
    }
    if (expectedData.nickname) {
      await expect(this.getMonsterCardElement(index, 'nickname')).toContainText(expectedData.nickname)
    }
    if (expectedData.level) {
      await expect(this.getMonsterCardElement(index, 'level')).toContainText(expectedData.level)
    }
    if (expectedData.type) {
      await expect(this.getMonsterCardElement(index, 'type')).toContainText(expectedData.type)
    }
  }

  /**
   * モンスターを編集
   */
  async editMonster(index: number, newNickname: string): Promise<void> {
    const editButton = this.getMonsterCardElement(index, 'edit')
    await editButton.click()

    // 編集モードになることを確認
    const editInput = this.page.locator('[data-testid="edit-nickname-input"], input[name="nickname"]')
    await expect(editInput).toBeVisible()
    
    // ニックネームを入力
    await editInput.fill(newNickname)
    
    // 保存ボタンをクリック
    const saveButton = this.page.locator('[data-testid*="save-button-"], [data-testid="save-edit"], button:has-text("保存")')
    await saveButton.click()
    
    await this.waitForLoading()
  }

  /**
   * モンスターを削除
   */
  async deleteMonster(index: number, confirmDeletion: boolean = true): Promise<void> {
    const deleteButton = this.getMonsterCardElement(index, 'delete')
    await deleteButton.click()

    // confirmダイアログでの確認（モーダルダイアログではなくブラウザーダイアログ）
    if (confirmDeletion) {
      this.page.once('dialog', dialog => dialog.accept())
    } else {
      this.page.once('dialog', dialog => dialog.dismiss())
    }

    await this.waitForLoading()
  }

  /**
   * ソート条件を変更
   */
  async sortBy(sortOption: 'capturedAt' | 'name' | 'species'): Promise<void> {
    await this.sortSelect.selectOption(sortOption)
    await this.waitForLoading()
  }

  /**
   * フィルター条件を変更
   */
  async filterBySpecies(species: string): Promise<void> {
    await this.filterSelect.selectOption(species)
    await this.waitForLoading()
  }

  /**
   * モンスターを検索
   */
  async searchMonsters(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm)
    await this.page.waitForTimeout(500) // 検索のデバウンス待機
  }

  /**
   * 検索結果をクリア
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear()
    await this.page.waitForTimeout(500)
  }

  /**
   * マップに戻る
   */
  async backToMap(): Promise<void> {
    await this.backToMapButton.click()
    await this.waitForLoading()
  }

  /**
   * モンスターの並び順を確認
   */
  async expectMonsterOrder(expectedNames: string[]): Promise<void> {
    for (let i = 0; i < expectedNames.length; i++) {
      await expect(this.getMonsterCardElement(i, 'name')).toContainText(expectedNames[i])
    }
  }

  /**
   * 編集モードの状態を確認
   */
  async expectEditMode(index: number, isEditing: boolean): Promise<void> {
    const card = this.getMonsterCard(index)
    const editInput = card.locator('[data-testid="edit-nickname-input"], input[name="nickname"]')
    const saveButton = card.locator('[data-testid="save-edit"], button:has-text("保存")')
    const cancelButton = card.locator('[data-testid="cancel-edit"], button:has-text("キャンセル")')

    if (isEditing) {
      await expect(editInput).toBeVisible()
      await expect(saveButton).toBeVisible()
      await expect(cancelButton).toBeVisible()
    } else {
      await expect(editInput).not.toBeVisible()
      await expect(saveButton).not.toBeVisible()
      await expect(cancelButton).not.toBeVisible()
    }
  }

  /**
   * 編集をキャンセル
   */
  async cancelEdit(index: number): Promise<void> {
    const card = this.getMonsterCard(index)
    const cancelButton = card.locator('[data-testid="cancel-edit"], button:has-text("キャンセル")')
    await cancelButton.click()
  }

  /**
   * フィルター・ソートコントロールが表示されることを確認
   */
  async expectControlsVisible(): Promise<void> {
    await expect(this.sortSelect).toBeVisible()
    await expect(this.filterSelect).toBeVisible()
    await expect(this.searchInput).toBeVisible()
  }

  /**
   * ページネーションが存在する場合の操作
   */
  async goToPage(pageNumber: number): Promise<void> {
    const pagination = this.page.locator('[data-testid="pagination"]')
    if (await pagination.isVisible()) {
      await pagination.locator(`button:has-text("${pageNumber}")`).click()
      await this.waitForLoading()
    }
  }
}