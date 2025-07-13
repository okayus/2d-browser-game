/**
 * メインアプリケーションコンポーネント
 * ルーティングとグローバルな設定を管理
 */
import { Routes, Route } from 'react-router-dom'
import { StartPage, LoginPage, RegisterPage, PlayerCreationPage, MapPage, MonsterListPage } from './pages'
import { PrivateRoute, Header } from './components'

/**
 * アプリケーションのメインコンポーネント
 * 各ページへのルーティングを定義
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* グローバルヘッダー */}
      <Header />
      
      {/* メインコンテンツ */}
      <main>
        <Routes>
          {/* パブリックルート（認証不要） */}
          <Route path="/" element={<StartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* プライベートルート（認証必要） */}
          <Route path="/player-creation" element={
            <PrivateRoute>
              <PlayerCreationPage />
            </PrivateRoute>
          } />
          
          <Route path="/map" element={
            <PrivateRoute>
              <MapPage />
            </PrivateRoute>
          } />
          
          <Route path="/monsters" element={
            <PrivateRoute>
              <MonsterListPage />
            </PrivateRoute>
          } />
          
          {/* 404エラー時はスタート画面にリダイレクト */}
          <Route path="*" element={<StartPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App