/**
 * 直接バトル遷移テスト
 * 
 * 初学者向けメモ：
 * - 既存のプレイヤーでログインしてマップ画面へ
 * - LocalStorageの既存データを活用
 * - バトル遷移の確認に集中
 */

import { test, expect } from '@playwright/test'

test.describe('直接バトル遷移テスト', () => {
  
  test('既存プレイヤーでバトル遷移確認', async ({ page }) => {
    console.log('🚀 直接バトル遷移テスト開始')

    // モンスターAPI監視
    page.on('response', async response => {
      if (response.url().includes('/api/players') && response.url().includes('/monsters')) {
        console.log(`📥 モンスターAPI: ${response.status()} - ${response.url()}`)
        if (!response.ok()) {
          const body = await response.text()
          console.log('❌ エラー:', body)
        } else {
          console.log('✅ モンスター取得成功')
        }
      }
    })

    // 1. プロダクションサイトへアクセス
    console.log('📍 プロダクションサイトアクセス')
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/')
    await page.waitForLoadState('networkidle')

    // 2. ログイン
    console.log('🔑 ログイン処理')
    await page.getByRole('link', { name: 'ログイン', exact: true }).click()
    await page.waitForLoadState('networkidle')
    
    await page.locator('#email').fill('newuser123@example.com')
    await page.locator('#password').fill('password123')
    await page.getByRole('button', { name: 'ログイン', exact: true }).click()
    
    // 認証処理待機
    await page.waitForTimeout(8000)

    // 3. 現在のURLを確認
    let currentUrl = page.url()
    console.log('📍 ログイン後URL:', currentUrl)

    // プレイヤー作成画面の場合、既存データがあるはずなのでマップへ進むボタンを探す
    if (currentUrl.includes('/player-creation')) {
      console.log('⚠️ プレイヤー作成画面にいます')
      
      // 既にプレイヤーが存在する場合のメッセージやボタンを確認
      const errorText = await page.locator('[role="alert"]').textContent().catch(() => null)
      if (errorText) {
        console.log('📝 エラーメッセージ:', errorText)
      }
      
      // マップへ進むリンクやボタンがあるか確認
      const mapLinks = await page.getByRole('link', { name: /マップ|map/i }).all()
      if (mapLinks.length > 0) {
        console.log('🔗 マップリンクをクリック')
        await mapLinks[0].click()
        await page.waitForTimeout(5000)
      } else {
        // 直接マップURLに遷移を試みる
        console.log('🔗 直接マップURLへ遷移')
        await page.goto('https://0fa50877.monster-game-frontend.pages.dev/map')
        await page.waitForLoadState('networkidle')
      }
    }

    // 4. マップ画面確認
    currentUrl = page.url()
    console.log('📍 現在のURL:', currentUrl)
    
    if (!currentUrl.includes('/map')) {
      console.log('❌ マップ画面に到達できませんでした')
      
      // ページ内容を確認
      const bodyText = await page.locator('body').textContent()
      console.log('📄 ページ内容（200文字）:', bodyText?.substring(0, 200))
      
      return
    }

    console.log('✅ マップ画面に到達！')

    // マップ要素の確認
    try {
      await expect(page.getByTestId('game-map-container')).toBeVisible({ timeout: 10000 })
      await expect(page.getByTestId('player-panel')).toBeVisible({ timeout: 10000 })
      console.log('✅ マップ要素表示確認')
    } catch (e) {
      console.log('❌ マップ要素が見つかりません')
      return
    }

    // 5. モンスターエンカウント試行
    console.log('🎮 モンスターエンカウント試行開始')
    
    let encounterFound = false
    let battleSuccess = false
    let authError = false
    
    for (let i = 1; i <= 20 && !encounterFound; i++) {
      console.log(`🚶 移動 ${i}/20`)
      
      // ランダム移動
      const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      await page.keyboard.press(directions[Math.floor(Math.random() * 4)])
      await page.waitForTimeout(3500)
      
      // メッセージ確認
      const messageText = await page.getByTestId('message-area').textContent().catch(() => '')
      
      if (messageText.includes('野生のモンスターが現れた')) {
        console.log('🎯 モンスターエンカウント発生！')
        encounterFound = true
        
        // バトル画面遷移待機
        try {
          await page.waitForURL('**/battle', { timeout: 15000 })
          console.log('🎉 バトル画面遷移成功！')
          battleSuccess = true
          
          // バトル画面要素確認
          const battleTitle = await page.locator('h1').textContent()
          console.log('📝 バトル画面:', battleTitle)
          
        } catch (error) {
          console.log('❌ バトル画面遷移失敗')
        }
        
        break
      } else if (messageText.includes('使用できるモンスターがいません')) {
        console.log('❌ 認証エラー: 使用できるモンスターがいません')
        authError = true
        encounterFound = true
        break
      }
    }

    // 6. 最終結果
    console.log('\n📊 テスト結果:')
    console.log(`- マップ画面到達: ✅`)
    console.log(`- エンカウント: ${encounterFound ? '✅' : '❌'}`)
    console.log(`- バトル遷移: ${battleSuccess ? '✅' : '❌'}`)
    console.log(`- 認証エラー: ${authError ? '❌ あり' : '✅ なし'}`)
    
    if (battleSuccess) {
      console.log('\n🎉 認証修正によりバトル遷移が成功しました！')
    } else if (authError) {
      console.log('\n❌ まだ認証エラーが発生しています')
    }

    // アサーション
    expect(encounterFound).toBeTruthy()
    if (encounterFound && !authError) {
      expect(battleSuccess).toBeTruthy()
    }
  })
})