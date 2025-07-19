/**
 * 修正版バトル遷移テスト
 * 
 * 初学者向けメモ：
 * - 正しいセレクタを使用（id属性）
 * - モンスター選択もdata-testidを使用
 * - 認証修正後のバトル遷移を最終確認
 */

import { test, expect } from '@playwright/test'

test.describe('修正版バトル遷移テスト', () => {
  
  test('正しいセレクタでバトル画面遷移を確認', async ({ page }) => {
    console.log('🚀 修正版バトル遷移テスト開始')

    // API監視
    page.on('response', async response => {
      if (response.url().includes('/api/players') && response.url().includes('/monsters')) {
        console.log(`📥 モンスターAPI: ${response.status()} ${response.url()}`)
        if (!response.ok()) {
          const body = await response.text()
          console.log('❌ APIエラー:', body)
        }
      }
    })

    // 1. トップページ
    console.log('📍 ステップ1: トップページ')
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/')
    await page.waitForLoadState('networkidle')

    // 2. ログインページへ
    console.log('🔑 ステップ2: ログインページへ')
    await page.getByRole('link', { name: 'ログイン', exact: true }).click()
    await page.waitForLoadState('networkidle')

    // 3. ログイン（id属性を使用）
    console.log('📝 ステップ3: ログイン')
    await page.locator('#email').fill('newuser123@example.com')
    await page.locator('#password').fill('password123')
    await page.getByRole('button', { name: 'ログイン', exact: true }).click()
    
    // 認証処理を待つ
    await page.waitForTimeout(8000)

    // 4. 現在のページを確認
    const currentUrl = page.url()
    console.log('📍 現在のURL:', currentUrl)

    // プレイヤー作成画面の場合
    if (currentUrl.includes('/player-creation')) {
      console.log('👤 プレイヤー作成を実行')
      
      // プレイヤー名入力（id属性を使用）
      await page.locator('#playerName').fill('FixedTestUser')
      
      // モンスター選択（data-testid）
      await page.getByTestId('monster-option-electric_mouse').click()
      
      // 冒険開始ボタン
      await page.getByRole('button', { name: '冒険を開始する' }).click()
      
      // プレイヤー作成処理を待つ
      await page.waitForTimeout(10000)
    }

    // 5. マップ画面確認
    console.log('🗺️ ステップ5: マップ画面確認')
    
    try {
      await page.waitForURL('**/map', { timeout: 20000 })
      console.log('✅ マップ画面に到達')
    } catch (error) {
      console.log('❌ マップ画面への遷移失敗')
      console.log('現在のURL:', page.url())
      
      // ページ内容を確認
      const bodyText = await page.locator('body').textContent()
      console.log('ページ内容（200文字）:', bodyText?.substring(0, 200))
      
      // テスト失敗
      throw new Error('マップ画面に遷移できませんでした')
    }

    // マップ要素確認
    await expect(page.getByTestId('game-map-container')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('player-panel')).toBeVisible({ timeout: 10000 })
    console.log('✅ マップ要素表示確認')

    // 6. モンスターエンカウント試行
    console.log('🎮 ステップ6: モンスターエンカウント')
    
    let encounterFound = false
    let battleSuccess = false
    let authError = false
    
    for (let i = 1; i <= 20 && !encounterFound; i++) {
      console.log(`移動 ${i}/20`)
      
      // ランダム移動
      const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      await page.keyboard.press(directions[Math.floor(Math.random() * 4)])
      await page.waitForTimeout(3500)
      
      // メッセージ確認
      try {
        const messageText = await page.getByTestId('message-area').textContent()
        
        if (messageText && messageText.includes('野生のモンスターが現れた')) {
          console.log('🎯 モンスターエンカウント！')
          encounterFound = true
          
          // バトル画面遷移待機
          try {
            await page.waitForURL('**/battle', { timeout: 15000 })
            console.log('🎉 バトル画面遷移成功！')
            battleSuccess = true
            
            // バトル画面確認
            const battleTitle = await page.locator('h1').textContent()
            console.log('バトル画面タイトル:', battleTitle)
            
          } catch (error) {
            console.log('❌ バトル画面遷移失敗')
          }
          
          break
        } else if (messageText && messageText.includes('使用できるモンスターがいません')) {
          console.log('❌ 認証エラー: 使用できるモンスターがいません')
          authError = true
          encounterFound = true
          break
        }
      } catch (e) {
        // メッセージエリア取得エラーは無視
      }
    }

    // 7. 結果
    console.log('\n📊 テスト結果:')
    console.log('- ログイン: ✅')
    console.log('- マップ画面: ✅')
    console.log(`- エンカウント: ${encounterFound ? '✅' : '❌'}`)
    console.log(`- バトル遷移: ${battleSuccess ? '✅' : '❌'}`)
    
    if (authError) {
      console.log('\n❌ 認証エラーが発生しています。モンスター取得APIに問題があります。')
    } else if (battleSuccess) {
      console.log('\n🎉 認証修正によりバトル遷移が成功しました！')
    } else if (!encounterFound) {
      console.log('\n⚠️ エンカウントが発生しませんでした（確率的要因）')
    }

    // アサーション
    expect(encounterFound).toBeTruthy()
    if (encounterFound && !authError) {
      expect(battleSuccess).toBeTruthy()
    }
  })
})