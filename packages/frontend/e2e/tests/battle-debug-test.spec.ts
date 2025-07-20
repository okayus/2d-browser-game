/**
 * バトル遷移デバッグテスト
 * 
 * 初学者向けメモ：
 * - JavaScript エラーとコンソールログを詳細に監視
 * - エンカウント処理の各ステップを追跡
 * - LocalStorage/SessionStorage の状態を確認
 */

import { test, expect } from '@playwright/test'

test.describe('バトル遷移デバッグテスト', () => {
  
  test('エンカウント処理の詳細デバッグ', async ({ page }) => {
    console.log('🔍 バトル遷移デバッグテスト開始')

    // JavaScript エラーを監視
    const jsErrors: string[] = []
    page.on('pageerror', error => {
      console.log('❌ JavaScript Error:', error.message)
      jsErrors.push(error.message)
    })

    // コンソールログを監視
    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', text)
      } else if (text.includes('モンスター') || text.includes('バトル') || text.includes('エンカウント')) {
        console.log('📝 関連ログ:', text)
      }
    })

    // API監視
    let monsterApiCalled = false
    page.on('response', async response => {
      if (response.url().includes('/api/players') && response.url().includes('/monsters')) {
        monsterApiCalled = true
        console.log(`📥 モンスターAPI: ${response.status()}`)
        if (response.ok()) {
          const body = await response.text()
          console.log('📦 モンスターデータ:', body.substring(0, 200))
        }
      }
    })

    // 1. 初期設定とログイン
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'ログイン', exact: true }).click()
    await page.waitForLoadState('networkidle')
    
    await page.locator('#email').fill('newuser123@example.com')
    await page.locator('#password').fill('password123')
    await page.getByRole('button', { name: 'ログイン', exact: true }).click()
    await page.waitForTimeout(8000)

    // 2. ゲーム状態設定
    console.log('💾 ゲーム状態とLocalStorageを設定')
    await page.evaluate(() => {
      localStorage.setItem('player_name', 'DebugUser')
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
      localStorage.setItem('player_id', 'debug-player-id')
    })

    // 3. マップ画面へ遷移
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/map')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    console.log('🗺️ マップ画面に到達、初期状態を確認')
    
    // LocalStorage の確認
    const localStorageState = await page.evaluate(() => {
      return {
        player_name: localStorage.getItem('player_name'),
        selected_monster: localStorage.getItem('selected_monster'),
        player_id: localStorage.getItem('player_id'),
        game_state: localStorage.getItem('game_state')
      }
    })
    console.log('💾 LocalStorage状態:', localStorageState)

    // 4. エンカウント前の状態確認
    console.log('🎮 エンカウント試行開始')
    
    let encounterAttempts = 0
    let encounterFound = false
    const maxAttempts = 20

    for (let i = 1; i <= maxAttempts && !encounterFound; i++) {
      encounterAttempts = i
      console.log(`🚶 移動 ${i}/${maxAttempts}`)
      
      // 移動前の URL とセッションストレージ確認
      const beforeMove = {
        url: page.url(),
        sessionStorage: await page.evaluate(() => {
          return {
            battle_init: sessionStorage.getItem('battle_init')
          }
        })
      }
      
      // キーボード移動
      const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      await page.keyboard.press(directions[Math.floor(Math.random() * 4)])
      await page.waitForTimeout(3000)
      
      // 移動後の状態確認
      const afterMove = {
        url: page.url(),
        sessionStorage: await page.evaluate(() => {
          return {
            battle_init: sessionStorage.getItem('battle_init')
          }
        })
      }

      // メッセージエリアのチェック
      let messageText = ''
      try {
        messageText = await page.getByTestId('message-area').textContent() || ''
      } catch (e) {
        // メッセージエリアが見つからない場合は他の方法で確認
        const wildMonsterText = await page.getByText('野生のモンスターが現れた').count()
        if (wildMonsterText > 0) {
          messageText = '野生のモンスターが現れた'
        }
      }

      console.log(`📋 移動${i}結果:`)
      console.log(`  - メッセージ: "${messageText}"`)
      console.log(`  - URL変化: ${beforeMove.url} → ${afterMove.url}`)
      console.log(`  - Battle Init: ${afterMove.sessionStorage.battle_init ? '設定済み' : '未設定'}`)

      // エンカウント検出
      if (messageText.includes('野生のモンスターが現れた')) {
        console.log('🎯 モンスターエンカウント発生！')
        encounterFound = true
        
        // エンカウント後の詳細確認
        await page.waitForTimeout(2000)
        
        const postEncounter = {
          url: page.url(),
          sessionStorage: await page.evaluate(() => {
            return {
              battle_init: sessionStorage.getItem('battle_init')
            }
          }),
          localStorage: await page.evaluate(() => {
            return {
              player_id: localStorage.getItem('player_id')
            }
          })
        }
        
        console.log('📊 エンカウント後の状態:')
        console.log(`  - 最終URL: ${postEncounter.url}`)
        console.log(`  - Battle Init Data: ${postEncounter.sessionStorage.battle_init ? '✅ 設定済み' : '❌ 未設定'}`)
        console.log(`  - Player ID: ${postEncounter.localStorage.player_id}`)
        
        if (postEncounter.sessionStorage.battle_init) {
          const battleData = JSON.parse(postEncounter.sessionStorage.battle_init)
          console.log('🎮 バトル初期化データ:', Object.keys(battleData))
        }
        
        // バトル画面遷移の確認
        const isBattleScreen = postEncounter.url.includes('/battle')
        console.log(`🎯 バトル画面遷移: ${isBattleScreen ? '✅ 成功' : '❌ 失敗'}`)
        
        if (!isBattleScreen) {
          console.log('⚠️ バトル画面に遷移していません')
          
          // さらに待機して再確認
          await page.waitForTimeout(5000)
          const finalUrl = page.url()
          console.log(`🔄 追加待機後URL: ${finalUrl}`)
          
          if (!finalUrl.includes('/battle')) {
            console.log('❌ 遷移失敗確定')
          }
        }
        
        break
      }
      
      // URL が変化した場合（意図しない遷移）
      if (afterMove.url !== beforeMove.url) {
        console.log(`⚠️ 予期しないURL変化: ${afterMove.url}`)
      }
    }

    // 5. 最終結果とデバッグ情報
    console.log('\n📊 デバッグ結果サマリー:')
    console.log(`- エンカウント試行回数: ${encounterAttempts}/${maxAttempts}`)
    console.log(`- エンカウント発生: ${encounterFound ? '✅' : '❌'}`)
    console.log(`- モンスターAPI呼び出し: ${monsterApiCalled ? '✅' : '❌'}`)
    console.log(`- JavaScript エラー数: ${jsErrors.length}`)
    
    if (jsErrors.length > 0) {
      console.log('🚨 JavaScript エラー一覧:')
      jsErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`)
      })
    }
    
    const finalUrl = page.url()
    const isBattleSuccess = finalUrl.includes('/battle')
    
    console.log(`- 最終URL: ${finalUrl}`)
    console.log(`- バトル画面到達: ${isBattleSuccess ? '✅' : '❌'}`)
    
    if (!isBattleSuccess && encounterFound) {
      console.log('\n🔍 失敗原因の推定:')
      if (jsErrors.length > 0) {
        console.log('- JavaScript エラーによる処理中断')
      }
      if (!monsterApiCalled) {
        console.log('- モンスターAPI が呼び出されていない')
      }
      console.log('- navigate(\'/battle\') の実行失敗')
      console.log('- convertToBattlePlayerMonster() の失敗')
      console.log('- セッションストレージへの保存失敗')
    }
    
    // アサーション
    expect(encounterFound).toBeTruthy()
    if (encounterFound) {
      expect(jsErrors.length).toBe(0) // JavaScript エラーがないことを確認
    }
  })
})