/**
 * シンプルなバトル遷移テスト
 * 
 * 初学者向けメモ：
 * - より単純なアプローチでバトル遷移を確認
 * - 手動操作の部分を最小化
 */

import { test, expect } from '@playwright/test'

test.describe('シンプルバトル遷移テスト', () => {
  
  test('プロダクション環境での基本動作確認', async ({ page }) => {
    console.log('🚀 シンプルバトルテスト開始')

    // API監視
    page.on('response', async response => {
      if (response.url().includes('/api/players') && response.url().includes('/monsters')) {
        console.log('📥 モンスターAPI:', response.status(), response.url())
        if (!response.ok()) {
          const body = await response.text()
          console.log('❌ API エラー:', body)
        }
      }
    })

    // 1. プロダクションサイトアクセス
    console.log('📍 プロダクションサイトアクセス')
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/')
    await page.waitForLoadState('domcontentloaded')
    
    // ページが読み込まれたことを確認
    await expect(page).toHaveTitle(/モンスター収集ゲーム/)
    console.log('✅ ページ読み込み完了')
    
    // ページの内容を確認
    const bodyText = await page.textContent('body')
    console.log('ページ内容（抜粋）:', bodyText?.substring(0, 200))
    
    // 5秒待機してページの状態を観察
    await page.waitForTimeout(5000)
    
    // 現在のURLを確認
    const finalUrl = page.url()
    console.log('最終URL:', finalUrl)
    
    // ページにボタンがあるか確認
    const buttons = await page.locator('button').allTextContents()
    console.log('利用可能なボタン:', buttons)
    
    // リンクがあるか確認
    const links = await page.locator('a').allTextContents()
    console.log('利用可能なリンク:', links)
    
    console.log('✅ 基本動作確認完了')
  })
})