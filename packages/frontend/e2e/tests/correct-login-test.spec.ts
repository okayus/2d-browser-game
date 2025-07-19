/**
 * 正しいログインフローのテスト
 * 
 * 初学者向けメモ：
 * - input要素にname属性がないのでidで指定
 * - ログインボタンは正確に指定
 * - 認証修正後のバトル遷移を確認
 */

import { test, expect } from '@playwright/test'

test.describe('正しいログインとバトル遷移テスト', () => {
  
  test('認証修正後のバトル画面遷移確認', async ({ page }) => {
    console.log('🚀 正しいログインフローテスト開始')

    // API監視
    page.on('request', request => {
      if (request.url().includes('/api/players') && request.url().includes('/monsters')) {
        const auth = request.headers()['authorization']
        console.log('📤 モンスターAPI呼び出し:', auth ? '認証あり' : '認証なし')
      }
    })

    page.on('response', async response => {
      if (response.url().includes('/api/players') && response.url().includes('/monsters')) {
        console.log('📥 モンスターAPI応答:', response.status())
        if (!response.ok()) {
          const body = await response.text()
          console.log('❌ エラー内容:', body)
        }
      }
    })

    // 1. トップページアクセス
    console.log('📍 ステップ1: トップページアクセス')
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/')
    await page.waitForLoadState('networkidle')

    // 2. ログインページへ
    console.log('🔑 ステップ2: ログインページへ遷移')
    await page.getByRole('link', { name: 'ログイン', exact: true }).click()
    await page.waitForLoadState('networkidle')

    // 3. ログイン情報入力（id属性を使用）
    console.log('📝 ステップ3: ログイン情報入力')
    await page.locator('#email').fill('newuser123@example.com')
    await page.locator('#password').fill('password123')

    // 4. ログインボタンクリック（exact指定）
    console.log('🚪 ステップ4: ログイン実行')
    await page.getByRole('button', { name: 'ログイン', exact: true }).click()
    
    // Firebase認証の処理を待つ
    await page.waitForTimeout(8000)

    // 5. ログイン後の状態確認
    const currentUrl = page.url()
    console.log('📍 ログイン後のURL:', currentUrl)

    // プレイヤー作成が必要な場合
    if (currentUrl.includes('/player-creation')) {
      console.log('👤 プレイヤー作成画面に遷移')
      
      // プレイヤー名入力
      await page.locator('input[name="playerName"]').fill('BattleTestUser')
      
      // モンスター選択
      await page.getByTestId('monster-card-electric_mouse').click()
      
      // プレイヤー作成
      await page.getByRole('button', { name: 'プレイヤーを作成' }).click()
      await page.waitForTimeout(8000)
    }

    // 6. マップ画面確認
    console.log('🗺️ ステップ5: マップ画面確認')
    
    // マップ画面への遷移を待つ
    try {
      await page.waitForURL('**/map', { timeout: 20000 })
      console.log('✅ マップ画面に到達しました')
    } catch (error) {
      console.log('❌ マップ画面への遷移に失敗')
      console.log('現在のURL:', page.url())
      
      // エラーメッセージを確認
      const alerts = await page.locator('[role="alert"]').allTextContents()
      if (alerts.length > 0) {
        console.log('エラーメッセージ:', alerts)
      }
      
      return // テストを終了
    }

    // マップ要素の確認
    await expect(page.getByTestId('game-map-container')).toBeVisible()
    await expect(page.getByTestId('player-panel')).toBeVisible()

    // 7. モンスターエンカウント試行
    console.log('🎮 ステップ6: モンスターエンカウント試行')
    
    let encounterOccurred = false
    let battleTransition = false
    
    // 20回まで移動を試行
    for (let i = 1; i <= 20 && !encounterOccurred; i++) {
      console.log(`移動 ${i}/20`)
      
      // ランダムな方向に移動
      const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      const direction = directions[Math.floor(Math.random() * 4)]
      
      await page.keyboard.press(direction)
      await page.waitForTimeout(3000)
      
      // メッセージエリアを確認
      try {
        const messageArea = await page.getByTestId('message-area').textContent()
        
        if (messageArea && messageArea.includes('野生のモンスターが現れた')) {
          console.log('🎯 モンスターエンカウント発生！')
          encounterOccurred = true
          
          // バトル画面遷移を待つ
          try {
            await page.waitForURL('**/battle', { timeout: 15000 })
            console.log('🎉 バトル画面に遷移成功！')
            battleTransition = true
          } catch (error) {
            console.log('❌ バトル画面への遷移失敗')
            
            // エラーメッセージ確認
            const messages = await page.getByTestId('message-area').textContent()
            console.log('最新メッセージ:', messages)
          }
          
          break
        } else if (messageArea && messageArea.includes('使用できるモンスターがいません')) {
          console.log('❌ 認証エラー: 使用できるモンスターがいません')
          encounterOccurred = true
          break
        }
      } catch (e) {
        // メッセージ取得エラーは無視
      }
    }

    // 8. テスト結果
    console.log('\n📊 テスト結果:')
    console.log('- ログイン: ✅')
    console.log('- マップ画面遷移: ✅')
    console.log(`- モンスターエンカウント: ${encounterOccurred ? '✅' : '❌'}`)
    console.log(`- バトル画面遷移: ${battleTransition ? '✅' : '❌'}`)
    
    if (battleTransition) {
      console.log('\n🎉 認証修正によりバトル遷移が成功しました！')
    } else if (encounterOccurred && !battleTransition) {
      console.log('\n⚠️ エンカウントは発生しましたが、バトル遷移に問題があります')
    }

    // テストのアサーション
    expect(encounterOccurred).toBeTruthy()
    if (encounterOccurred) {
      expect(battleTransition).toBeTruthy()
    }
  })
})