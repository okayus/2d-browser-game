/**
 * プレイヤー作成ページ
 * 
 * 初学者向けメモ：
 * - 新しいプレイヤーアカウントを作成するフォーム
 * - バリデーション機能付きの入力フォーム
 * - API通信でバックエンドにデータを送信
 * - 成功時はプレイヤー詳細ページにリダイレクト
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ArrowLeft, Loader2 } from 'lucide-react';
import { ゲームボタン } from '../components/ゲームボタン';
import { ゲームカード } from '../components/ゲームカード';
import { useプレイヤー名 } from '../hooks/useプレイヤー名';

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
  const location = useLocation();
  const { プレイヤー名: カスタムフックプレイヤー名, setプレイヤー名 } = useプレイヤー名();
  
  // フォームの状態管理
  const [フォームデータ, setフォームデータ] = useState({
    名前: '',
  });
  
  const [エラー, setエラー] = useState<string | null>(null);
  const [送信中, set送信中] = useState(false);

  // 初期化時にプレイヤー名を設定
  useEffect(() => {
    // ホーム画面から渡されたプレイヤー名を取得
    const 渡されたプレイヤー名 = location.state?.プレイヤー名;
    
    if (渡されたプレイヤー名) {
      setフォームデータ(prev => ({ ...prev, 名前: 渡されたプレイヤー名 }));
    } else if (カスタムフックプレイヤー名) {
      // ローカルストレージから復元されたプレイヤー名を使用
      setフォームデータ(prev => ({ ...prev, 名前: カスタムフックプレイヤー名 }));
    }
  }, [location.state?.プレイヤー名, カスタムフックプレイヤー名]);

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center space-x-4">
        <ゲームボタン
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>戻る</span>
        </ゲームボタン>
        <div className="h-6 w-px bg-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">新しいプレイヤーを作成</h1>
      </div>

      {/* フォーム */}
      <ゲームカード variant="elevated" padding="lg">
        <ゲームカード.Header>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">プレイヤー情報</h2>
              <p className="text-sm text-gray-600">ゲームで使用するプレイヤー名を設定してください</p>
            </div>
          </div>
        </ゲームカード.Header>

        <ゲームカード.Content>
          <form onSubmit={フォーム送信ハンドラー} className="space-y-6">
            {/* プレイヤー名入力 */}
            <div>
              <label htmlFor="名前" className="block text-sm font-medium text-gray-700 mb-2">
                プレイヤー名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="名前"
                  name="名前"
                  value={フォームデータ.名前}
                  onChange={入力変更ハンドラー}
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg text-sm transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${エラー 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  placeholder="プレイヤー名を入力してください"
                  maxLength={20}
                  disabled={送信中}
                  autoFocus
                />
              </div>
              
              {/* 文字数カウンターとステータス */}
              <div className="flex justify-between items-center mt-2">
                <div>
                  {エラー && (
                    <p className="text-sm text-red-500">{エラー}</p>
                  )}
                  {!エラー && フォームデータ.名前.length > 0 && (
                    <p className="text-sm text-green-600">✓ 有効なプレイヤー名です</p>
                  )}
                </div>
                <span className={`text-sm ${
                  フォームデータ.名前.length > 15 ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {フォームデータ.名前.length}/20
                </span>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end space-x-3">
              <ゲームボタン
                type="button"
                variant="secondary"
                onClick={() => {
                  setフォームデータ({ 名前: '' });
                  setエラー(null);
                }}
                disabled={送信中 || !フォームデータ.名前}
              >
                クリア
              </ゲームボタン>
              
              <ゲームボタン
                type="submit"
                variant="primary"
                disabled={送信中 || !フォームデータ.名前.trim()}
                className="min-w-[120px]"
              >
                {送信中 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    作成中...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    プレイヤーを作成
                  </>
                )}
              </ゲームボタン>
            </div>
          </form>
        </ゲームカード.Content>
      </ゲームカード>

      {/* 説明セクション */}
      <ゲームカード variant="outlined" padding="lg" className="bg-gray-50">
        <ゲームカード.Header>
          <h2 className="text-lg font-semibold text-gray-900">
            プレイヤー作成について
          </h2>
        </ゲームカード.Header>
        <ゲームカード.Content>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• プレイヤー名は一意である必要はありません</p>
            <p>• 作成後にプレイヤー名を変更することはできません</p>
            <p>• 各プレイヤーは独自のIDを持ち、モンスターを管理できます</p>
            <p>• 今後の開発で、プレイヤーレベルや経験値などの機能を追加予定です</p>
          </div>
        </ゲームカード.Content>
      </ゲームカード>
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