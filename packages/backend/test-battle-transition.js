/**
 * バトル画面遷移テスト（認証修正後）
 * 
 * 初学者向けメモ：
 * - 認証トークンの送信確認
 * - モンスター取得APIの動作確認
 * - バトル画面への遷移確認
 */

const { chromium } = require('playwright');

async function testBattleTransition() {
  console.log('🚀 バトル画面遷移テストを開始します（認証修正後）');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // プロダクションサイトにアクセス
    console.log('📍 プロダクションサイトにアクセス中...');
    await page.goto('https://0fa50877.monster-game-frontend.pages.dev/');
    await page.waitForLoadState('networkidle');

    // ログインボタンをクリック
    console.log('🔑 ログインボタンをクリック中...');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForTimeout(2000);

    // メールアドレスを入力
    console.log('📧 テストユーザーでログイン中...');
    await page.fill('input[name="email"]', 'newuser123@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForTimeout(5000);

    // プレイヤー作成画面に遷移
    console.log('👤 プレイヤー作成画面に遷移中...');
    const currentUrl = page.url();
    if (currentUrl.includes('/player-creation')) {
      console.log('✅ プレイヤー作成画面に正常に遷移しました');
      
      // プレイヤー名を入力
      await page.fill('input[name="playerName"]', 'TestPlayer');
      
      // モンスターを選択
      await page.getByTestId('monster-card-electric_mouse').click();
      
      // プレイヤー作成ボタンをクリック
      await page.getByRole('button', { name: 'プレイヤーを作成' }).click();
      await page.waitForTimeout(3000);
    }

    // マップ画面に遷移
    console.log('🗺️ マップ画面への遷移を確認中...');
    await page.waitForURL('**/map', { timeout: 10000 });
    console.log('✅ マップ画面に正常に遷移しました');

    // プレイヤーの移動とモンスターエンカウントを試行
    console.log('🕹️ プレイヤー移動とモンスターエンカウントを試行中...');
    
    // ネットワーク要求を監視
    page.on('request', request => {
      if (request.url().includes('/api/players/') && request.url().includes('/monsters')) {
        console.log('🔍 モンスター取得APIリクエスト:', request.url());
        console.log('🔍 Authorization ヘッダー:', request.headers()['authorization'] ? '設定済み' : '未設定');
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/players/') && response.url().includes('/monsters')) {
        console.log('📡 モンスター取得APIレスポンス:', response.status(), response.statusText());
      }
    });

    // 矢印キーで移動を試行（最大10回）
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1000);
      
      // メッセージエリアをチェック
      const messages = await page.locator('[data-testid="message-area"]').textContent();
      
      if (messages.includes('野生のモンスターが現れた')) {
        console.log('🎯 モンスターエンカウント発生！');
        
        // バトル画面への遷移を待機
        try {
          await page.waitForURL('**/battle', { timeout: 10000 });
          console.log('✅ バトル画面に正常に遷移しました！');
          console.log('🎉 認証修正により、バトル画面遷移が成功しました！');
          break;
        } catch (error) {
          console.log('❌ バトル画面への遷移がタイムアウトしました');
          
          // エラーメッセージをチェック
          const errorMessages = await page.locator('[data-testid="message-warning"]').allTextContents();
          if (errorMessages.length > 0) {
            console.log('⚠️ 警告メッセージ:', errorMessages);
          }
        }
        break;
      }
      
      if (messages.includes('使用できるモンスターがいません')) {
        console.log('❌ まだ認証エラーが発生しています');
        break;
      }
    }

    console.log('✅ バトル画面遷移テスト完了');

  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error);
  } finally {
    await browser.close();
  }
}

// テスト実行
testBattleTransition().catch(console.error);