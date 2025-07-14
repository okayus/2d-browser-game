/**
 * 新規登録ページコンポーネント
 * 
 * 初学者向けメモ：
 * - RegisterFormをラップして統一されたページレイアウトを提供
 * - 新規登録成功時の遷移処理を管理
 * - ナビゲーション機能を統合
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';

/**
 * 新規登録ページのメインコンポーネント
 * 
 * 初学者向けメモ：
 * - ページ全体のレイアウトを管理
 * - 新規登録成功時にプレイヤー作成画面へリダイレクト
 * - ログインページへのリンクを提供
 */
export function RegisterPage() {
  const navigate = useNavigate();

  /**
   * 新規登録成功時の処理
   * 
   * 初学者向けメモ：
   * - Firebase認証成功後に呼び出される
   * - 新規ユーザーは必ずプレイヤー作成画面から開始
   */
  const handleRegisterSuccess = () => {
    // 新規登録後は必ずプレイヤー作成画面へ
    // ゲーム状態をリセットして最初から開始
    localStorage.removeItem('game_state');
    localStorage.removeItem('selected_monster');
    localStorage.removeItem('player_id');
    localStorage.removeItem('player_name');
    
    navigate('/player-creation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダーセクション */}
        <div className="text-center mb-8">
          <Link to="/" className="text-white hover:text-green-200 transition-colors inline-block">
            <div className="text-4xl mb-2">🎮</div>
            <h1 className="text-2xl font-bold text-white">モンスター収集ゲーム</h1>
          </Link>
          <p className="text-white/70 text-sm mt-2">新しいアカウントを作成</p>
        </div>

        {/* 新規登録フォーム */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 shadow-xl">
          <RegisterForm 
            onSuccess={handleRegisterSuccess}
            showLoginLink={false}
          />
          
          {/* ログインリンク */}
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              既にアカウントをお持ちの方は{' '}
              <Link
                to="/login"
                className="text-green-300 hover:text-green-200 font-medium transition-colors"
              >
                ログイン
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

        {/* 利用規約・プライバシーポリシー */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs">
            アカウント作成により、
            <button className="text-green-300 hover:text-green-200 underline mx-1">
              利用規約
            </button>
            と
            <button className="text-green-300 hover:text-green-200 underline mx-1">
              プライバシーポリシー
            </button>
            に同意したものとみなします
          </p>
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
 * 初学者向けメモ：RegisterPageの設計思想
 * 
 * 1. LoginPageとの統一性
 *    - 同様のレイアウト構造
 *    - 異なる色調で視覚的に区別（緑系）
 *    - 一貫したUXパターン
 * 
 * 2. 新規ユーザー体験
 *    - 登録後の明確な導線
 *    - ゲーム状態のクリーンスタート
 *    - 適切な情報提供
 * 
 * 3. セキュリティ考慮
 *    - 利用規約への同意確認
 *    - プライバシーポリシーの明示
 *    - 法的要件への対応
 * 
 * 4. アクセシビリティ
 *    - スクリーンリーダー対応
 *    - 十分なコントラスト
 *    - 論理的なタブ順序
 * 
 * 5. パフォーマンス
 *    - 軽量なコンポーネント構造
 *    - 効率的な状態管理
 *    - 最小限のre-render
 */