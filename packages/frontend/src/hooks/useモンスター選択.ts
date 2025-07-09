/**
 * モンスター選択管理カスタムフック
 * 
 * 初学者向けメモ:
 * - モンスター選択状態の管理
 * - 選択したモンスターの保存・復元
 * - バリデーション機能
 */

import { useState, useEffect } from 'react';
import { スターターモンスター } from '../types/モンスター';

export interface モンスター選択管理 {
  /** 選択中のモンスター */
  選択モンスター: スターターモンスター | null;
  /** モンスター選択関数 */
  モンスター選択: (モンスター: スターターモンスター) => void;
  /** 選択クリア関数 */
  選択クリア: () => void;
  /** 選択済みかどうか */
  選択済み: boolean;
  /** 特定のモンスターが選択されているかチェック */
  is選択中: (モンスターId: string) => boolean;
}

/**
 * モンスター選択管理フック
 */
export const useモンスター選択 = (): モンスター選択管理 => {
  const [選択モンスター, set選択モンスター] = useState<スターターモンスター | null>(null);

  // 初期化時にローカルストレージから復元
  useEffect(() => {
    const 保存済みモンスター = localStorage.getItem('選択モンスター');
    if (保存済みモンスター) {
      try {
        const パースされたモンスター = JSON.parse(保存済みモンスター);
        set選択モンスター(パースされたモンスター);
      } catch (error) {
        console.warn('保存されたモンスターデータの復元に失敗:', error);
        localStorage.removeItem('選択モンスター');
      }
    }
  }, []);

  // モンスター選択処理
  const モンスター選択 = (モンスター: スターターモンスター) => {
    set選択モンスター(モンスター);
    
    // ローカルストレージに保存
    try {
      localStorage.setItem('選択モンスター', JSON.stringify(モンスター));
      console.log(`モンスター選択: ${モンスター.名前} (${モンスター.種類})`);
    } catch (error) {
      console.error('モンスターデータの保存に失敗:', error);
    }
  };

  // 選択クリア処理
  const 選択クリア = () => {
    set選択モンスター(null);
    localStorage.removeItem('選択モンスター');
    console.log('モンスター選択をクリアしました');
  };

  // 選択済みかどうか
  const 選択済み = 選択モンスター !== null;

  // 特定のモンスターが選択されているかチェック
  const is選択中 = (モンスターId: string): boolean => {
    return 選択モンスター?.id === モンスターId;
  };

  return {
    選択モンスター,
    モンスター選択,
    選択クリア,
    選択済み,
    is選択中,
  };
};