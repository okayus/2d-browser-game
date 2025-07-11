/**
 * モンスター一覧画面コンポーネント
 * 所持モンスターの管理（表示・編集・削除）
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardHeader, CardContent, CardFooter, Input } from '../components/ui'
import { getGameState, MONSTER_TYPES, validatePlayerName, getStorageData } from '../lib/utils'
import { useMonsters, type OwnedMonster } from '../hooks'

// useMonsters フックから型を取得するため、ここでの型定義は不要

/**
 * モンスター一覧画面のメインコンポーネント
 * MVPのCRUD機能を実装
 */
export function MonsterListPage() {
  const navigate = useNavigate()
  
  // モンスター管理フック
  const { 
    monsters, 
    isLoading, 
    error, 
    loadMonsters, 
    updateNickname, 
    releaseMonster, 
    clearError 
  } = useMonsters()
  
  // 状態管理
  const [playerName, setPlayerName] = useState('')
  const [editingMonster, setEditingMonster] = useState<string | null>(null)
  const [editNickname, setEditNickname] = useState('')
  const [sortBy, setSortBy] = useState<'capturedAt' | 'name' | 'species'>('capturedAt')
  const [filterSpecies, setFilterSpecies] = useState<string>('all')

  /**
   * コンポーネント初期化
   * ゲーム状態を確認し、モンスターデータをロード
   */
  useEffect(() => {
    const gameState = getGameState()
    const storedPlayerId = getStorageData('player_id')
    
    if (!gameState.playerName) {
      navigate('/')
      return
    }
    
    setPlayerName(gameState.playerName)
    
    if (storedPlayerId && typeof storedPlayerId === 'string') {
      // バックエンドからモンスター一覧を取得
      loadMonsters(storedPlayerId)
    } else {
      // プレイヤーIDが無い場合は、サンプルデータを表示
      console.warn('プレイヤーIDが見つかりません。サンプルデータを使用します。')
    }
  }, [navigate, loadMonsters])


  /**
   * モンスターを並び替え・フィルタリング
   */
  const getFilteredAndSortedMonsters = () => {
    let filtered = monsters
    
    // 種族フィルタ
    if (filterSpecies !== 'all') {
      filtered = filtered.filter(monster => monster.speciesId === filterSpecies)
    }
    
    // ソート
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'capturedAt':
          return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
        case 'name': {
          const nameA = a.nickname || a.species.name
          const nameB = b.nickname || b.species.name
          return nameA.localeCompare(nameB)
        }
        case 'species':
          return a.species.name.localeCompare(b.species.name)
        default:
          return 0
      }
    })
  }

  /**
   * ニックネーム編集開始
   */
  const startEditNickname = (monster: OwnedMonster) => {
    setEditingMonster(monster.id)
    setEditNickname(monster.nickname || monster.species.name)
    clearError()
  }

  /**
   * ニックネーム編集キャンセル
   */
  const cancelEditNickname = () => {
    setEditingMonster(null)
    setEditNickname('')
    clearError()
  }

  /**
   * ニックネーム保存
   */
  const saveNickname = async (monsterId: string) => {
    const validation = validatePlayerName(editNickname)
    if (!validation.isValid) {
      // バリデーションエラーは別途表示
      return
    }

    const success = await updateNickname(monsterId, validation.name!)
    
    if (success) {
      setEditingMonster(null)
      setEditNickname('')
    }
  }

  /**
   * モンスター解放処理
   */
  const handleReleaseMonster = async (monster: OwnedMonster) => {
    const displayName = monster.nickname || monster.species.name
    
    if (!confirm(`「${displayName}」を本当に逃がしますか？この操作は取り消せません。`)) {
      return
    }

    await releaseMonster(monster.id)
  }

  /**
   * マップ画面に戻る
   */
  const handleBackToMap = () => {
    navigate('/map')
  }

  /**
   * 日付を見やすい形式でフォーマット
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    
    return date.toLocaleDateString('ja-JP')
  }

  const filteredMonsters = getFilteredAndSortedMonsters()

  return (
    <div className="min-h-screen bg-gradient-game">
      {/* ヘッダー */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎒</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">モンスター一覧</h1>
                <p className="text-sm text-gray-600">{playerName}の所持モンスター</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBackToMap}
              data-testid="back-to-map-button"
            >
              ← マップに戻る
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 message-error animate-slide-up" data-testid="error-message">
            {error}
          </div>
        )}

        {/* フィルター・ソートコントロール */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              
              {/* ソート */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">並び順:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                  data-testid="sort-select"
                >
                  <option value="capturedAt">獲得日時順</option>
                  <option value="name">名前順</option>
                  <option value="species">種族順</option>
                </select>
              </div>

              {/* フィルター */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">種族:</label>
                <select
                  value={filterSpecies}
                  onChange={(e) => setFilterSpecies(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                  data-testid="filter-select"
                >
                  <option value="all">すべて</option>
                  {MONSTER_TYPES.map(species => (
                    <option key={species.id} value={species.id}>
                      {species.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 統計情報 */}
              <div className="ml-auto text-sm text-gray-600" data-testid="monster-count">
                {filteredMonsters.length} / {monsters.length} 体表示中
              </div>
            </div>
          </CardContent>
        </Card>

        {/* モンスター一覧 */}
        {filteredMonsters.length === 0 ? (
          <Card data-testid="empty-state">
            <CardContent className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">🎒</div>
              <h3 className="text-lg font-semibold mb-2">モンスターがいません</h3>
              <p>マップを探索してモンスターを仲間にしよう！</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMonsters.map((monster) => {
              const displayName = monster.nickname || monster.species.name
              const isEditing = editingMonster === monster.id
              
              return (
                <Card key={monster.id} className="monster-card" data-testid={`monster-card-${monster.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{monster.species.icon}</div>
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <Input
                              value={editNickname}
                              onChange={(e) => setEditNickname(e.target.value)}
                              className="text-lg font-bold"
                              maxLength={20}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveNickname(monster.id)
                                } else if (e.key === 'Escape') {
                                  cancelEditNickname()
                                }
                              }}
                              data-testid="edit-nickname-input"
                            />
                          ) : (
                            <h3
                              className="text-lg font-bold text-gray-900 truncate cursor-pointer hover:text-blue-600"
                              onClick={() => startEditNickname(monster)}
                              title="クリックで編集"
                              data-testid={`monster-name-${monster.id}`}
                            >
                              {displayName}
                            </h3>
                          )}
                          <p className="text-sm text-gray-600">
                            {monster.species.name}
                            {monster.nickname && ` (${monster.species.name})`}
                          </p>
                        </div>
                      </div>
                      
                      {/* レア度表示 */}
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        monster.species.rarity === 'rare'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {monster.species.rarity === 'rare' ? 'レア' : '一般'}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* HP表示 */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>HP</span>
                        <span>{monster.currentHp} / {monster.maxHp}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            monster.currentHp / monster.maxHp > 0.6 ? 'bg-green-500' :
                            monster.currentHp / monster.maxHp > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(monster.currentHp / monster.maxHp) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 詳細情報 */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>獲得日:</span>
                        <span>{formatDate(monster.capturedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>基本HP:</span>
                        <span>{monster.species.baseHp}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    {isEditing ? (
                      <div className="flex space-x-2 w-full">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => saveNickname(monster.id)}
                          disabled={isLoading}
                          className="flex-1"
                          data-testid={`save-button-${monster.id}`}
                        >
                          保存
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditNickname}
                          disabled={isLoading}
                          className="flex-1"
                          data-testid={`cancel-button-${monster.id}`}
                        >
                          キャンセル
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2 w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditNickname(monster)}
                          disabled={isLoading}
                          className="flex-1"
                          data-testid={`edit-button-${monster.id}`}
                        >
                          ✏️ 編集
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReleaseMonster(monster)}
                          disabled={isLoading}
                          className="flex-1"
                          data-testid={`release-button-${monster.id}`}
                        >
                          🕊️ 逃がす
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        {/* 学習ポイント */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎓 学習ポイント</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">CRUD操作</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Create</strong>: モンスター獲得（バトル機能で実装予定）</li>
                  <li>• <strong>Read</strong>: モンスター一覧表示・詳細情報</li>
                  <li>• <strong>Update</strong>: ニックネーム変更機能</li>
                  <li>• <strong>Delete</strong>: モンスター解放機能</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">UI/UX機能</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>フィルタリング</strong>: 種族別表示</li>
                  <li>• <strong>ソート</strong>: 複数の並び順対応</li>
                  <li>• <strong>インライン編集</strong>: リアルタイムな編集体験</li>
                  <li>• <strong>確認ダイアログ</strong>: 誤操作防止</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}