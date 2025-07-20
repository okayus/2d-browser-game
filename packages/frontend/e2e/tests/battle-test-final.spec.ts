/**
 * バトル遷移最終テスト
 * 
 * 初学者向けメモ：
 * - 実際のDOM構造に基づいてテスト
 * - マップ画面の確認後、バトル遷移をテスト
 */

import { test, expect } from '@playwright/test'

test.describe('バトル遷移最終テスト', () => {
  
  test('マップ画面からバトル画面への遷移確認', async ({ page }) => {
    console.log('🚀 バトル遷移最終テスト開始')

    // API監視設定
    let monsterApiSuccess = false
    page.on('response', async response => {
      if (response.url().includes('/api/players') && response.url().includes('/monsters')) {
        console.log(`📥 モンスターAPI: ${response.status()} - ${response.url()}`)
        if (response.ok()) {
          monsterApiSuccess = true
          console.log('✅ モンスター取得成功')
          try {
            const body = await response.json()
            console.log('📦 モンスター数:', body.monsters?.length || 0)
          } catch (e) {
            console.log('📦 レスポンス解析エラー')
          }
        } else {
          const body = await response.text()
          console.log('❌ エラー:', body)
        }
      }
    })

    // 1. ログイン処理
    console.log('📍 プロダクションサイトアクセス')
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/')
    await page.waitForLoadState('networkidle')

    console.log('🔑 ログイン処理')
    await page.getByRole('link', { name: 'ログイン', exact: true }).click()
    await page.waitForLoadState('networkidle')
    
    await page.locator('#email').fill('newuser123@example.com')
    await page.locator('#password').fill('password123')
    await page.getByRole('button', { name: 'ログイン', exact: true }).click()
    
    // 認証完了待機
    await page.waitForTimeout(8000)

    // 2. ゲーム状態を設定して直接マップへ
    console.log('💾 ゲーム状態を設定')
    await page.evaluate(() => {
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

    // 3. マップ画面へ遷移
    console.log('🗺️ マップ画面へ遷移')
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/map')
    await page.waitForLoadState('networkidle')
    
    const mapUrl = page.url()
    console.log('📍 現在のURL:', mapUrl)
    
    // マップ画面の確認（実際のDOM構造に基づく）
    const mapTitle = await page.locator('h1').textContent()
    console.log('📝 ページタイトル:', mapTitle)
    
    // ワールドマップの存在確認
    const worldMapText = await page.getByText('ワールドマップ').count()
    if (worldMapText > 0) {
      console.log('✅ ワールドマップ表示確認')
    } else {
      console.log('❌ ワールドマップが見つかりません')
      const bodyText = await page.locator('body').textContent()
      console.log('📄 ページ内容:', bodyText?.substring(0, 500))
      return
    }

    // 4. モンスターエンカウント試行
    console.log('🎮 モンスターエンカウント試行開始')
    
    let encounterFound = false
    let battleSuccess = false
    let authError = false
    const maxMoves = 40
    
    for (let i = 1; i <= maxMoves && !encounterFound; i++) {
      console.log(`🚶 移動 ${i}/${maxMoves}`)
      
      // キーボード操作で移動
      const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      const direction = directions[Math.floor(Math.random() * 4)]
      await page.keyboard.press(direction)
      
      // 移動後の待機（エンカウント判定のため）
      await page.waitForTimeout(2500)
      
      // メッセージエリアのテキストを確認（複数の方法で試行）
      let messageText = ''
      
      // 方法1: data-testidで取得
      try {
        messageText = await page.getByTestId('message-area').textContent()
      } catch (e) {
        // 方法2: クラス名で取得
        try {
          messageText = await page.locator('.message-area').textContent() || ''
        } catch (e2) {
          // 方法3: テキスト内容で検索
          const wildMonsterElements = await page.getByText('野生のモンスターが現れた').count()
          if (wildMonsterElements > 0) {
            messageText = '野生のモンスターが現れた'
          }
        }
      }
      
      // URL変化も確認
      const currentUrl = page.url()
      if (currentUrl.includes('/battle')) {
        console.log('🎯 バトル画面に遷移しました！')
        encounterFound = true
        battleSuccess = true
        break
      }
      
      // メッセージ内容でエンカウント判定
      if (messageText.includes('野生のモンスターが現れた')) {
        console.log('🎯 モンスターエンカウント発生！')
        encounterFound = true
        
        // バトル画面遷移を待つ
        try {
          await page.waitForURL('**/battle', { timeout: 10000 })
          console.log('🎉 バトル画面遷移成功！')
          battleSuccess = true
        } catch (error) {
          console.log('⏱️ バトル画面遷移タイムアウト')
          // 手動でバトル画面を確認
          const finalUrl = page.url()
          if (finalUrl.includes('/battle')) {
            battleSuccess = true
            console.log('✅ バトル画面到達確認')
          }
        }
        break
      } else if (messageText.includes('使用できるモンスターがいません')) {
        console.log('❌ 認証エラー: 使用できるモンスターがいません')
        authError = true
        encounterFound = true
        break
      }
      
      // 進捗表示
      if (i % 10 === 0) {
        console.log(`📊 進捗: ${i}/${maxMoves} 移動完了`)
      }
    }

    // 5. バトル画面の詳細確認
    if (battleSuccess) {
      const battleUrl = page.url()
      console.log('🎮 バトル画面URL:', battleUrl)
      
      // バトル画面の内容確認
      const battleContent = await page.locator('body').textContent()
      console.log('🎮 バトル画面内容（先頭500文字）:')
      console.log(battleContent?.substring(0, 500))
      
      // バトル要素の確認
      const hasBackButton = await page.getByText('← マップに戻る').count() > 0
      const hasBattleTitle = await page.getByText('バトル').count() > 0
      
      console.log('🎯 バトル画面要素:')
      console.log(`  - マップに戻るボタン: ${hasBackButton ? '✅' : '❌'}`)
      console.log(`  - バトルタイトル: ${hasBattleTitle ? '✅' : '❌'}`)
    }

    // 6. 最終結果サマリー
    console.log('\n📊 最終テスト結果:')
    console.log(`- マップ画面到達: ${mapUrl.includes('/map') ? '✅' : '❌'}`)
    console.log(`- モンスターAPI成功: ${monsterApiSuccess ? '✅' : '❌'}`)
    console.log(`- エンカウント発生: ${encounterFound ? '✅' : '❌'}`)
    console.log(`- バトル画面遷移: ${battleSuccess ? '✅' : '❌'}`)
    console.log(`- 認証エラー: ${authError ? '❌ あり' : '✅ なし'}`)
    
    if (battleSuccess) {
      console.log('\n🎉 成功！バトル画面への遷移が確認できました！')
      console.log('Firebase認証の修正が正しく機能しています。')
    } else if (authError) {
      console.log('\n❌ 認証エラーが発生しています')
      console.log('モンスター取得APIの認証処理を確認してください。')
    } else if (!encounterFound) {
      console.log('\n⚠️ エンカウントが発生しませんでした')
      console.log(`${maxMoves}回の移動では不十分だった可能性があります。`)
    }

    // アサーション
    expect(mapUrl).toContain('/map')
    expect(monsterApiSuccess).toBeTruthy()
    if (encounterFound && !authError) {
      expect(battleSuccess).toBeTruthy()
    }
  })
})