/**
 * バトルフロー統合テスト
 * マップ画面からバトル画面への遷移を検証
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MapPage } from '../../pages/MapPage';
import { BattlePage } from '../../pages/BattlePage';
import { AuthContext } from '../../contexts/AuthContext';

// モック用の設定
const mockNavigate = vi.fn();
const mockCurrentUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  getIdToken: vi.fn().mockResolvedValue('mock-token')
};

// React Router のモック
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// LocalStorage のモック
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// SessionStorage のモック
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Fetch のモック
global.fetch = vi.fn();

// AuthContext Provider のモック
const mockAuthContextValue = {
  currentUser: mockCurrentUser as any,
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loginWithGoogle: vi.fn(),
  resetPassword: vi.fn(),
  clearError: vi.fn(),
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuthContextValue}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('バトルフロー統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key) => {
      const mockData = {
        player_id: 'test-player-id',
        player_name: 'テストプレイヤー',
        game_state: 'playing',
        selected_monster: JSON.stringify({
          id: 'electric_mouse',
          name: 'でんきネズミ',
          baseHp: 35,
          icon: '⚡'
        })
      };
      return mockData[key as keyof typeof mockData] || null;
    });
  });

  describe('マップ画面での正常なモンスターエンカウント', () => {
    it('プレイヤーモンスターが存在する場合、正常にバトル画面に遷移する', async () => {
      // APIレスポンスのモック
      const mockApiResponse = {
        success: true,
        data: [
          {
            id: 'monster-1',
            speciesId: 'electric_mouse',
            ニックネーム: 'ピカピカ',
            現在hp: 35,
            最大hp: 35,
            種族: {
              名前: 'でんきネズミ'
            }
          }
        ],
        count: 1
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      render(
        <TestWrapper>
          <MapPage />
        </TestWrapper>
      );

      // マップがロードされるまで待機
      await waitFor(() => {
        expect(screen.getByTestId('game-map')).toBeInTheDocument();
      });

      // プレイヤーを移動させてモンスターエンカウントを発生させる
      const gameMap = screen.getByTestId('game-map');
      fireEvent.keyDown(gameMap, { key: 'ArrowRight' });

      // APIが呼ばれることを確認
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/test/players/test-player-id/monsters'
        );
      });

      // バトル初期化データがsessionStorageに保存されることを確認
      await waitFor(() => {
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'battle_init',
          expect.stringContaining('wildMonster')
        );
      });

      // バトル画面に遷移することを確認
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/battle');
      });
    });

    it('プレイヤーモンスターが存在しない場合、エラーメッセージを表示する', async () => {
      // 空のAPIレスポンスのモック
      const mockApiResponse = {
        success: true,
        data: [],
        count: 0
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      render(
        <TestWrapper>
          <MapPage />
        </TestWrapper>
      );

      // マップがロードされるまで待機
      await waitFor(() => {
        expect(screen.getByTestId('game-map')).toBeInTheDocument();
      });

      // プレイヤーを移動させてモンスターエンカウントを発生させる
      const gameMap = screen.getByTestId('game-map');
      fireEvent.keyDown(gameMap, { key: 'ArrowRight' });

      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('使用できるモンスターがいません')).toBeInTheDocument();
      });

      // バトル画面に遷移しないことを確認
      expect(mockNavigate).not.toHaveBeenCalledWith('/battle');
    });
  });

  describe('バトル画面での初期化', () => {
    it('有効なバトル初期化データがある場合、バトル画面を正常に表示する', async () => {
      // バトル初期化データのモック
      const mockBattleInitData = {
        wildMonsterSpeciesId: 'electric_mouse',
        playerMonsterId: 'monster-1',
        wildMonster: {
          speciesId: 'electric_mouse',
          speciesName: 'でんきネズミ',
          currentHp: 35,
          maxHp: 35,
          icon: '⚡'
        },
        playerMonster: {
          id: 'monster-1',
          speciesId: 'electric_mouse',
          speciesName: 'でんきネズミ',
          nickname: 'ピカピカ',
          currentHp: 35,
          maxHp: 35,
          icon: '⚡'
        }
      };

      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'battle_init') {
          return JSON.stringify(mockBattleInitData);
        }
        return null;
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      // バトル画面が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('バトル')).toBeInTheDocument();
      });

      // 野生モンスターとプレイヤーモンスターが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('野生のでんきネズミ')).toBeInTheDocument();
        expect(screen.getByText('ピカピカ')).toBeInTheDocument();
      });

      // アクションボタンが表示されることを確認
      expect(screen.getByText('⚔️ たたかう')).toBeInTheDocument();
      expect(screen.getByText('🎯 つかまえる')).toBeInTheDocument();
      expect(screen.getByText('🏃 にげる')).toBeInTheDocument();
    });

    it('無効なバトル初期化データの場合、マップ画面に戻る', async () => {
      // 無効なバトル初期化データのモック
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'battle_init') {
          return JSON.stringify({
            wildMonsterSpeciesId: 'electric_mouse',
            playerMonsterId: 'monster-1',
            // wildMonster と playerMonster が不足
          });
        }
        return null;
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      // マップ画面に戻ることを確認
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/map');
      });
    });
  });

  describe('ネットワークエラーの処理', () => {
    it('APIエラーが発生した場合、適切にエラーを処理する', async () => {
      // APIエラーのモック
      (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));

      render(
        <TestWrapper>
          <MapPage />
        </TestWrapper>
      );

      // マップがロードされるまで待機
      await waitFor(() => {
        expect(screen.getByTestId('game-map')).toBeInTheDocument();
      });

      // プレイヤーを移動させてモンスターエンカウントを発生させる
      const gameMap = screen.getByTestId('game-map');
      fireEvent.keyDown(gameMap, { key: 'ArrowRight' });

      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('エンカウント処理中にエラーが発生しました')).toBeInTheDocument();
      });

      // バトル画面に遷移しないことを確認
      expect(mockNavigate).not.toHaveBeenCalledWith('/battle');
    });

    it('APIが404エラーを返した場合、適切にエラーを処理する', async () => {
      // 404エラーのモック
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      render(
        <TestWrapper>
          <MapPage />
        </TestWrapper>
      );

      // マップがロードされるまで待機
      await waitFor(() => {
        expect(screen.getByTestId('game-map')).toBeInTheDocument();
      });

      // プレイヤーを移動させてモンスターエンカウントを発生させる
      const gameMap = screen.getByTestId('game-map');
      fireEvent.keyDown(gameMap, { key: 'ArrowRight' });

      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('エンカウント処理中にエラーが発生しました')).toBeInTheDocument();
      });
    });
  });
});