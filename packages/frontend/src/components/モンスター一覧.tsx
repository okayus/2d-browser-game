/**
 * モンスター一覧コンポーネント
 * 
 * 初学者向けメモ：
 * - プレイヤーが所持するモンスターの一覧表示
 * - ニックネーム変更と解放機能を提供
 * - レスポンシブデザインに対応
 */

import React from 'react';

/**
 * モンスター情報の型定義
 * 
 * 初学者向けメモ：
 * - APIレスポンスと同じ構造を定義
 * - TypeScriptの型安全性を活用
 */
export interface モンスター情報 {
  id: string;
  ニックネーム: string;
  現在hp: number;
  最大hp: number;
  取得日時: string;
  種族: {
    id: string;
    名前: string;
    基本hp: number;
  };
}

/**
 * コンポーネントのプロパティ型定義
 * 
 * 初学者向けメモ：
 * - 親コンポーネントから受け取るプロパティを定義
 * - イベントハンドラーの型も明確に定義
 */
export interface モンスター一覧Props {
  モンスター一覧: モンスター情報[];
  読み込み中: boolean;
  onニックネーム変更: (モンスターId: string, 現在のニックネーム: string) => void;
  onモンスター解放: (モンスターId: string) => void;
}

/**
 * HPバーコンポーネント
 * 
 * 初学者向けメモ：
 * - HPの視覚的表示を担当
 * - プログレスバーとパーセンテージ表示
 */
const HPバー: React.FC<{ 現在hp: number; 最大hp: number }> = ({ 現在hp, 最大hp }) => {
  const hpパーセンテージ = Math.round((現在hp / 最大hp) * 100);
  
  // HPの状態に応じた色の決定
  const バーの色 = hpパーセンテージ > 60 ? 'green' : hpパーセンテージ > 30 ? 'yellow' : 'red';

  return (
    <div className="hp-bar-container">
      <div className="hp-text">
        {現在hp}/{最大hp} ({hpパーセンテージ}%)
      </div>
      <progress
        className={`hp-bar hp-bar--${バーの色}`}
        value={現在hp}
        max={最大hp}
        aria-label={`HP: ${現在hp}/${最大hp}`}
      >
        {hpパーセンテージ}%
      </progress>
    </div>
  );
};

/**
 * 個別モンスターカードコンポーネント
 * 
 * 初学者向けメモ：
 * - 1体のモンスター情報を表示
 * - 操作ボタン（ニックネーム変更、解放）を含む
 */
const モンスターカード: React.FC<{
  モンスター: モンスター情報;
  onニックネーム変更: (モンスターId: string, 現在のニックネーム: string) => void;
  onモンスター解放: (モンスターId: string) => void;
}> = ({ モンスター, onニックネーム変更, onモンスター解放 }) => {
  return (
    <li className="monster-card" role="listitem">
      <div className="monster-info">
        <div className="monster-header">
          <h3 className="monster-nickname">{モンスター.ニックネーム}</h3>
          <span className="monster-species">({モンスター.種族.名前})</span>
        </div>
        
        <HPバー 現在hp={モンスター.現在hp} 最大hp={モンスター.最大hp} />
        
        <div className="monster-meta">
          <time className="capture-date">
            捕獲日: {new Date(モンスター.取得日時).toLocaleDateString('ja-JP')}
          </time>
        </div>
      </div>
      
      <div className="monster-actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => onニックネーム変更(モンスター.id, モンスター.ニックネーム)}
          aria-label={`${モンスター.ニックネーム}のニックネームを変更`}
        >
          ニックネーム変更
        </button>
        
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => onモンスター解放(モンスター.id)}
          aria-label={`${モンスター.ニックネーム}を解放する`}
        >
          解放
        </button>
      </div>
    </li>
  );
};

/**
 * ローディング表示コンポーネント
 * 
 * 初学者向けメモ：
 * - データ読み込み中の表示を担当
 * - スピナーやプレースホルダーを表示
 */
const ローディング表示: React.FC = () => (
  <div className="loading-container" role="status" aria-live="polite">
    <div className="loading-spinner" aria-hidden="true"></div>
    <p className="loading-text">モンスター情報を読み込み中...</p>
  </div>
);

/**
 * 空の状態表示コンポーネント
 * 
 * 初学者向けメモ：
 * - モンスターが0体の場合の表示
 * - ユーザーの次のアクションを促す
 */
const 空の状態表示: React.FC = () => (
  <div className="empty-state" role="status">
    <div className="empty-state-icon" aria-hidden="true">🐾</div>
    <h3 className="empty-state-title">モンスターを所持していません</h3>
    <p className="empty-state-description">
      野生のモンスターを捕まえましょう！
    </p>
  </div>
);

/**
 * メインのモンスター一覧コンポーネント
 * 
 * 初学者向けメモ：
 * - 状態に応じた表示の切り替え
 * - アクセシビリティ対応
 * - 再利用可能なコンポーネント設計
 */
export const モンスター一覧: React.FC<モンスター一覧Props> = ({
  モンスター一覧,
  読み込み中,
  onニックネーム変更,
  onモンスター解放,
}) => {
  // ローディング中の表示
  if (読み込み中) {
    return (
      <section className="monster-list-section">
        <h2 className="section-title">所持モンスター一覧</h2>
        <ローディング表示 />
      </section>
    );
  }

  // モンスターが0体の場合の表示
  if (モンスター一覧.length === 0) {
    return (
      <section className="monster-list-section">
        <h2 className="section-title">所持モンスター一覧</h2>
        <空の状態表示 />
      </section>
    );
  }

  // 通常の一覧表示
  return (
    <section className="monster-list-section">
      <header className="section-header">
        <h2 className="section-title">所持モンスター一覧</h2>
        <div className="monster-count" role="status">
          {モンスター一覧.length}体のモンスターを所持
        </div>
      </header>
      
      <ul className="monster-list" role="list">
        {モンスター一覧.map((モンスター) => (
          <モンスターカード
            key={モンスター.id}
            モンスター={モンスター}
            onニックネーム変更={onニックネーム変更}
            onモンスター解放={onモンスター解放}
          />
        ))}
      </ul>
    </section>
  );
};

/**
 * 初学者向けメモ：コンポーネント設計のポイント
 * 
 * 1. 単一責任の原則
 *    - 各コンポーネントは1つの責任を持つ
 *    - HPバー、モンスターカード、メインコンポーネントに分離
 * 
 * 2. プロパティ設計
 *    - TypeScriptの型定義で安全性を確保
 *    - イベントハンドラーは親から受け取る
 *    - データと表示ロジックを分離
 * 
 * 3. アクセシビリティ
 *    - semantic HTMLの使用
 *    - ARIA属性の適切な設定
 *    - スクリーンリーダー対応
 * 
 * 4. 状態管理
 *    - loading, empty, normal state の適切な処理
 *    - ユーザビリティを考慮した表示切り替え
 * 
 * 5. 再利用性
 *    - プロパティベースの設計
 *    - スタイルとロジックの分離
 *    - テストしやすい構造
 */