/**
 * メインアプリケーションコンポーネント
 * ルーティングとグローバルな設定を管理
 */
import { Routes, Route } from 'react-router-dom'
import { StartPage, PlayerCreationPage, MapPage, MonsterListPage } from './pages'

/**
 * アプリケーションのメインコンポーネント
 * 各ページへのルーティングを定義
 */
function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* スタート画面（ゲーム開始・プレイヤー作成） */}
        <Route path="/" element={<StartPage />} />
        
        {/* プレイヤー作成画面（パートナーモンスター選択） */}
        <Route path="/player-creation" element={<PlayerCreationPage />} />
        
        {/* マップ画面（探索・移動・バトル） */}
        <Route path="/map" element={<MapPage />} />
        
        {/* モンスター一覧画面（所持モンスター管理） */}
        <Route path="/monsters" element={<MonsterListPage />} />
        
        {/* 404エラー時はスタート画面にリダイレクト */}
        <Route path="*" element={<StartPage />} />
      </Routes>
    </div>
  )
}

export default App