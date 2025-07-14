/**
 * 認証状態デバッグツール
 * 
 * 初学者向けメモ：
 * - 開発環境でのみ表示される認証情報デバッグツール
 * - Firebase認証の状態を視覚的に確認可能
 * - コンソールに頼らずに認証状態を確認
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';

/**
 * 認証状態デバッグコンポーネント
 * 
 * 初学者向けメモ：
 * - 画面右下に固定表示される
 * - 開発環境でのみ表示（本番環境では非表示）
 * - Firebase Auth SDKのcurrentUserオブジェクトを直接確認
 */
export const AuthDebugTool: React.FC = () => {
  const { currentUser, loading, error } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);

  // 本番環境では表示しない
  if (import.meta.env.PROD) {
    return null;
  }

  /**
   * IDトークンを取得
   * 
   * 初学者向けメモ：
   * - Firebase IDトークンはAPIリクエストで使用される
   * - トークンの有効期限は1時間
   */
  const fetchIdToken = async () => {
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        setIdToken(token);
      } catch (error) {
        console.error('IDトークン取得エラー:', error);
        setIdToken('エラー: トークン取得失敗');
      }
    }
  };

  /**
   * グローバルにFirebase Authを公開（デバッグ用）
   * 
   * 初学者向けメモ：
   * - コンソールでwindow.firebaseAuthにアクセス可能
   * - 開発時のデバッグに便利
   */
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).firebaseAuth = auth;
      (window as any).currentUser = currentUser;
      console.log('🔧 デバッグ用: window.firebaseAuth と window.currentUser が利用可能です');
    }
  }, [currentUser]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* トグルボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white rounded-full p-3 shadow-lg hover:bg-gray-700 transition-colors"
        title="認証デバッグツール"
      >
        🔐
      </button>

      {/* デバッグ情報パネル */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-[600px] overflow-y-auto">
          <h3 className="font-bold text-lg mb-4">認証デバッグ情報</h3>
          
          {/* ローディング状態 */}
          <div className="mb-3">
            <span className="font-semibold">認証状態:</span>{' '}
            <span className={loading ? 'text-yellow-600' : currentUser ? 'text-green-600' : 'text-red-600'}>
              {loading ? 'ローディング中...' : currentUser ? '認証済み' : '未認証'}
            </span>
          </div>

          {/* エラー情報 */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
              <span className="font-semibold text-red-700">エラー:</span>{' '}
              <span className="text-red-600">{error}</span>
            </div>
          )}

          {/* ユーザー情報 */}
          {currentUser && (
            <div className="space-y-2">
              <div className="border-t pt-3">
                <h4 className="font-semibold mb-2">ユーザー情報:</h4>
                <div className="text-sm space-y-1">
                  <div><strong>UID:</strong> {currentUser.uid}</div>
                  <div><strong>Email:</strong> {currentUser.email || '未設定'}</div>
                  <div><strong>Email確認:</strong> {currentUser.emailVerified ? '✅' : '❌'}</div>
                  <div><strong>表示名:</strong> {currentUser.displayName || '未設定'}</div>
                  <div><strong>プロバイダー:</strong> {currentUser.providerData[0]?.providerId || '不明'}</div>
                </div>
              </div>

              {/* IDトークン情報 */}
              <div className="border-t pt-3">
                <h4 className="font-semibold mb-2">IDトークン:</h4>
                <button
                  onClick={fetchIdToken}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  トークン取得
                </button>
                {idToken && (
                  <div className="mt-2">
                    <textarea
                      value={idToken}
                      readOnly
                      className="w-full h-20 text-xs font-mono bg-gray-100 p-2 rounded border"
                      onClick={(e) => {
                        e.currentTarget.select();
                        navigator.clipboard.writeText(idToken);
                        alert('トークンをクリップボードにコピーしました');
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      クリックしてコピー（APIテスト用）
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* コンソールコマンド */}
          <div className="border-t pt-3 mt-3">
            <h4 className="font-semibold mb-2">デバッグコマンド:</h4>
            <div className="text-xs font-mono bg-gray-100 p-2 rounded">
              <div>// 現在のユーザー確認</div>
              <div>window.currentUser</div>
              <div className="mt-2">// Firebase Auth確認</div>
              <div>window.firebaseAuth.currentUser</div>
              <div className="mt-2">// ログアウト</div>
              <div>window.firebaseAuth.signOut()</div>
            </div>
          </div>

          {/* 閉じるボタン */}
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * 初学者向けメモ：デバッグツールの活用方法
 * 
 * 1. 認証状態の確認
 *    - 画面右下の🔐ボタンをクリック
 *    - 現在のユーザー情報を視覚的に確認
 * 
 * 2. IDトークンの取得
 *    - APIテスト時に必要なトークンを簡単に取得
 *    - クリックでコピー可能
 * 
 * 3. コンソールデバッグ
 *    - window.currentUser でユーザー情報にアクセス
 *    - window.firebaseAuth でFirebase Authインスタンスにアクセス
 * 
 * 4. 本番環境での非表示
 *    - import.meta.env.PROD で本番環境を判定
 *    - 開発環境でのみ表示される
 */