/**
 * フロントエンドアプリケーションのエントリーポイント
 * React + TypeScript による実装
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import './index.css';

/**
 * Reactアプリケーションの初期化と描画
 * 初学者向け解説: HTMLのroot要素にReactアプリをマウント
 */
const ルート要素 = document.getElementById('root');
if (!ルート要素) {
  throw new Error('root要素が見つかりません');
}

const リアクトルート = ReactDOM.createRoot(ルート要素);
リアクトルート.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);