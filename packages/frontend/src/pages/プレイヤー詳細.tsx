/**
 * プレイヤー詳細ページ
 * 
 * 初学者向けメモ：
 * - 特定のプレイヤーの詳細情報を表示
 * - URLパラメータからプレイヤーIDを取得
 * - API通信でプレイヤー情報を取得
 * - ローディング・エラー状態の管理
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Calendar, Loader2, AlertCircle } from 'lucide-react';

/**
 * プレイヤー情報の型定義
 */
interface プレイヤー情報 {
  id: string;
  名前: string;
  作成日時: string;
}

/**
 * プレイヤー詳細ページコンポーネント
 * 
 * 初学者向けメモ：
 * - useParams でURLパラメータを取得
 * - useEffect でコンポーネントマウント時にデータを取得
 * - 条件付きレンダリングでローディング・エラー状態を表示
 */
export function プレイヤー詳細() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [プレイヤー, setプレイヤー] = useState<プレイヤー情報 | null>(null);
  const [読み込み中, set読み込み中] = useState(true);
  const [エラー, setエラー] = useState<string | null>(null);

  /**
   * プレイヤー情報取得関数
   * 
   * 初学者向けメモ：
   * - API通信でプレイヤー情報を取得
   * - エラーハンドリング
   * - ローディング状態の管理
   */
  const プレイヤー情報取得 = async () => {
    if (!id) {
      setエラー('プレイヤーIDが指定されていません');
      set読み込み中(false);
      return;
    }

    try {
      const response = await fetch(`/api/players/${id}`);
      const データ = await response.json();

      if (!response.ok) {
        throw new Error(データ.メッセージ || 'プレイヤー情報の取得に失敗しました');
      }

      setプレイヤー(データ.データ);
    } catch (error) {
      console.error('プレイヤー情報取得エラー:', error);
      setエラー(error instanceof Error ? error.message : '予期しないエラーが発生しました');
    } finally {
      set読み込み中(false);
    }
  };

  /**
   * コンポーネントマウント時にプレイヤー情報を取得
   */
  useEffect(() => {
    プレイヤー情報取得();
  }, [id]);

  /**
   * 日付フォーマット関数
   * 
   * 初学者向けメモ：
   * - ISO文字列を日本語形式に変換
   * - 読みやすい形式で表示
   */
  const 日付フォーマット = (日付文字列: string) => {
    const 日付 = new Date(日付文字列);
    return 日付.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ローディング状態
  if (読み込み中) {
    return (
      <div className=\"max-w-2xl mx-auto space-y-6\">
        <div className=\"flex items-center justify-center py-12\">
          <div className=\"text-center space-y-4\">
            <Loader2 className=\"h-8 w-8 animate-spin text-blue-600 mx-auto\" />
            <p className=\"text-gray-600\">プレイヤー情報を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (エラー) {
    return (
      <div className=\"max-w-2xl mx-auto space-y-6\">
        <div className=\"flex items-center space-x-4\">
          <button
            onClick={() => navigate(-1)}
            className=\"flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors\"
          >
            <ArrowLeft className=\"h-5 w-5\" />
            <span>戻る</span>
          </button>
        </div>
        
        <div className=\"bg-red-50 border border-red-200 rounded-lg p-6\">
          <div className=\"flex items-center space-x-3\">
            <AlertCircle className=\"h-6 w-6 text-red-600\" />
            <div>
              <h3 className=\"text-lg font-semibold text-red-800\">エラーが発生しました</h3>
              <p className=\"text-red-700 mt-1\">{エラー}</p>
            </div>
          </div>
          <div className=\"mt-4\">
            <button
              onClick={プレイヤー情報取得}
              className=\"bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors\"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  // プレイヤー情報が取得できなかった場合
  if (!プレイヤー) {
    return (
      <div className=\"max-w-2xl mx-auto space-y-6\">
        <div className=\"flex items-center space-x-4\">
          <button
            onClick={() => navigate(-1)}
            className=\"flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors\"
          >
            <ArrowLeft className=\"h-5 w-5\" />
            <span>戻る</span>
          </button>
        </div>
        
        <div className=\"bg-gray-50 rounded-lg p-6 text-center\">
          <p className=\"text-gray-600\">プレイヤー情報が見つかりません</p>
        </div>
      </div>
    );
  }

  // 正常表示
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
        <h1 className=\"text-2xl font-bold text-gray-900\">プレイヤー詳細</h1>
      </div>

      {/* プレイヤー情報カード */}
      <div className=\"bg-white rounded-lg shadow-md p-6\">
        <div className=\"flex items-center space-x-4 mb-6\">
          <div className=\"bg-blue-100 p-3 rounded-full\">
            <User className=\"h-8 w-8 text-blue-600\" />
          </div>
          <div>
            <h2 className=\"text-xl font-semibold text-gray-900\">{プレイヤー.名前}</h2>
            <p className=\"text-gray-600\">プレイヤーID: {プレイヤー.id}</p>
          </div>
        </div>

        <div className=\"space-y-4\">
          {/* 作成日時 */}
          <div className=\"flex items-center space-x-3\">
            <Calendar className=\"h-5 w-5 text-gray-400\" />
            <div>
              <p className=\"text-sm font-medium text-gray-700\">作成日時</p>
              <p className=\"text-gray-900\">{日付フォーマット(プレイヤー.作成日時)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 今後の機能 */}
      <div className=\"bg-gray-50 rounded-lg p-6\">
        <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">今後追加予定の機能</h3>
        <div className=\"space-y-2 text-sm text-gray-600\">
          <p>• 所持モンスター一覧の表示</p>
          <p>• プレイヤーレベルと経験値の管理</p>
          <p>• アチーブメントとバッジの表示</p>
          <p>• プレイヤー統計情報（プレイ時間、捕獲数など）</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 初学者向けメモ：プレイヤー詳細ページの実装ポイント
 * 
 * 1. URLパラメータの取得
 *    - useParams フックを使用
 *    - パラメータの型安全性を確保
 * 
 * 2. データ取得
 *    - useEffect でコンポーネントマウント時に実行
 *    - 依存配列にidを指定してidが変わったときに再実行
 * 
 * 3. 状態管理
 *    - データ、ローディング、エラー状態を分離
 *    - 条件付きレンダリングで適切な表示を切り替え
 * 
 * 4. エラーハンドリング
 *    - 分かりやすいエラーメッセージ
 *    - 再試行機能
 *    - 戻るボタンでユーザビリティを向上
 * 
 * 5. ユーザビリティ
 *    - ローディング状態の表示
 *    - 分かりやすいレイアウト
 *    - 将来の機能拡張を示唆
 */