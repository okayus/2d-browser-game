/**
 * プレイヤー名管理カスタムフック
 * 
 * 初学者向けメモ:
 * - React の useStateフックを活用
 * - バリデーション機能付き
 * - ローカルストレージでの永続化
 */

import { useState, useEffect } from 'react';

export interface プレイヤー名管理 {
  /** 現在のプレイヤー名 */
  プレイヤー名: string;
  /** プレイヤー名変更関数 */
  setプレイヤー名: (名前: string) => void;
  /** エラーメッセージ */
  エラー: string;
  /** 有効な名前かどうか */
  有効: boolean;
  /** プレイヤー名をクリア */
  クリア: () => void;
}

/**
 * プレイヤー名バリデーション関数
 */
const validateプレイヤー名 = (名前: string): string => {
  if (!名前.trim()) {
    return 'プレイヤー名を入力してください';
  }
  
  if (名前.length < 2) {
    return 'プレイヤー名は2文字以上で入力してください';
  }
  
  if (名前.length > 20) {
    return 'プレイヤー名は20文字以内で入力してください';
  }
  
  // 特殊文字チェック（基本的な文字のみ許可）
  const 許可パターン = /^[a-zA-Z0-9ひらがなカタカナ漢字\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF ]+$/;
  if (!許可パターン.test(名前)) {
    return '使用できない文字が含まれています';
  }
  
  return '';
};

/**
 * プレイヤー名管理フック
 */
export const useプレイヤー名 = (): プレイヤー名管理 => {
  const [プレイヤー名, setプレイヤー名State] = useState<string>('');
  const [エラー, setエラー] = useState<string>('');

  // 初期化時にローカルストレージから復元
  useEffect(() => {
    const 保存済み名前 = localStorage.getItem('プレイヤー名');
    if (保存済み名前) {
      setプレイヤー名State(保存済み名前);
    }
  }, []);

  // プレイヤー名変更処理
  const setプレイヤー名 = (名前: string) => {
    const バリデーションエラー = validateプレイヤー名(名前);
    setエラー(バリデーションエラー);
    setプレイヤー名State(名前);

    // 有効な名前の場合はローカルストレージに保存
    if (!バリデーションエラー && 名前.trim()) {
      localStorage.setItem('プレイヤー名', 名前.trim());
    }
  };

  // プレイヤー名クリア処理
  const クリア = () => {
    setプレイヤー名State('');
    setエラー('');
    localStorage.removeItem('プレイヤー名');
  };

  // 有効性判定
  const 有効 = !エラー && プレイヤー名.trim().length > 0;

  return {
    プレイヤー名,
    setプレイヤー名,
    エラー,
    有効,
    クリア,
  };
};