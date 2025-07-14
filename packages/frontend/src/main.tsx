/**
 * メインエントリーポイント
 * React アプリケーションを DOM にマウントする
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './styles/index.css'

/**
 * アプリケーションのルート要素を取得
 * HTMLの#rootにReactアプリをマウント
 */
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

/**
 * React 18のcreateRoot APIを使用してアプリを起動
 * AuthProviderで認証機能を提供し、BrowserRouterでルーティング機能を有効化
 */
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)