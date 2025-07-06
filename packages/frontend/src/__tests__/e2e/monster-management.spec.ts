/**
 * モンスター管理のE2Eテスト
 * 
 * 初学者向けメモ：
 * - 実際のブラウザを使用したエンドツーエンドテスト
 * - ユーザーの実際の操作フローをテスト
 * - フロントエンドとバックエンドの統合テスト
 */

import { test, expect } from '@playwright/test';

/**
 * テスト前の準備
 * 
 * 初学者向けメモ：
 * - 各テスト実行前にクリーンな状態にする
 * - 開発サーバーが起動していることを前提
 */
test.beforeEach(async ({ page }) => {
  // ホームページに移動
  await page.goto('http://localhost:5173/');
  
  // ページが完全に読み込まれるまで待機
  await page.waitForLoadState('networkidle');
});

test.describe('モンスター管理フロー', () => {
  /**
   * プレイヤー作成からモンスター管理までの基本フロー
   * 
   * 初学者向けメモ：
   * - 実際のユーザージャーニーをテスト
   * - 画面遷移とデータの永続化を確認
   */
  test('プレイヤー作成から初期モンスター確認まで', async ({ page }) => {
    // 1. ホームページの確認
    await expect(page.locator('h1')).toContainText('モンスター収集ゲーム');
    
    // 2. 新しいゲーム開始ボタンをクリック
    await page.click('text=新しいゲームを開始');
    
    // 3. プレイヤー作成ページに遷移
    await expect(page).toHaveURL(/.*\/players\/new/);
    await expect(page.locator('h1')).toContainText('プレイヤー作成');
    
    // 4. プレイヤー名を入力
    const プレイヤー名 = 'E2Eテストプレイヤー';
    await page.fill('input[name="名前"]', プレイヤー名);
    
    // 5. プレイヤー作成ボタンをクリック
    await page.click('button[type="submit"]');
    
    // 6. プレイヤー詳細ページに遷移
    await page.waitForURL(/.*\/players\/[a-zA-Z0-9_-]+/);
    
    // 7. プレイヤー情報の確認
    await expect(page.locator('h1')).toContainText(プレイヤー名);
    
    // 8. 初期モンスターが付与されていることを確認
    await expect(page.locator('text=所持モンスター一覧')).toBeVisible();
    await expect(page.locator('text=1体のモンスターを所持')).toBeVisible();
    
    // 9. 初期モンスターの詳細確認
    const モンスターカード = page.locator('[data-testid="monster-card"]').first();
    await expect(モンスターカード).toBeVisible();
    
    // スターターモンスターのいずれかが表示されていることを確認
    const スターター種族 = ['でんきネズミ', 'ほのおトカゲ', 'くさモグラ'];
    let 種族見つかった = false;
    
    for (const 種族名 of スターター種族) {
      const 種族要素 = page.locator(`text=${種族名}`);
      if (await 種族要素.isVisible()) {
        種族見つかった = true;
        break;
      }
    }
    
    expect(種族見つかった).toBeTruthy();
  });

  /**
   * モンスターニックネーム変更テスト
   * 
   * 初学者向けメモ：
   * - モーダルダイアログの操作
   * - フォーム入力とバリデーション
   * - データ更新の確認
   */
  test('モンスターのニックネーム変更', async ({ page }) => {
    // プレイヤー作成（共通処理）
    await page.click('text=新しいゲームを開始');
    await page.fill('input[name="名前"]', 'ニックネーム変更テスター');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/players\/[a-zA-Z0-9_-]+/);
    
    // 1. ニックネーム変更ボタンをクリック
    await page.click('text=ニックネーム変更');
    
    // 2. モーダルダイアログが開くことを確認
    const モーダル = page.locator('[role="dialog"]');
    await expect(モーダル).toBeVisible();
    await expect(モーダル.locator('h2')).toContainText('ニックネーム変更');
    
    // 3. 新しいニックネームを入力
    const 新しいニックネーム = 'ピカチュウ';
    await page.fill('input[name="ニックネーム"]', 新しいニックネーム);
    
    // 4. 保存ボタンをクリック
    await page.click('button:has-text("保存")');
    
    // 5. モーダルが閉じることを確認
    await expect(モーダル).not.toBeVisible();
    
    // 6. ニックネームが更新されていることを確認
    await expect(page.locator(`text=${新しいニックネーム}`)).toBeVisible();
    
    // 7. ページをリロードしても変更が保持されていることを確認
    await page.reload();
    await expect(page.locator(`text=${新しいニックネーム}`)).toBeVisible();
  });

  /**
   * ニックネーム変更のバリデーションテスト
   * 
   * 初学者向けメモ：
   * - 入力値検証のE2Eテスト
   * - エラーメッセージの表示確認
   * - ユーザビリティの確認
   */
  test('ニックネーム変更のバリデーション', async ({ page }) => {
    // プレイヤー作成（共通処理）
    await page.click('text=新しいゲームを開始');
    await page.fill('input[name="名前"]', 'バリデーションテスター');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/players\/[a-zA-Z0-9_-]+/);
    
    // 1. ニックネーム変更ダイアログを開く
    await page.click('text=ニックネーム変更');
    const モーダル = page.locator('[role="dialog"]');
    await expect(モーダル).toBeVisible();
    
    // 2. 空文字でのバリデーションテスト
    await page.fill('input[name="ニックネーム"]', '');
    await page.click('button:has-text("保存")');
    
    // エラーメッセージの確認
    await expect(page.locator('text=ニックネームは必須です')).toBeVisible();
    
    // 3. 長すぎる文字列でのバリデーションテスト
    const 長いニックネーム = 'a'.repeat(21); // 21文字
    await page.fill('input[name="ニックネーム"]', 長いニックネーム);
    await page.click('button:has-text("保存")');
    
    // エラーメッセージの確認
    await expect(page.locator('text=ニックネームは20文字以内で入力してください')).toBeVisible();
    
    // 4. 有効な文字列でのテスト
    await page.fill('input[name="ニックネーム"]', '有効なニックネーム');
    await page.click('button:has-text("保存")');
    
    // 正常に保存されることを確認
    await expect(モーダル).not.toBeVisible();
    await expect(page.locator('text=有効なニックネーム')).toBeVisible();
  });

  /**
   * モンスター解放テスト
   * 
   * 初学者向けメモ：
   * - 危険な操作の確認ダイアログ
   * - データの削除確認
   * - UI状態の更新確認
   */
  test('モンスター解放機能', async ({ page }) => {
    // プレイヤー作成（共通処理）
    await page.click('text=新しいゲームを開始');
    await page.fill('input[name="名前"]', '解放テスター');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/players\/[a-zA-Z0-9_-]+/);
    
    // 初期状態の確認
    await expect(page.locator('text=1体のモンスターを所持')).toBeVisible();
    
    // 1. 解放ボタンをクリック
    await page.click('text=解放');
    
    // 2. 確認ダイアログが表示されることを確認
    const 確認ダイアログ = page.locator('[role="alertdialog"]');
    await expect(確認ダイアログ).toBeVisible();
    await expect(確認ダイアログ.locator('text=本当に解放しますか？')).toBeVisible();
    
    // 3. キャンセルボタンのテスト
    await page.click('button:has-text("キャンセル")');
    await expect(確認ダイアログ).not.toBeVisible();
    
    // モンスターがまだ存在することを確認
    await expect(page.locator('text=1体のモンスターを所持')).toBeVisible();
    
    // 4. 実際の解放処理
    await page.click('text=解放');
    await expect(確認ダイアログ).toBeVisible();
    await page.click('button:has-text("解放する")');
    
    // 5. 解放後の状態確認
    await expect(確認ダイアログ).not.toBeVisible();
    await expect(page.locator('text=モンスターを所持していません')).toBeVisible();
    await expect(page.locator('text=野生のモンスターを捕まえましょう！')).toBeVisible();
    
    // 6. ページリロード後も状態が保持されていることを確認
    await page.reload();
    await expect(page.locator('text=モンスターを所持していません')).toBeVisible();
  });

  /**
   * モンスター獲得フローテスト
   * 
   * 初学者向けメモ：
   * - 新しいモンスターの獲得テスト
   * - APIとの統合確認
   * - 複数モンスター所持時の表示確認
   */
  test('新しいモンスター獲得フロー', async ({ page }) => {
    // プレイヤー作成（共通処理）
    await page.click('text=新しいゲームを開始');
    await page.fill('input[name="名前"]', 'モンスターハンター');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/players\/[a-zA-Z0-9_-]+/);
    
    // 初期状態確認
    await expect(page.locator('text=1体のモンスターを所持')).toBeVisible();
    
    // 1. モンスター獲得ボタンをクリック
    await page.click('text=新しいモンスターを獲得');
    
    // 2. 種族選択画面の確認
    await expect(page.locator('h2:has-text("モンスター獲得")')).toBeVisible();
    
    // 3. 種族を選択（いわゴーレムを選択）
    await page.click('text=いわゴーレム');
    
    // 4. 獲得ボタンをクリック
    await page.click('button:has-text("獲得する")');
    
    // 5. 獲得成功の確認
    await expect(page.locator('text=2体のモンスターを所持')).toBeVisible();
    await expect(page.locator('text=いわゴーレム')).toBeVisible();
    
    // 6. モンスターカードが2つ表示されていることを確認
    const モンスターカード一覧 = page.locator('[data-testid="monster-card"]');
    await expect(モンスターカード一覧).toHaveCount(2);
  });

  /**
   * レスポンシブデザインテスト
   * 
   * 初学者向けメモ：
   * - 異なる画面サイズでの表示確認
   * - モバイル対応の確認
   * - タッチ操作の確認
   */
  test('モバイル画面でのモンスター管理', async ({ page }) => {
    // モバイル画面サイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    // プレイヤー作成
    await page.click('text=新しいゲームを開始');
    await page.fill('input[name="名前"]', 'モバイルユーザー');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/players\/[a-zA-Z0-9_-]+/);
    
    // 1. モバイル表示の確認
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=所持モンスター一覧')).toBeVisible();
    
    // 2. モンスターカードがモバイル用レイアウトで表示されることを確認
    const モンスターカード = page.locator('[data-testid="monster-card"]').first();
    await expect(モンスターカード).toBeVisible();
    
    // 3. ボタンがタップしやすいサイズで表示されることを確認
    const ニックネーム変更ボタン = page.locator('text=ニックネーム変更');
    const ボタンサイズ = await ニックネーム変更ボタン.boundingBox();
    expect(ボタンサイズ?.height).toBeGreaterThan(44); // 最小タップターゲットサイズ
    
    // 4. モバイルでのニックネーム変更操作
    await ニックネーム変更ボタン.tap();
    const モーダル = page.locator('[role="dialog"]');
    await expect(モーダル).toBeVisible();
    
    // モバイルキーボード表示の確認
    await page.fill('input[name="ニックネーム"]', 'モバイルモンスター');
    await page.tap('button:has-text("保存")');
    await expect(モーダル).not.toBeVisible();
    await expect(page.locator('text=モバイルモンスター')).toBeVisible();
  });

  /**
   * アクセシビリティテスト
   * 
   * 初学者向けメモ：
   * - キーボード操作の確認
   * - スクリーンリーダー対応の確認
   * - フォーカス管理の確認
   */
  test('キーボード操作でのモンスター管理', async ({ page }) => {
    // プレイヤー作成
    await page.click('text=新しいゲームを開始');
    await page.fill('input[name="名前"]', 'キーボードユーザー');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/players\/[a-zA-Z0-9_-]+/);
    
    // 1. Tabキーでのナビゲーション
    await page.keyboard.press('Tab'); // 最初のフォーカス可能要素へ
    
    // 2. ニックネーム変更ボタンまでTabで移動
    let 現在のフォーカス = page.locator(':focus');
    
    // ニックネーム変更ボタンにフォーカスが当たるまでTab
    for (let i = 0; i < 10; i++) {
      const フォーカス要素テキスト = await 現在のフォーカス.textContent();
      if (フォーカス要素テキスト?.includes('ニックネーム変更')) {
        break;
      }
      await page.keyboard.press('Tab');
      現在のフォーカス = page.locator(':focus');
    }
    
    // 3. Enterキーでボタンを押下
    await page.keyboard.press('Enter');
    
    // 4. モーダルが開き、入力フィールドにフォーカスが移ることを確認
    const モーダル = page.locator('[role="dialog"]');
    await expect(モーダル).toBeVisible();
    
    const 入力フィールド = モーダル.locator('input[name="ニックネーム"]');
    await expect(入力フィールド).toBeFocused();
    
    // 5. キーボードでニックネーム入力
    await page.keyboard.type('キーボード入力モンスター');
    
    // 6. Tabで保存ボタンに移動してEnterで実行
    await page.keyboard.press('Tab');
    await expect(モーダル.locator('button:has-text("保存")')).toBeFocused();
    await page.keyboard.press('Enter');
    
    // 7. モーダルが閉じ、元のページに戻ることを確認
    await expect(モーダル).not.toBeVisible();
    await expect(page.locator('text=キーボード入力モンスター')).toBeVisible();
  });
});

/**
 * 初学者向けメモ：E2Eテストのポイント
 * 
 * 1. ユーザー中心のテスト
 *    - 実際のユーザーが行う操作をテスト
 *    - 技術的な実装詳細ではなく、ユーザー体験をテスト
 *    - 複数の機能にまたがる統合的な動作を確認
 * 
 * 2. 環境の準備
 *    - 開発サーバーが起動していることを前提
 *    - テスト前後のデータクリーンアップ
 *    - 一貫した初期状態の確保
 * 
 * 3. 待機戦略
 *    - ページの読み込み完了を待機
 *    - 非同期処理の完了を待機
 *    - DOM要素の表示を確認してから操作
 * 
 * 4. アクセシビリティ配慮
 *    - キーボード操作のテスト
 *    - 異なる画面サイズでのテスト
 *    - セマンティックHTMLの活用確認
 * 
 * 5. エラーケースの確認
 *    - バリデーションエラーの表示
 *    - ネットワークエラーの処理
 *    - 予期しない状況での動作
 */