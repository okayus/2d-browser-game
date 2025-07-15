/**
 * ログインページコンポーネント
 * 
 * 初学者向けメモ：
 * - LoginFormをラップして統一されたページレイアウトを提供
 * - ログイン成功時の遷移処理を管理
 * - ナビゲーション機能を統合
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { playerApi } from '../lib/api';
import { setStorageData } from '../lib/utils';

/**
 * ログインページのメインコンポーネント
 * 
 * 初学者向けメモ：
 * - ページ全体のレイアウトを管理
 * - ログイン成功時にゲームページへリダイレクト
 * - 新規登録ページへのリンクを提供
 */
export function LoginPage() {
  const navigate = useNavigate();

  /**
   * ログイン成功時の処理
   * 
   * 初学者向けメモ：
   * - Firebase認証成功後に呼び出される
   * - /api/players/meでプレイヤー情報を確認
   * - 既存プレイヤーはマップ画面へ、新規ユーザーはプレイヤー作成画面へ
   */
  const handleLoginSuccess = async () => {
    try {
      console.log('ログイン成功、プレイヤー情報を確認中...');
      
      // Firebase認証済みユーザーのプレイヤー情報を取得
      const player = await playerApi.getCurrent();
      
      if (player) {
        // 既存プレイヤーの場合
        console.log('既存プレイヤーを検出:', player);
        
        // LocalStorageにプレイヤー情報を保存
        setStorageData('player_id', (player as any).id);
        setStorageData('player_name', (player as any).name);
        setStorageData('game_state', 'playing');
        
        // マップ画面へ遷移
        navigate('/map');
      } else {
        // 新規ユーザーの場合
        console.log('新規ユーザー、プレイヤー作成画面へ');
        navigate('/player-creation');
      }
    } catch (error) {
      console.error('プレイヤー情報の取得エラー:', error);
      
      // エラーが404（プレイヤーが見つからない）の場合は新規作成へ
      if ((error as any).status === 404) {
        console.log('プレイヤーが見つからないため、新規作成画面へ');
        navigate('/player-creation');
      } else {
        // その他のエラーの場合も一旦プレイヤー作成画面へ
        console.error('予期しないエラーが発生しました:', error);
        navigate('/player-creation');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダーセクション */}
        <div className="text-center mb-8">
          <Link to="/" className="text-white hover:text-blue-200 transition-colors inline-block">
            <div className="text-4xl mb-2">🎮</div>
            <h1 className="text-2xl font-bold text-white">モンスター収集ゲーム</h1>
          </Link>
          <p className="text-white/70 text-sm mt-2">アカウントにログイン</p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 shadow-xl">
          <LoginForm 
            onSuccess={handleLoginSuccess}
            showRegisterLink={false}
          />
          
          {/* 新規登録リンク */}
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              アカウントをお持ちでない方は{' '}
              <Link
                to="/register"
                className="text-blue-300 hover:text-blue-200 font-medium transition-colors"
              >
                新規登録
              </Link>
            </p>
          </div>

          {/* スタートページに戻るリンク */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-white/50 hover:text-white/70 text-sm transition-colors"
            >
              ← スタートページに戻る
            </Link>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-8 text-white/50 text-xs">
          <p>学習用プロジェクト | 初学者向けプログラミング教材</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 初学者向けメモ：LoginPageの設計思想
 * 
 * 1. レスポンシブデザイン
 *    - モバイル・デスクトップ両対応
 *    - flexboxを使用した中央配置
 * 
 * 2. ユーザーエクスペリエンス
 *    - ログイン成功時の自動遷移
 *    - 既存ゲーム状態の考慮
 *    - 明確なナビゲーション
 * 
 * 3. ビジュアルデザイン
 *    - ゲームらしいグラデーション背景
 *    - ガラスモーフィズム効果
 *    - 統一されたカラーパレット
 * 
 * 4. アクセシビリティ
 *    - 適切なコントラスト比
 *    - キーボードナビゲーション対応
 *    - セマンティックなHTML構造
 */