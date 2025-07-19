/**
 * 本番環境でのバトル遷移テスト（認証修正後）
 * 
 * 初学者向けメモ：
 * - 認証修正後のプロダクション環境でのバトル遷移確認
 * - Firebase認証とモンスター取得APIの動作確認
 * - 実際のユーザーフローに沿ったテスト
 */

import { test, expect } from '@playwright/test'

test.describe('プロダクション環境 - バトル遷移テスト', () => {
  
  test('認証修正後のバトル画面遷移確認', async ({ page }) => {
    // APIリクエストとレスポンスを監視
    const apiRequests: string[] = []
    const apiErrors: string[] = []
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(`${request.method()} ${request.url()}`)
        console.log('📤 API Request:', request.method(), request.url())
        
        const authHeader = request.headers()['authorization']
        if (authHeader) {
          console.log('🔑 Authorization header present:', authHeader.substring(0, 20) + '...')
        }
      }
    })

    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        console.log('📥 API Response:', response.status(), response.url())
        
        if (!response.ok()) {
          try {
            const errorBody = await response.text()
            apiErrors.push(`${response.status()} ${response.url()}: ${errorBody}`)
            console.log('❌ API Error:', response.status(), errorBody)
          } catch (e) {
            console.log('❌ Failed to read error response body')
          }
        }
      }
    })

    // 1. プロダクションサイトにアクセス
    console.log('📍 ステップ1: プロダクションサイトアクセス')
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/')
    await page.waitForLoadState('networkidle')
    
    // 2. ログイン処理
    console.log('🔑 ステップ2: ログイン')
    
    // ページの状態を確認
    await page.waitForTimeout(3000)
    const pageTitle = await page.title()
    console.log('ページタイトル:', pageTitle)
    
    // 複数のパターンでログインボタンを探す
    let loginButton = page.getByRole('button', { name: 'ログイン' })
    
    if (!(await loginButton.isVisible())) {
      loginButton = page.locator('button:has-text("ログイン")')
    }
    
    if (!(await loginButton.isVisible())) {
      loginButton = page.locator('[data-testid*="login"], button[type="submit"]').first()
    }
    
    // 現在のページの状態をログ出力
    const currentUrl = page.url()
    console.log('現在のURL:', currentUrl)
    
    // 既にログイン済みの場合は直接マップへ
    if (currentUrl.includes('/map')) {
      console.log('✅ 既にログイン済み、マップ画面にいます')
    } else if (currentUrl.includes('/player-creation')) {
      console.log('✅ ログイン済み、プレイヤー作成画面です')
      // プレイヤー作成に進む
    } else {
      // ログインが必要
      await loginButton.click()
      await page.waitForTimeout(2000)

      await page.fill('input[name="email"]', 'newuser123@example.com')
      await page.fill('input[name="password"]', 'password123')
      
      await page.getByRole('button', { name: 'ログイン' }).click()
      await page.waitForTimeout(5000)
    }

    // 3. プレイヤー作成（必要に応じて）
    console.log('👤 ステップ3: プレイヤー作成確認')
    const updatedUrl = page.url()
    if (updatedUrl.includes('/player-creation')) {
      console.log('🔧 プレイヤー作成が必要')
      
      await page.fill('input[name="playerName"]', 'TestBattleUser')
      await page.getByTestId('monster-card-electric_mouse').click()
      await page.getByRole('button', { name: 'プレイヤーを作成' }).click()
      await page.waitForTimeout(5000)
      
      console.log('✅ プレイヤー作成完了')
    }

    // 4. マップ画面遷移確認
    console.log('🗺️ ステップ4: マップ画面遷移')
    await page.waitForURL('**/map', { timeout: 15000 })
    
    // マップの要素が表示されることを確認
    await expect(page.getByTestId('game-map-container')).toBeVisible()
    await expect(page.getByTestId('player-panel')).toBeVisible()
    
    console.log('✅ マップ画面表示確認完了')

    // 5. モンスターエンカウント試行
    console.log('🎮 ステップ5: モンスターエンカウント試行開始')
    
    let encounterSuccess = false
    let battleTransitionSuccess = false
    const maxAttempts = 20
    
    for (let attempt = 1; attempt <= maxAttempts && !encounterSuccess; attempt++) {
      console.log(`🚶 移動試行 ${attempt}/${maxAttempts}`)
      
      // ランダムな方向に移動
      const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      const direction = directions[Math.floor(Math.random() * directions.length)]
      
      await page.keyboard.press(direction)
      await page.waitForTimeout(2000)

      // メッセージエリアの確認
      try {
        const messageArea = await page.getByTestId('message-area').textContent()
        
        if (messageArea && messageArea.includes('野生のモンスターが現れた')) {
          console.log('🎯 モンスターエンカウント発生！')
          encounterSuccess = true
          
          // バトル画面への遷移を待機
          console.log('⏳ バトル画面遷移を待機中...')
          
          try {
            await page.waitForURL('**/battle', { timeout: 15000 })
            console.log('🎉 バトル画面遷移成功！')
            battleTransitionSuccess = true
            
            // バトル画面の要素を確認
            await expect(page.locator('h1')).toContainText(['バトル', 'Battle'])
            console.log('✅ バトル画面要素確認完了')
            
            break
          } catch (error) {
            console.log('❌ バトル画面遷移タイムアウト')
            
            // エラーメッセージを確認
            const errorMessages = await page.getByTestId('message-error').allTextContents()
            const warningMessages = await page.getByTestId('message-warning').allTextContents()
            
            if (errorMessages.length > 0) {
              console.log('❌ エラーメッセージ:', errorMessages)
            }
            if (warningMessages.length > 0) {
              console.log('⚠️ 警告メッセージ:', warningMessages)
            }
          }
        } else if (messageArea && messageArea.includes('使用できるモンスターがいません')) {
          console.log('❌ 認証エラーが発生（モンスター取得失敗）')
          
          // この場合はテストを失敗とする
          expect(false, '認証エラー: 使用できるモンスターがいません').toBeTruthy()
          break
        }
      } catch (error) {
        // メッセージエリアの読み取りに失敗した場合は続行
        console.log('⚠️ メッセージエリア読み取り失敗、続行')
      }
    }

    // 6. テスト結果の検証
    console.log('\n📊 テスト結果:')
    console.log(`- プロダクションサイトアクセス: ✅`)
    console.log(`- ログイン: ✅`)
    console.log(`- マップ画面遷移: ✅`)
    console.log(`- モンスターエンカウント: ${encounterSuccess ? '✅' : '❌'}`)
    console.log(`- バトル画面遷移: ${battleTransitionSuccess ? '✅' : '❌'}`)
    
    console.log(`\n📈 API統計:`)
    console.log(`- APIリクエスト数: ${apiRequests.length}`)
    console.log(`- APIエラー数: ${apiErrors.length}`)
    
    if (apiErrors.length > 0) {
      console.log('❌ APIエラー詳細:', apiErrors)
    }

    // 最終的な成功判定
    if (encounterSuccess && battleTransitionSuccess) {
      console.log('🎉 認証修正により、バトル遷移が正常に動作しています！')
    } else if (encounterSuccess && !battleTransitionSuccess) {
      console.log('⚠️ モンスターエンカウントは発生しましたが、バトル遷移に失敗')
    } else {
      console.log('⚠️ モンスターエンカウントが発生しませんでした（確率的要因の可能性）')
    }

    // アサーション: 少なくともモンスターエンカウントは成功することを期待
    // （バトル遷移は認証修正により成功するはず）
    expect(encounterSuccess, 'モンスターエンカウントが発生しませんでした').toBeTruthy()
    
    if (encounterSuccess) {
      expect(battleTransitionSuccess, 'バトル画面への遷移に失敗しました').toBeTruthy()
    }
  })
})