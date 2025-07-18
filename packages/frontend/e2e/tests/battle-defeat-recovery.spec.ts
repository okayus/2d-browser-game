/**
 * バトル敗北時のHP回復処理テスト
 * モンスターエンカウントから敗北、HP回復までの一連のフローをテスト
 */

import { test, expect } from '@playwright/test';

test.describe('バトル敗北時のHP回復処理', () => {
  test.beforeEach(async ({ page }) => {
    // コンソールログを監視
    const logs: string[] = [];
    page.on('console', (msg) => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // ネットワークリクエストを監視
    const requests: Array<{url: string, method: string, postData?: string}> = [];
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData() || undefined
      });
    });

    // テスト用データを page に設定
    (page as any).logs = logs;
    (page as any).requests = requests;

    // テストページに移動
    await page.goto('/');
  });

  test('マップ画面からモンスターエンカウント → バトル敗北 → HP回復処理 → マップ画面自動遷移', async ({ page }) => {
    // Step 1: ログインからプレイヤー作成までの流れ
    console.log('Step 1: ログインとプレイヤー作成');
    
    // スタート画面でログインボタンをクリック
    await expect(page.locator('text=ログイン')).toBeVisible({ timeout: 10000 });
    await page.click('text=ログイン');
    
    // ログイン画面でテストユーザーログインボタンをクリック
    await expect(page.locator('text=ログイン').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("テストユーザーでログイン")')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("テストユーザーでログイン")');
    
    // ログイン処理完了を待機（プレイヤー作成画面または既存ゲーム画面）
    try {
      // 新規ユーザーの場合：プレイヤー作成画面に遷移
      await expect(page.locator('text=プレイヤー作成')).toBeVisible({ timeout: 10000 });
      
      // プレイヤー作成フォームに入力
      await page.fill('input[placeholder="プレイヤー名を入力"]', 'テストプレイヤー');
      
      // 作成ボタンをクリック
      await page.click('button:has-text("作成")');
      
    } catch (error) {
      // 既存ユーザーの場合：直接マップ画面またはゲーム継続画面
      console.log('既存ユーザーを検出、ゲーム継続処理');
      
      // ゲーム継続ボタンがある場合はクリック
      const continueButton = page.locator('button:has-text("ゲームを続ける")');
      if (await continueButton.isVisible({ timeout: 3000 })) {
        await continueButton.click();
      }
    }
    
    // マップ画面の読み込み完了を待機
    await expect(page.locator('text=冒険マップ')).toBeVisible({ timeout: 15000 });
    
    console.log('Step 1 完了: マップ画面に到達');

    // Step 2: マップ画面でモンスターエンカウント
    console.log('Step 2: モンスターエンカウントの実行');
    
    // マップ上のエンカウント可能な場所をクリック（森林エリア）
    const forestCell = page.locator('[data-testid="map-cell"]:has-text("🌲")').first();
    await expect(forestCell).toBeVisible({ timeout: 5000 });
    await forestCell.click();
    
    // プレイヤーパネルでプレイヤーモンスターの存在を確認
    await expect(page.locator('[data-testid="player-monster"]')).toBeVisible({ timeout: 5000 });
    
    // モンスターエンカウントボタンをクリック
    await expect(page.locator('button:has-text("モンスターを探す")')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("モンスターを探す")');
    
    // エンカウント結果の待機（成功するまで最大5回試行）
    let encounteredMonster = false;
    for (let i = 0; i < 5; i++) {
      try {
        // エンカウント成功の場合、バトル画面への遷移ボタンが表示される
        await expect(page.locator('button:has-text("バトル開始")')).toBeVisible({ timeout: 3000 });
        encounteredMonster = true;
        break;
      } catch {
        // エンカウント失敗の場合、再度モンスターを探すボタンをクリック
        await page.click('button:has-text("モンスターを探す")');
      }
    }
    
    expect(encounteredMonster).toBe(true);
    console.log('Step 2 完了: モンスターエンカウント成功');

    // Step 3: バトル画面への遷移
    console.log('Step 3: バトル画面への遷移');
    
    await page.click('button:has-text("バトル開始")');
    
    // バトル画面の読み込み完了を待機
    await expect(page.locator('text=バトル')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=野生の')).toBeVisible({ timeout: 5000 });
    
    console.log('Step 3 完了: バトル画面に遷移');

    // Step 4: プレイヤーモンスターの初期HP記録
    console.log('Step 4: 初期HP状態の記録');
    
    // プレイヤーモンスターのHP情報を取得
    const playerHpElement = page.locator('[data-testid="player-monster-hp"], .hp-bar').first();
    await expect(playerHpElement).toBeVisible({ timeout: 5000 });
    
    // HP表示テキストを取得（例: "25/30"の形式）
    const initialHpText = await page.locator('text=/\\d+\\/\\d+/').first().textContent();
    console.log('初期HP:', initialHpText);
    
    console.log('Step 4 完了: 初期HP記録');

    // Step 5: バトルで意図的に敗北するまで攻撃を受け続ける
    console.log('Step 5: 敗北まで攻撃を受け続ける');
    
    let battleOngoing = true;
    let turnCount = 0;
    const maxTurns = 20; // 無限ループ防止
    
    while (battleOngoing && turnCount < maxTurns) {
      turnCount++;
      console.log(`ターン ${turnCount}: バトル継続中`);
      
      try {
        // プレイヤーのターンの場合、何もしない（攻撃を受けるため）
        const playerTurnActions = page.locator('button:has-text("⚔️ たたかう")');
        if (await playerTurnActions.isVisible({ timeout: 2000 })) {
          console.log('プレイヤーのターン: 攻撃せずに待機');
          // 「にげる」ボタンをクリックしない（敗北を待つ）
          // 野生モンスターの自動ターンを待つ
          await page.waitForTimeout(3000);
        }
        
        // 敗北チェック（バトル結果画面への遷移）
        if (await page.locator('text=敗北').isVisible({ timeout: 1000 })) {
          console.log('敗北を検出！');
          battleOngoing = false;
          break;
        }
        
        // バトル画面から結果画面への遷移をチェック
        const currentUrl = page.url();
        if (currentUrl.includes('/battle/result')) {
          console.log('バトル結果画面への遷移を検出');
          battleOngoing = false;
          break;
        }
        
      } catch (error) {
        console.log('バトル継続チェック中のエラー:', error);
        await page.waitForTimeout(1000);
      }
    }
    
    expect(battleOngoing).toBe(false);
    console.log('Step 5 完了: バトル敗北確認');

    // Step 6: バトル結果画面での敗北確認
    console.log('Step 6: バトル結果画面での敗北処理確認');
    
    // バトル結果画面に遷移したことを確認
    await expect(page.locator('text=バトル結果')).toBeVisible({ timeout: 10000 });
    
    // 敗北メッセージの表示確認
    await expect(page.locator('text=敗北')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=モンスターが倒れてしまいました')).toBeVisible({ timeout: 5000 });
    
    console.log('Step 6 完了: 敗北メッセージ確認');

    // Step 7: HP回復処理中メッセージの確認
    console.log('Step 7: HP回復処理中メッセージの確認');
    
    // 「モンスターを回復中...」メッセージの表示確認
    await expect(page.locator('text=モンスターを回復中')).toBeVisible({ timeout: 5000 });
    
    console.log('Step 7 完了: 回復処理中メッセージ確認');

    // Step 8: HP回復完了メッセージの確認
    console.log('Step 8: HP回復完了メッセージの確認');
    
    // HP回復完了メッセージの表示確認
    await expect(page.locator('text=HPが回復しました！マップ画面に戻ります')).toBeVisible({ timeout: 10000 });
    
    console.log('Step 8 完了: HP回復完了メッセージ確認');

    // Step 9: 自動マップ画面遷移の確認
    console.log('Step 9: 自動マップ画面遷移の確認');
    
    // 2秒後に自動でマップ画面に戻ることを確認
    await expect(page.locator('text=冒険マップ')).toBeVisible({ timeout: 15000 });
    
    // URLがマップ画面であることを確認
    expect(page.url()).toMatch(/\/map$/);
    
    console.log('Step 9 完了: マップ画面への自動遷移確認');

    // Step 10: API呼び出しの確認
    console.log('Step 10: API呼び出しログの確認');
    
    const requests = (page as any).requests;
    console.log('記録されたAPIリクエスト:');
    requests.forEach((req: any, index: number) => {
      if (req.url.includes('/api/')) {
        console.log(`${index + 1}. ${req.method} ${req.url}`);
        if (req.postData) {
          console.log(`   Body: ${req.postData}`);
        }
      }
    });
    
    // HP更新APIの呼び出し確認
    const hpUpdateRequests = requests.filter((req: any) => 
      req.method === 'PUT' && req.url.includes('/api/test/monsters/')
    );
    
    expect(hpUpdateRequests.length).toBeGreaterThan(0);
    console.log(`HP更新API呼び出し回数: ${hpUpdateRequests.length}`);
    
    console.log('Step 10 完了: API呼び出し確認');

    // Step 11: コンソールログの確認
    console.log('Step 11: コンソールログの確認');
    
    const logs = (page as any).logs;
    console.log('記録されたコンソールログ（一部）:');
    logs.filter((log: string) => 
      log.includes('HP回復') || 
      log.includes('敗北') || 
      log.includes('バトル')
    ).forEach((log: string, index: number) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // HP回復関連のログが存在することを確認
    const hpRecoveryLogs = logs.filter((log: string) => 
      log.includes('HP回復処理') || log.includes('回復')
    );
    
    expect(hpRecoveryLogs.length).toBeGreaterThan(0);
    console.log(`HP回復関連ログ数: ${hpRecoveryLogs.length}`);
    
    console.log('Step 11 完了: コンソールログ確認');

    console.log('🎉 全てのテストが完了しました！');
  });

  test('バトル敗北時のHP回復処理が正しくAPI呼び出しを行う', async ({ page }) => {
    // より詳細なAPI監視テスト
    const apiCalls: Array<{
      url: string;
      method: string;
      requestBody?: any;
      responseStatus?: number;
      responseBody?: any;
    }> = [];

    // リクエストとレスポンスの詳細を記録
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        const call = {
          url: request.url(),
          method: request.method(),
          requestBody: request.postData() ? JSON.parse(request.postData()!) : undefined
        };
        apiCalls.push(call);
      }
    });

    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        const call = apiCalls.find(c => c.url === response.url() && !('responseStatus' in c));
        if (call) {
          call.responseStatus = response.status();
          try {
            call.responseBody = await response.json();
          } catch {
            // JSON以外のレスポンスは無視
          }
        }
      }
    });

    // テストフローの実行（簡略版）
    await page.goto('/');
    
    // ログインとプレイヤー作成
    await page.click('text=ログイン');
    await page.click('button:has-text("テストユーザーでログイン")');
    
    // プレイヤー作成画面が表示された場合のみ入力
    try {
      await expect(page.locator('text=プレイヤー作成')).toBeVisible({ timeout: 5000 });
      await page.fill('input[placeholder="プレイヤー名を入力"]', 'APIテストプレイヤー');
      await page.click('button:has-text("作成")');
    } catch {
      // 既存ユーザーの場合はスキップ
      const continueButton = page.locator('button:has-text("ゲームを続ける")');
      if (await continueButton.isVisible({ timeout: 3000 })) {
        await continueButton.click();
      }
    }
    
    // マップでエンカウント
    await page.click('[data-testid="map-cell"]:has-text("🌲")');
    await page.click('button:has-text("モンスターを探す")');
    
    // エンカウント成功まで繰り返し
    let attempts = 0;
    while (attempts < 5) {
      try {
        await expect(page.locator('button:has-text("バトル開始")')).toBeVisible({ timeout: 3000 });
        break;
      } catch {
        await page.click('button:has-text("モンスターを探す")');
        attempts++;
      }
    }
    
    await page.click('button:has-text("バトル開始")');
    
    // 敗北まで待機（簡略化）
    await page.waitForTimeout(5000);
    
    // 野生モンスターのターンを数回待つ
    for (let i = 0; i < 10; i++) {
      if (await page.locator('text=敗北').isVisible({ timeout: 1000 })) {
        break;
      }
      await page.waitForTimeout(2000);
    }
    
    // バトル結果画面での処理完了を待機
    await expect(page.locator('text=HPが回復しました')).toBeVisible({ timeout: 15000 });
    
    // API呼び出しの詳細検証
    console.log('API呼び出し詳細:');
    apiCalls.forEach((call, index) => {
      console.log(`${index + 1}. ${call.method} ${call.url}`);
      console.log(`   Status: ${call.responseStatus}`);
      if (call.requestBody) {
        console.log(`   Request: ${JSON.stringify(call.requestBody)}`);
      }
      if (call.responseBody) {
        console.log(`   Response: ${JSON.stringify(call.responseBody)}`);
      }
    });
    
    // HP更新API呼び出しの検証
    const hpUpdateCall = apiCalls.find(call => 
      call.method === 'PUT' && 
      call.url.includes('/monsters/') &&
      call.requestBody?.currentHp !== undefined
    );
    
    expect(hpUpdateCall).toBeDefined();
    expect(hpUpdateCall?.responseStatus).toBe(200);
    
    // リクエストボディにcurrentHpが含まれていることを確認
    expect(hpUpdateCall?.requestBody).toHaveProperty('currentHp');
    expect(typeof hpUpdateCall?.requestBody.currentHp).toBe('number');
    
    console.log('API詳細テスト完了');
  });
});