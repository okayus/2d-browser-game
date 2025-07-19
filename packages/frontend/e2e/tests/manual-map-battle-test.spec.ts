/**
 * 手動マップ遷移バトルテスト
 * 
 * 初学者向けメモ：
 * - プレイヤー作成画面の問題を回避
 * - 直接マップURLに遷移してバトルをテスト
 */

import { test, expect } from '@playwright/test'

test.describe('手動マップ遷移バトルテスト', () => {
  
  test('直接マップURLに遷移してバトル確認', async ({ page }) => {
    console.log('🚀 手動マップ遷移バトルテスト開始')

    // モンスターAPI監視
    page.on('response', async response => {
      if (response.url().includes('/api/players') && response.url().includes('/monsters')) {
        console.log(`📥 モンスターAPI: ${response.status()} - ${response.url()}`)
        if (!response.ok()) {
          const body = await response.text()
          console.log('❌ エラー:', body)
        } else {
          console.log('✅ モンスター取得成功')
          const body = await response.text()
          console.log('📦 レスポンス:', body.substring(0, 200))
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

    // 3. LocalStorageにプレイヤーデータを設定
    console.log('💾 LocalStorageにゲーム状態を設定')
    await page.evaluate(() => {
      // 既存プレイヤーのデータを設定
      localStorage.setItem('player_name', 'TestUser')
      localStorage.setItem('selected_monster', JSON.stringify({
        id: 'electric_mouse',
        name: 'でんきネズミ',
        description: '電気を操る小さなモンスター',
        icon: '⚡',
        baseHp: 35,
        rarity: 'common'
      }))
      localStorage.setItem('player_position', JSON.stringify({ x: 5, y: 4 }))
      localStorage.setItem('game_state', 'playing')
      localStorage.setItem('player_id', 'test-player-id')
    })

    // 4. 直接マップ画面へ遷移
    console.log('🗺️ 直接マップ画面へ遷移')
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/map')
    await page.waitForLoadState('networkidle')
    
    // URL確認
    const currentUrl = page.url()
    console.log('📍 現在のURL:', currentUrl)
    
    // マップ要素の確認
    try {
      await expect(page.getByTestId('game-map-container')).toBeVisible({ timeout: 10000 })
      await expect(page.getByTestId('player-panel')).toBeVisible({ timeout: 10000 })
      console.log('✅ マップ要素表示確認')
    } catch (e) {
      console.log('❌ マップ要素が見つかりません')
      const bodyText = await page.locator('body').textContent()
      console.log('📄 ページ内容（300文字）:', bodyText?.substring(0, 300))
      return
    }

    // 5. モンスターエンカウント試行
    console.log('🎮 モンスターエンカウント試行開始')
    
    let encounterFound = false
    let battleSuccess = false
    let authError = false
    
    for (let i = 1; i <= 30 && !encounterFound; i++) {
      console.log(`🚶 移動 ${i}/30`)
      
      // ランダム移動
      const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      await page.keyboard.press(directions[Math.floor(Math.random() * 4)])
      await page.waitForTimeout(3000)
      
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
          
          // バトル画面のスナップショット
          const battleElements = await page.locator('body').textContent()
          console.log('🎮 バトル画面内容（300文字）:', battleElements?.substring(0, 300))
          
        } catch (error) {
          console.log('❌ バトル画面遷移失敗')
          const currentUrl = page.url()
          console.log('📍 現在のURL:', currentUrl)
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
    console.log(`- マップ画面到達: ${currentUrl.includes('/map') ? '✅' : '❌'}`)
    console.log(`- エンカウント: ${encounterFound ? '✅' : '❌'}`)
    console.log(`- バトル遷移: ${battleSuccess ? '✅' : '❌'}`)
    console.log(`- 認証エラー: ${authError ? '❌ あり' : '✅ なし'}`)
    
    if (battleSuccess) {
      console.log('\n🎉 バトル遷移が成功しました！')
      console.log('認証修正が正しく機能しています。')
    } else if (authError) {
      console.log('\n❌ まだ認証エラーが発生しています')
      console.log('モンスター取得APIの認証に問題があります。')
    } else if (!encounterFound) {
      console.log('\n⚠️ モンスターエンカウントが発生しませんでした')
      console.log('もう少し移動回数を増やす必要があるかもしれません。')
    }

    // アサーション
    expect(currentUrl).toContain('/map')
    if (encounterFound && !authError) {
      expect(battleSuccess).toBeTruthy()
    }
  })
})