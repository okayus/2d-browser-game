/**
 * ログイン画面デバッグテスト
 * 
 * 初学者向けメモ：
 * - ログインフォームの実際の構造を調査
 * - マップ画面に遷移できない原因を特定
 */

import { test, expect } from '@playwright/test'

test.describe('ログイン画面デバッグ', () => {
  
  test('ログインフォームの構造を調査', async ({ page }) => {
    console.log('🔍 ログイン画面の構造調査開始')

    // 1. トップページへアクセス
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/')
    await page.waitForLoadState('networkidle')
    console.log('✅ トップページ読み込み完了')

    // 2. ログインページへ遷移
    await page.getByRole('link', { name: 'ログイン' }).first().click()
    await page.waitForLoadState('networkidle')
    console.log('✅ ログインページへ遷移')

    // 3. ページのURL確認
    const loginUrl = page.url()
    console.log('📍 ログインページURL:', loginUrl)

    // 4. フォーム要素の調査
    console.log('\n📋 フォーム要素の調査:')
    
    // input要素を全て取得
    const inputs = await page.locator('input').all()
    console.log(`- input要素数: ${inputs.length}`)
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i]
      const type = await input.getAttribute('type')
      const name = await input.getAttribute('name')
      const placeholder = await input.getAttribute('placeholder')
      const id = await input.getAttribute('id')
      console.log(`  Input ${i + 1}: type="${type}", name="${name}", id="${id}", placeholder="${placeholder}"`)
    }

    // 5. ボタン要素の調査
    console.log('\n🔘 ボタン要素の調査:')
    const buttons = await page.locator('button').all()
    console.log(`- button要素数: ${buttons.length}`)
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const text = await button.textContent()
      const type = await button.getAttribute('type')
      console.log(`  Button ${i + 1}: text="${text}", type="${type}"`)
    }

    // 6. 実際にログインを試行
    console.log('\n🔑 ログイン試行:')
    
    // メールアドレス入力を試す（複数のパターン）
    let emailInput = page.locator('input[name="email"]')
    if (!(await emailInput.isVisible())) {
      emailInput = page.locator('input[type="email"]')
    }
    if (!(await emailInput.isVisible())) {
      emailInput = page.locator('input').filter({ hasText: /メール|email/i }).first()
    }
    
    // パスワード入力を試す
    let passwordInput = page.locator('input[name="password"]')
    if (!(await passwordInput.isVisible())) {
      passwordInput = page.locator('input[type="password"]')
    }
    
    // 入力を実行
    try {
      await emailInput.fill('newuser123@example.com')
      console.log('✅ メールアドレス入力成功')
    } catch (e) {
      console.log('❌ メールアドレス入力失敗:', e.message)
    }
    
    try {
      await passwordInput.fill('password123')
      console.log('✅ パスワード入力成功')
    } catch (e) {
      console.log('❌ パスワード入力失敗:', e.message)
    }

    // 7. ログインボタンをクリック
    console.log('\n🚀 ログインボタンクリック:')
    
    try {
      // 複数のパターンでログインボタンを探す
      let loginButton = page.getByRole('button', { name: /ログイン|login/i })
      if (!(await loginButton.isVisible())) {
        loginButton = page.locator('button[type="submit"]')
      }
      
      await loginButton.click()
      console.log('✅ ログインボタンクリック成功')
      
      // ログイン処理を待つ
      await page.waitForTimeout(8000)
      
      // ログイン後のURLを確認
      const afterLoginUrl = page.url()
      console.log('📍 ログイン後のURL:', afterLoginUrl)
      
      // ページの状態を確認
      const pageTitle = await page.title()
      console.log('📄 ページタイトル:', pageTitle)
      
      // エラーメッセージの確認
      const errorMessages = await page.locator('.error, .alert, [role="alert"]').allTextContents()
      if (errorMessages.length > 0) {
        console.log('❌ エラーメッセージ:', errorMessages)
      }
      
    } catch (e) {
      console.log('❌ ログインボタンクリック失敗:', e.message)
    }

    // 8. 最終状態の確認
    console.log('\n📊 最終状態:')
    console.log('- 最終URL:', page.url())
    console.log('- ページタイトル:', await page.title())
    
    // body内のテキストの一部を取得
    const bodyText = await page.locator('body').textContent()
    console.log('- ページ内容（100文字）:', bodyText?.substring(0, 100))
  })
})