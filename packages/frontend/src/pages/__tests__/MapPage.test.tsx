/**
 * MapPageコンポーネントのユニットテスト
 * API統合と草タイルエンカウント機能のテスト
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { MapPage } from '../MapPage'

// モック設定
const mockNavigate = vi.fn()
const mockGetPlayer = vi.fn()
const mockLoadMonsters = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../hooks/usePlayer', () => ({
  usePlayer: () => ({
    player: {
      id: 'test-player-id',
      name: 'テストプレイヤー',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    getPlayer: mockGetPlayer,
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../../hooks/useMonsters', () => ({
  useMonsters: () => ({
    monsters: [],
    loadMonsters: mockLoadMonsters,
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../../lib/utils', async () => {
  const actual = await vi.importActual('../../lib/utils')
  return {
    ...actual,
    getGameState: () => ({
      playerName: 'テストプレイヤー',
      selectedMonster: {
        id: 'flame-beast',
        name: 'フレイムビースト',
        type: 'fire',
        imageUrl: '/images/monsters/flame-beast.png',
        description: '炎タイプのモンスター',
        baseStats: { hp: 100, attack: 20, defense: 15 }
      },
      playerPosition: { x: 5, y: 5 }
    }),
    updateGameState: vi.fn(),
    getStorageData: () => null,
    MAP_CONFIG: {
      width: 10,
      height: 10,
      startPosition: { x: 5, y: 5 }
    },
    MONSTER_TYPES: []
  }
})

// GameMapコンポーネントのモック
vi.mock('../../components/game', () => ({
  GameMap: ({ onPlayerMove }: { onPlayerMove: (pos: { x: number; y: number }, tile: { type: string; name: string }) => void }) => (
    <div data-testid="game-map">
      <button
        onClick={() => onPlayerMove({ x: 6, y: 5 }, { type: 'grass', name: '草原' })}
        data-testid="move-to-grass"
      >
        草原に移動
      </button>
      <button
        onClick={() => onPlayerMove({ x: 7, y: 5 }, { type: 'town', name: '街' })}
        data-testid="move-to-town"
      >
        街に移動
      </button>
    </div>
  ),
  PlayerPanel: ({ player }: { player: any }) => (
    <div data-testid="mocked-player-panel">
      プレイヤー: {player.name}
    </div>
  )
}))

const renderMapPage = () => {
  return render(
    <BrowserRouter>
      <MapPage />
    </BrowserRouter>
  )
}

describe('MapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPlayer.mockResolvedValue(null)
    mockLoadMonsters.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('基本的なレンダリング', () => {
    it('マップページが正常にレンダリングされる', async () => {
      renderMapPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('game-map')).toBeInTheDocument()
        expect(screen.getByTestId('player-panel')).toBeInTheDocument()
        expect(screen.getByText('🗺️ ワールドマップ')).toBeInTheDocument()
      })
    })

    it('プレイヤー情報が表示される', async () => {
      renderMapPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('mocked-player-panel')).toBeInTheDocument()
        expect(screen.getByText('プレイヤー: テストプレイヤー')).toBeInTheDocument()
      })
    })

    it('メッセージエリアが表示される', async () => {
      renderMapPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('message-area')).toBeInTheDocument()
        expect(screen.getByText('📝 メッセージ')).toBeInTheDocument()
      })
    })
  })

  describe('プレイヤー移動機能', () => {
    it('草原への移動でメッセージが追加される', async () => {
      renderMapPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('move-to-grass')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('move-to-grass'))
      
      await waitFor(() => {
        expect(screen.getByText(/座標.*草原に移動しました/)).toBeInTheDocument()
      })
    })

    it('街への移動でメッセージが追加される', async () => {
      renderMapPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('move-to-town')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('move-to-town'))
      
      await waitFor(() => {
        expect(screen.getByText(/座標.*街に移動しました/)).toBeInTheDocument()
      })
    })
  })

  describe('草タイルエンカウント機能', () => {
    it('草原移動時にエンカウントが発生する可能性がある', async () => {
      // エンカウントが確実に発生するようにMath.randomをモック
      const randomSpy = vi.spyOn(Math, 'random')
      randomSpy.mockReturnValue(0.1) // 20%未満でエンカウント発生
      
      renderMapPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('move-to-grass')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('move-to-grass'))
      
      await waitFor(() => {
        expect(screen.getByText(/草むらで何かが動いた/)).toBeInTheDocument()
        expect(screen.getByText(/野生のフレイムビーストが現れた/)).toBeInTheDocument()
      })

      // バトル画面への遷移を確認
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/battle')
      }, { timeout: 2000 })
      
      randomSpy.mockRestore()
    })

    it('草原移動時にエンカウントが発生しない場合がある', async () => {
      // エンカウントが発生しないようにMath.randomをモック
      const randomSpy = vi.spyOn(Math, 'random')
      randomSpy.mockReturnValue(0.5) // 20%以上でエンカウント発生せず
      
      renderMapPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('move-to-grass')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('move-to-grass'))
      
      await waitFor(() => {
        expect(screen.getByText(/座標.*草原に移動しました/)).toBeInTheDocument()
      })

      // エンカウントメッセージが表示されないことを確認
      expect(screen.queryByText(/草むらで何かが動いた/)).not.toBeInTheDocument()
      expect(screen.queryByText(/野生のフレイムビーストが現れた/)).not.toBeInTheDocument()
      
      randomSpy.mockRestore()
    })

    it('草原以外のタイルではエンカウントが発生しない', async () => {
      // エンカウントが確実に発生する確率でも草原以外では発生しない
      const randomSpy = vi.spyOn(Math, 'random')
      randomSpy.mockReturnValue(0.1)
      
      renderMapPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('move-to-town')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('move-to-town'))
      
      await waitFor(() => {
        expect(screen.getByText(/座標.*街に移動しました/)).toBeInTheDocument()
      })

      // エンカウントメッセージが表示されないことを確認
      expect(screen.queryByText(/草むらで何かが動いた/)).not.toBeInTheDocument()
      expect(screen.queryByText(/野生のフレイムビーストが現れた/)).not.toBeInTheDocument()
      
      randomSpy.mockRestore()
    })
  })

  describe('ナビゲーション機能', () => {
    it('モンスター一覧ボタンが機能する', async () => {
      renderMapPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('open-monster-list-button')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('open-monster-list-button'))
      
      expect(mockNavigate).toHaveBeenCalledWith('/monsters')
    })

    it('プレイヤー作成に戻るボタンが機能する', async () => {
      // confirmをモック
      const confirmSpy = vi.spyOn(window, 'confirm')
      confirmSpy.mockReturnValue(true)
      
      renderMapPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('back-to-creation-button')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('back-to-creation-button'))
      
      expect(mockNavigate).toHaveBeenCalledWith('/player-creation')
      
      confirmSpy.mockRestore()
    })
  })

  describe('API統合', () => {
    it('ゲーム初期化が完了する', async () => {
      const mockPlayer = {
        id: 'test-player-id',
        name: 'APIプレイヤー',
        createdAt: '2024-01-01T00:00:00Z'
      }
      
      mockGetPlayer.mockResolvedValue(mockPlayer)
      
      renderMapPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('game-map')).toBeInTheDocument()
      })
    })
  })
})