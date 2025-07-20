/**
 * プレイヤー作成デバッグテスト
 * 
 * 初学者向けメモ：
 * - プレイヤー作成APIの応答を詳しく監視
 * - マップ画面に遷移しない原因を特定
 */

import { test, expect } from '@playwright/test'

test.describe('プレイヤー作成デバッグ', () => {
  
  test('プレイヤー作成とマップ遷移の詳細確認', async ({ page }) => {
    console.log('🔍 プレイヤー作成デバッグ開始')

    // API監視（詳細版）
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`📤 API: ${request.method()} ${request.url()}`)
        if (request.method() === 'POST') {
          const postData = request.postData()
          if (postData) {
            console.log('📤 Body:', postData)
          }
        }
      }
    })

    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        console.log(`📥 API: ${response.status()} ${response.url()}`)
        try {
          const body = await response.text()
          console.log('📥 Response:', body)
        } catch (e) {
          console.log('📥 Response body読み取り失敗')
        }
      }
    })

    // コンソールログも監視
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text())
      }
    })

    // 1. ログインまでの処理
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/')
    await page.waitForLoadState('networkidle')
    
    await page.getByRole('link', { name: 'ログイン', exact: true }).click()
    await page.waitForLoadState('networkidle')
    
    await page.locator('#email').fill('newuser123@example.com')
    await page.locator('#password').fill('password123')
    await page.getByRole('button', { name: 'ログイン', exact: true }).click()
    await page.waitForTimeout(8000)

    // 2. プレイヤー作成画面確認
    const currentUrl = page.url()
    if (!currentUrl.includes('/player-creation')) {
      console.log('❌ プレイヤー作成画面ではありません:', currentUrl)
      return
    }

    console.log('✅ プレイヤー作成画面に到達')

    // 3. プレイヤー作成フォーム入力
    console.log('📝 フォーム入力開始')
    
    // プレイヤー名
    await page.locator('#playerName').fill('DebugTestUser')
    console.log('✅ プレイヤー名入力完了')
    
    // モンスター選択
    await page.getByTestId('monster-option-electric_mouse').click()
    console.log('✅ モンスター選択完了')
    
    // ボタンの状態を確認
    const button = page.getByRole('button', { name: '冒険を開始する' })
    const isDisabled = await button.isDisabled()
    console.log(`🔘 ボタン状態: ${isDisabled ? '無効' : '有効'}`)
    
    // 4. プレイヤー作成実行
    console.log('🚀 プレイヤー作成実行')
    await button.click()
    
    // 5. 遷移を待機（長めに設定）
    console.log('⏳ 画面遷移を待機中...')
    
    // 複数の可能性を待つ
    try {
      await Promise.race([
        page.waitForURL('**/map', { timeout: 20000 }),
        page.waitForSelector('[role="alert"]', { timeout: 20000 }),
        page.waitForTimeout(20000)
      ])
    } catch (e) {
      console.log('⏰ 待機タイムアウト')
    }
    
    // 6. 最終状態を確認
    const finalUrl = page.url()
    console.log('📍 最終URL:', finalUrl)
    
    if (finalUrl.includes('/map')) {
      console.log('✅ マップ画面に遷移成功！')
    } else {
      console.log('❌ マップ画面への遷移失敗')
      
      // エラーメッセージを確認
      const alerts = await page.locator('[role="alert"]').allTextContents()
      if (alerts.length > 0) {
        console.log('🚨 エラーメッセージ:', alerts)
      }
      
      // ページ内容の一部を表示
      const bodyText = await page.locator('body').textContent()
      console.log('📄 ページ内容（300文字）:', bodyText?.substring(0, 300))
    }
    
    // LocalStorageの内容も確認
    const localStorage = await page.evaluate(() => {
      return {
        player_id: window.localStorage.getItem('player_id'),
        player_name: window.localStorage.getItem('player_name'),
        game_state: window.localStorage.getItem('game_state'),
        selected_monster: window.localStorage.getItem('selected_monster')
      }
    })
    console.log('💾 LocalStorage:', localStorage)
  })
})