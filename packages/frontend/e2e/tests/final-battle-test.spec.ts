/**
 * 最終バトル遷移テスト（認証修正後確認版）
 * 
 * 初学者向けメモ：
 * - 認証修正後のバトル遷移を完全に確認
 * - リンク形式のログインを使用
 * - モンスター取得APIの動作を詳細に監視
 */

import { test, expect } from '@playwright/test'

test.describe('最終バトル遷移テスト', () => {
  
  test('認証修正後のバトル画面遷移の完全確認', async ({ page }) => {
    console.log('🚀 最終バトル遷移テスト開始')

    // API監視の詳細設定
    const apiLogs: string[] = []
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        const authHeader = request.headers()['authorization']
        const logEntry = `📤 ${request.method()} ${request.url()} ${authHeader ? '[AUTH]' : '[NO_AUTH]'}`
        console.log(logEntry)
        apiLogs.push(logEntry)
      }
    })

    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        const logEntry = `📥 ${response.status()} ${response.url()}`
        console.log(logEntry)
        apiLogs.push(logEntry)
        
        if (!response.ok()) {
          try {
            const errorBody = await response.text()
            console.log('❌ Error details:', errorBody)
          } catch (e) {
            console.log('❌ Could not read error body')
          }
        }
      }
    })

    // 1. プロダクションサイトアクセス
    console.log('📍 ステップ1: プロダクションサイト')
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000) // Firebase認証の初期化を待つ

    // 2. ログインリンクをクリック
    console.log('🔑 ステップ2: ログインページへ')
    await page.getByRole('link', { name: 'ログイン' }).first().click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // 3. ログイン情報を入力
    console.log('📧 ステップ3: ログイン情報入力')
    await page.fill('input[name="email"]', 'newuser123@example.com')
    await page.fill('input[name="password"]', 'password123')
    
    // ログインボタンを押す
    await page.getByRole('button', { name: /ログイン/ }).click()
    await page.waitForTimeout(5000) // Firebase認証の処理を待つ

    // 4. プレイヤー作成（必要な場合）
    console.log('👤 ステップ4: プレイヤー作成確認')
    const currentUrl = page.url()
    console.log('現在のURL:', currentUrl)
    
    if (currentUrl.includes('/player-creation')) {
      console.log('🔧 プレイヤー作成を実行')
      await page.fill('input[name="playerName"]', 'FinalTestUser')
      await page.getByTestId('monster-card-electric_mouse').click()
      await page.getByRole('button', { name: 'プレイヤーを作成' }).click()
      await page.waitForTimeout(8000) // プレイヤー作成APIの処理を待つ
    }

    // 5. マップ画面到達確認
    console.log('🗺️ ステップ5: マップ画面確認')
    await page.waitForURL('**/map', { timeout: 20000 })
    
    // マップ要素の確認
    await expect(page.getByTestId('game-map-container')).toBeVisible()
    await expect(page.getByTestId('player-panel')).toBeVisible()
    console.log('✅ マップ画面の表示確認完了')

    // 6. モンスターエンカウント試行
    console.log('🎮 ステップ6: モンスターエンカウント試行')
    
    let encounterFound = false
    let battleSuccess = false
    const maxMoves = 25

    for (let move = 1; move <= maxMoves && !encounterFound; move++) {
      console.log(`🚶 移動 ${move}/${maxMoves}`)
      
      // ランダム移動
      const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      const direction = directions[Math.floor(Math.random() * directions.length)]
      
      await page.keyboard.press(direction)
      await page.waitForTimeout(3000) // エンカウント処理時間を確保

      // メッセージを確認
      try {
        const messageText = await page.getByTestId('message-area').textContent()
        
        if (messageText && messageText.includes('野生のモンスターが現れた')) {
          console.log('🎯 モンスターエンカウント発生！')
          encounterFound = true
          
          // バトル画面遷移を待機
          console.log('⏳ バトル画面遷移待機...')
          
          try {
            await page.waitForURL('**/battle', { timeout: 20000 })
            console.log('🎉 バトル画面遷移成功！')
            battleSuccess = true
            
            // バトル画面の確認
            await expect(page.locator('h1')).toContainText(['バトル', 'Battle', 'モンスター'])
            console.log('✅ バトル画面要素確認完了')
            
          } catch (error) {
            console.log('❌ バトル画面遷移失敗')
            
            // エラーメッセージの詳細確認
            const messages = await page.getByTestId('message-area').textContent()
            console.log('📝 最新メッセージ:', messages)
            
            // 警告メッセージをチェック
            const warnings = await page.locator('[data-testid*="message-warning"]').allTextContents()
            if (warnings.length > 0) {
              console.log('⚠️ 警告:', warnings)
            }
          }
          break
        } else if (messageText && messageText.includes('使用できるモンスターがいません')) {
          console.log('❌ 認証エラー発生: 使用できるモンスターがいません')
          break
        }
      } catch (error) {
        // メッセージ取得失敗は続行
      }
    }

    // 7. 結果まとめ
    console.log('\n📊 テスト結果:')
    console.log(`- プロダクションアクセス: ✅`)
    console.log(`- ログイン: ✅`)
    console.log(`- マップ画面遷移: ✅`)
    console.log(`- モンスターエンカウント: ${encounterFound ? '✅' : '❌'}`)
    console.log(`- バトル画面遷移: ${battleSuccess ? '✅' : '❌'}`)
    
    console.log('\n📈 API呼び出し履歴:')
    apiLogs.forEach(log => console.log(log))

    // 最終判定
    if (encounterFound && battleSuccess) {
      console.log('\n🎉 ✅ 認証修正により、バトル遷移が正常に動作しました！')
    } else if (encounterFound) {
      console.log('\n⚠️ モンスターエンカウントは発生しましたが、バトル遷移で問題があります')
    } else {
      console.log('\n⚠️ モンスターエンカウントが発生しませんでした（確率的要因の可能性）')
    }

    // テストの成功条件: エンカウント発生かつバトル遷移成功
    expect(encounterFound, 'モンスターエンカウントが発生しませんでした').toBeTruthy()
    if (encounterFound) {
      expect(battleSuccess, 'バトル画面遷移に失敗しました').toBeTruthy()
    }
  })
})