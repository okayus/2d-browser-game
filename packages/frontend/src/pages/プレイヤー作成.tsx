/**
 * プレイヤー作成ページ
 * 
 * 初学者向けメモ：
 * - 新しいプレイヤーアカウントを作成するフォーム
 * - バリデーション機能付きの入力フォーム
 * - API通信でバックエンドにデータを送信
 * - 成功時はプレイヤー詳細ページにリダイレクト
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Loader2 } from 'lucide-react';

/**
 * プレイヤー作成ページコンポーネント
 * 
 * 初学者向けメモ：
 * - React Hooksを使用した状態管理
 * - フォームバリデーション
 * - 非同期API通信
 * - エラーハンドリング
 */
export function プレイヤー作成() {
  const navigate = useNavigate();
  
  // フォームの状態管理
  const [フォームデータ, setフォームデータ] = useState({
    名前: '',
  });
  
  const [エラー, setエラー] = useState<string | null>(null);
  const [送信中, set送信中] = useState(false);

  /**
   * フォーム入力時のハンドラー
   * 
   * 初学者向けメモ：
   * - 入力値の変更時に状態を更新
   * - エラーメッセージをクリア
   */
  const 入力変更ハンドラー = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setフォームデータ(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // エラーメッセージをクリア
    if (エラー) {
      setエラー(null);
    }
  };

  /**
   * フォーム送信時のハンドラー
   * 
   * 初学者向けメモ：
   * - フォームバリデーション
   * - API通信
   * - 成功時のリダイレクト
   * - エラーハンドリング
   */
  const フォーム送信ハンドラー = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!フォームデータ.名前.trim()) {
      setエラー('プレイヤー名を入力してください');
      return;
    }
    
    if (フォームデータ.名前.length > 20) {
      setエラー('プレイヤー名は20文字以内で入力してください');
      return;
    }
    
    try {
      set送信中(true);
      setエラー(null);
      
      // API通信
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          名前: フォームデータ.名前.trim(),
        }),
      });
      
      const データ = await response.json();
      
      if (!response.ok) {
        throw new Error(データ.メッセージ || 'プレイヤーの作成に失敗しました');
      }
      
      // 成功時は作成されたプレイヤーの詳細ページにリダイレクト
      navigate(`/players/${データ.データ.id}`);
      
    } catch (error) {
      console.error('プレイヤー作成エラー:', error);
      setエラー(error instanceof Error ? error.message : '予期しないエラーが発生しました');
    } finally {
      set送信中(false);
    }
  };

  return (
    <div className=\"max-w-2xl mx-auto space-y-6\">
      {/* ページヘッダー */}
      <div className=\"flex items-center space-x-4\">
        <button
          onClick={() => navigate(-1)}
          className=\"flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors\"
        >
          <ArrowLeft className=\"h-5 w-5\" />
          <span>戻る</span>
        </button>
        <div className=\"h-6 w-px bg-gray-300\" />
        <h1 className=\"text-2xl font-bold text-gray-900\">新しいプレイヤーを作成</h1>
      </div>

      {/* フォーム */}
      <div className=\"bg-white rounded-lg shadow-md p-6\">
        <form onSubmit={フォーム送信ハンドラー} className=\"space-y-6\">
          {/* プレイヤー名入力 */}
          <div>
            <label htmlFor=\"名前\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              プレイヤー名
            </label>
            <div className=\"relative\">
              <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">
                <User className=\"h-5 w-5 text-gray-400\" />
              </div>
              <input
                type=\"text\"
                id=\"名前\"
                name=\"名前\"
                value={フォームデータ.名前}
                onChange={入力変更ハンドラー}
                className=\"block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                placeholder=\"プレイヤー名を入力してください\"
                maxLength={20}
                disabled={送信中}
              />
            </div>
            <p className=\"mt-2 text-sm text-gray-500\">
              20文字以内で入力してください（現在: {フォームデータ.名前.length}/20文字）
            </p>
          </div>

          {/* エラーメッセージ */}
          {エラー && (
            <div className=\"bg-red-50 border border-red-200 rounded-md p-4\">
              <div className=\"flex\">
                <div className=\"ml-3\">
                  <p className=\"text-sm text-red-800\">{エラー}</p>
                </div>
              </div>
            </div>
          )}

          {/* 送信ボタン */}
          <div className=\"flex justify-end\">
            <button
              type=\"submit\"
              disabled={送信中 || !フォームデータ.名前.trim()}
              className=\"inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors\"
            >
              {送信中 ? (
                <>
                  <Loader2 className=\"h-4 w-4 animate-spin\" />
                  <span>作成中...</span>
                </>
              ) : (
                <>
                  <User className=\"h-4 w-4\" />
                  <span>プレイヤーを作成</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 説明セクション */}
      <div className=\"bg-gray-50 rounded-lg p-6\">
        <h2 className=\"text-lg font-semibold text-gray-900 mb-3\">
          プレイヤー作成について
        </h2>
        <div className=\"space-y-2 text-sm text-gray-600\">
          <p>• プレイヤー名は一意である必要はありません</p>
          <p>• 作成後にプレイヤー名を変更することはできません</p>
          <p>• 各プレイヤーは独自のIDを持ち、モンスターを管理できます</p>
          <p>• 今後の開発で、プレイヤーレベルや経験値などの機能を追加予定です</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 初学者向けメモ：プレイヤー作成フォームの実装ポイント
 * 
 * 1. 状態管理
 *    - useState でフォームデータ、エラー、送信状態を管理
 *    - 入力値の変更時に状態を更新
 * 
 * 2. バリデーション
 *    - 必須項目チェック
 *    - 文字数制限チェック
 *    - リアルタイム文字数表示
 * 
 * 3. API通信
 *    - fetch API を使用
 *    - エラーハンドリング
 *    - ローディング状態の表示
 * 
 * 4. ユーザビリティ
 *    - 送信中の無効化
 *    - 分かりやすいエラーメッセージ
 *    - 戻るボタン
 * 
 * 5. アクセシビリティ
 *    - 適切な label 要素
 *    - フォーカス管理
 *    - キーボードナビゲーション
 */