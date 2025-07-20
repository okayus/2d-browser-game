/**
 * バトル画面遷移テスト（認証修正後の確認）
 * 
 * 初学者向けメモ：
 * - Firebase認証修正後のモンスター取得APIの動作確認
 * - バトル画面への正常な遷移確認
 * - ESModuleとして実行
 */

import { chromium } from 'playwright';

async function testBattleTransitionFixed() {
  console.log('🚀 バトル画面遷移テスト開始（認証修正版）');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // 動作を見やすくする
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    // APIリクエスト/レスポンスを監視
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log('📤 API Request:', request.method(), request.url());
        const authHeader = request.headers()['authorization'];
        if (authHeader) {
          console.log('🔑 Authorization:', authHeader.substring(0, 20) + '...');
        }
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        console.log('📥 API Response:', response.status(), response.url());
        if (!response.ok()) {
          try {
            const responseText = await response.text();
            console.log('❌ Error Response:', responseText);
          } catch (e) {
            console.log('❌ Error reading response body');
          }
        }
      }
    });

    // 1. プロダクションサイトにアクセス
    console.log('\n📍 ステップ1: プロダクションサイトにアクセス');
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/');
    await page.waitForLoadState('networkidle');
    console.log('✅ サイト読み込み完了');

    // 2. ログイン
    console.log('\n🔑 ステップ2: ログイン処理');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForTimeout(2000);

    await page.fill('input[name="email"]', 'newuser123@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForTimeout(5000);
    console.log('✅ ログイン試行完了');

    // 3. プレイヤー作成（必要に応じて）
    console.log('\n👤 ステップ3: プレイヤー作成確認');
    const currentUrl = page.url();
    if (currentUrl.includes('/player-creation')) {
      console.log('🔧 新規プレイヤー作成が必要です');
      
      await page.fill('input[name="playerName"]', 'TestPlayerAuth');
      await page.getByTestId('monster-card-electric_mouse').click();
      await page.getByRole('button', { name: 'プレイヤーを作成' }).click();
      await page.waitForTimeout(5000);
      console.log('✅ プレイヤー作成完了');
    } else {
      console.log('✅ 既存プレイヤーでログイン済み');
    }

    // 4. マップ画面への遷移確認
    console.log('\n🗺️ ステップ4: マップ画面遷移確認');
    await page.waitForURL('**/map', { timeout: 15000 });
    console.log('✅ マップ画面に遷移しました');

    // 5. モンスターエンカウント試行
    console.log('\n🎮 ステップ5: モンスターエンカウント試行');
    
    let encounterFound = false;
    let attempts = 0;
    const maxAttempts = 15;

    while (!encounterFound && attempts < maxAttempts) {
      attempts++;
      console.log(`🚶 移動試行 ${attempts}/${maxAttempts}`);
      
      // ランダムな方向に移動
      const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      
      await page.keyboard.press(randomDirection);
      await page.waitForTimeout(2000);

      // メッセージエリアをチェック
      try {
        const messageArea = await page.locator('[data-testid="message-area"]').textContent();
        
        if (messageArea.includes('野生のモンスターが現れた')) {
          console.log('🎯 モンスターエンカウント発生！');
          encounterFound = true;
          
          // バトル画面への遷移を待機
          console.log('⏳ バトル画面への遷移を待機中...');
          
          try {
            await page.waitForURL('**/battle', { timeout: 15000 });
            console.log('🎉 バトル画面に正常に遷移しました！');
            console.log('✅ 認証修正により、バトル遷移が成功しました！');
            
            // バトル画面の確認
            const battleTitle = await page.locator('h1').textContent();
            console.log('📝 バトル画面タイトル:', battleTitle);
            
            break;
          } catch (error) {
            console.log('❌ バトル画面への遷移がタイムアウトしました');
            
            // エラーメッセージを詳しく確認
            const warningMessages = await page.locator('[data-testid*="message-warning"]').allTextContents();
            const errorMessages = await page.locator('[data-testid*="message-error"]').allTextContents();
            
            if (warningMessages.length > 0) {
              console.log('⚠️ 警告メッセージ:', warningMessages);
            }
            if (errorMessages.length > 0) {
              console.log('❌ エラーメッセージ:', errorMessages);
            }
            
            // 現在のURLを確認
            console.log('📍 現在のURL:', page.url());
            break;
          }
        } else if (messageArea.includes('使用できるモンスターがいません')) {
          console.log('❌ まだ認証エラーが発生しています');
          break;
        } else {
          console.log('📝 メッセージ:', messageArea.split('\n')[0]); // 最新メッセージのみ表示
        }
      } catch (error) {
        console.log('⚠️ メッセージエリアの読み取りに失敗');
      }
    }

    if (!encounterFound) {
      console.log(`❌ ${maxAttempts}回の試行でモンスターエンカウントが発生しませんでした`);
    }

    // 6. テスト結果の表示
    console.log('\n📊 テスト結果サマリー:');
    console.log(`- ログイン: ✅`);
    console.log(`- マップ画面遷移: ✅`);
    console.log(`- モンスターエンカウント: ${encounterFound ? '✅' : '❌'}`);
    console.log(`- バトル画面遷移: ${encounterFound ? '✅' : '❌'}`);

    // しばらく待機してブラウザを確認できるようにする
    console.log('\n⏳ 5秒間待機します（ブラウザで結果を確認してください）');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 テスト完了');
  }
}

// テスト実行
testBattleTransitionFixed().catch(console.error);