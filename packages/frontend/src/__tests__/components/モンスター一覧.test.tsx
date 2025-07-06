/**
 * モンスター一覧コンポーネントのテスト
 * 
 * 初学者向けメモ：
 * - Reactコンポーネントの単体テスト
 * - プロップスの渡し方とレンダリング結果の確認
 * - ユーザーインタラクションのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { モンスター一覧 } from '../../components/モンスター一覧';

// テスト用のモックデータ
const モックモンスターデータ = [
  {
    id: 'monster-1',
    ニックネーム: 'ピカチュウ',
    現在hp: 35,
    最大hp: 35,
    取得日時: '2024-01-01',
    種族: {
      id: 'species-1',
      名前: 'でんきネズミ',
      基本hp: 35,
    },
  },
  {
    id: 'monster-2',
    ニックネーム: 'リザードン',
    現在hp: 32,
    最大hp: 40,
    取得日時: '2024-01-02',
    種族: {
      id: 'species-2',
      名前: 'ほのおトカゲ',
      基本hp: 40,
    },
  },
  {
    id: 'monster-3',
    ニックネーム: 'カメックス',
    現在hp: 45,
    最大hp: 45,
    取得日時: '2024-01-03',
    種族: {
      id: 'species-3',
      名前: 'みずガメ',
      基本hp: 45,
    },
  },
];

describe('モンスター一覧コンポーネント', () => {
  /**
   * 基本的なレンダリングテスト
   * 
   * 初学者向けメモ：
   * - コンポーネントが正常にレンダリングされるかを確認
   * - 渡されたプロップスが適切に表示されるかを確認
   */
  it('モンスター一覧が正しく表示される', () => {
    const モック関数 = {
      onニックネーム変更: vi.fn(),
      onモンスター解放: vi.fn(),
    };

    render(
      <モンスター一覧
        モンスター一覧={モックモンスターデータ}
        読み込み中={false}
        onニックネーム変更={モック関数.onニックネーム変更}
        onモンスター解放={モック関数.onモンスター解放}
      />
    );

    // タイトルの確認
    expect(screen.getByText('所持モンスター一覧')).toBeInTheDocument();

    // 各モンスターの表示確認
    expect(screen.getByText('ピカチュウ')).toBeInTheDocument();
    expect(screen.getByText('リザードン')).toBeInTheDocument();
    expect(screen.getByText('カメックス')).toBeInTheDocument();

    // 種族名の表示確認
    expect(screen.getByText('でんきネズミ')).toBeInTheDocument();
    expect(screen.getByText('ほのおトカゲ')).toBeInTheDocument();
    expect(screen.getByText('みずガメ')).toBeInTheDocument();

    // HP表示の確認
    expect(screen.getByText('35/35')).toBeInTheDocument();
    expect(screen.getByText('32/40')).toBeInTheDocument();
    expect(screen.getByText('45/45')).toBeInTheDocument();
  });

  /**
   * 空の状態のテスト
   * 
   * 初学者向けメモ：
   * - データが空の場合の表示確認
   * - 条件分岐による表示の切り替えテスト
   */
  it('モンスターがいない場合の表示', () => {
    const モック関数 = {
      onニックネーム変更: vi.fn(),
      onモンスター解放: vi.fn(),
    };

    render(
      <モンスター一覧
        モンスター一覧={[]}
        読み込み中={false}
        onニックネーム変更={モック関数.onニックネーム変更}
        onモンスター解放={モック関数.onモンスター解放}
      />
    );

    expect(screen.getByText('モンスターを所持していません')).toBeInTheDocument();
    expect(screen.getByText('野生のモンスターを捕まえましょう！')).toBeInTheDocument();
  });

  /**
   * ローディング状態のテスト
   * 
   * 初学者向けメモ：
   * - 非同期処理中の表示確認
   * - ローディングインジケーターの表示テスト
   */
  it('読み込み中の表示', () => {
    const モック関数 = {
      onニックネーム変更: vi.fn(),
      onモンスター解放: vi.fn(),
    };

    render(
      <モンスター一覧
        モンスター一覧={[]}
        読み込み中={true}
        onニックネーム変更={モック関数.onニックネーム変更}
        onモンスター解放={モック関数.onモンスター解放}
      />
    );

    expect(screen.getByText('モンスター情報を読み込み中...')).toBeInTheDocument();
  });

  /**
   * ニックネーム変更機能のテスト
   * 
   * 初学者向けメモ：
   * - ユーザーインタラクション（クリック）のテスト
   * - イベントハンドラーが正しく呼び出されるかの確認
   * - モック関数を使用した動作確認
   */
  it('ニックネーム変更ボタンのクリック', () => {
    const モック関数 = {
      onニックネーム変更: vi.fn(),
      onモンスター解放: vi.fn(),
    };

    render(
      <モンスター一覧
        モンスター一覧={[モックモンスターデータ[0]!]}
        読み込み中={false}
        onニックネーム変更={モック関数.onニックネーム変更}
        onモンスター解放={モック関数.onモンスター解放}
      />
    );

    // ニックネーム変更ボタンをクリック
    const ニックネーム変更ボタン = screen.getByText('ニックネーム変更');
    fireEvent.click(ニックネーム変更ボタン);

    // モック関数が正しい引数で呼び出されたかを確認
    expect(モック関数.onニックネーム変更).toHaveBeenCalledTimes(1);
    expect(モック関数.onニックネーム変更).toHaveBeenCalledWith('monster-1', 'ピカチュウ');
  });

  /**
   * モンスター解放機能のテスト
   * 
   * 初学者向けメモ：
   * - 危険な操作（削除）のテスト
   * - 確認ダイアログなどの考慮（将来実装）
   */
  it('モンスター解放ボタンのクリック', () => {
    const モック関数 = {
      onニックネーム変更: vi.fn(),
      onモンスター解放: vi.fn(),
    };

    render(
      <モンスター一覧
        モンスター一覧={[モックモンスターデータ[1]!]}
        読み込み中={false}
        onニックネーム変更={モック関数.onニックネーム変更}
        onモンスター解放={モック関数.onモンスター解放}
      />
    );

    // 解放ボタンをクリック
    const 解放ボタン = screen.getByText('解放');
    fireEvent.click(解放ボタン);

    // モック関数が正しい引数で呼び出されたかを確認
    expect(モック関数.onモンスター解放).toHaveBeenCalledTimes(1);
    expect(モック関数.onモンスター解放).toHaveBeenCalledWith('monster-2');
  });

  /**
   * HPバーの表示テスト
   * 
   * 初学者向けメモ：
   * - 計算結果の表示確認
   * - CSS クラスやスタイルの確認
   * - 視覚的な要素のテスト
   */
  it('HPバーが正しく表示される', () => {
    const ダメージを受けたモンスター = {
      ...モックモンスターデータ[1]!,
      現在hp: 20, // 40のうち20（50%）
    };

    const モック関数 = {
      onニックネーム変更: vi.fn(),
      onモンスター解放: vi.fn(),
    };

    render(
      <モンスター一覧
        モンスター一覧={[ダメージを受けたモンスター]}
        読み込み中={false}
        onニックネーム変更={モック関数.onニックネーム変更}
        onモンスター解放={モック関数.onモンスター解放}
      />
    );

    // HP表示の確認
    expect(screen.getByText('20/40')).toBeInTheDocument();

    // HPバーの存在確認
    const hpバー = screen.getByRole('progressbar');
    expect(hpバー).toBeInTheDocument();
    expect(hpバー).toHaveAttribute('value', '20');
    expect(hpバー).toHaveAttribute('max', '40');
  });

  /**
   * アクセシビリティテスト
   * 
   * 初学者向けメモ：
   * - スクリーンリーダー対応の確認
   * - ARIA属性の確認
   * - キーボード操作の確認（将来実装）
   */
  it('アクセシビリティ要素が正しく設定されている', () => {
    const モック関数 = {
      onニックネーム変更: vi.fn(),
      onモンスター解放: vi.fn(),
    };

    render(
      <モンスター一覧
        モンスター一覧={[モックモンスターデータ[0]!]}
        読み込み中={false}
        onニックネーム変更={モック関数.onニックネーム変更}
        onモンスター解放={モック関数.onモンスター解放}
      />
    );

    // ボタンのaria-labelの確認
    const ニックネーム変更ボタン = screen.getByRole('button', { name: /ニックネーム変更/ });
    expect(ニックネーム変更ボタン).toBeInTheDocument();

    const 解放ボタン = screen.getByRole('button', { name: /解放/ });
    expect(解放ボタン).toBeInTheDocument();

    // リストのrole確認
    const モンスターリスト = screen.getByRole('list');
    expect(モンスターリスト).toBeInTheDocument();
  });

  /**
   * 複数モンスターの表示順序テスト
   * 
   * 初学者向けメモ：
   * - 配列の順序が保持されているかの確認
   * - ソート機能の基礎テスト（将来実装）
   */
  it('モンスターが正しい順序で表示される', () => {
    const モック関数 = {
      onニックネーム変更: vi.fn(),
      onモンスター解放: vi.fn(),
    };

    render(
      <モンスター一覧
        モンスター一覧={モックモンスターデータ}
        読み込み中={false}
        onニックネーム変更={モック関数.onニックネーム変更}
        onモンスター解放={モック関数.onモンスター解放}
      />
    );

    const モンスターアイテム = screen.getAllByRole('listitem');
    expect(モンスターアイテム).toHaveLength(3);

    // 順序確認（ニックネームで判定）
    expect(モンスターアイテム[0]).toHaveTextContent('ピカチュウ');
    expect(モンスターアイテム[1]).toHaveTextContent('リザードン');
    expect(モンスターアイテム[2]).toHaveTextContent('カメックス');
  });
});

/**
 * 初学者向けメモ：Reactコンポーネントテストのポイント
 * 
 * 1. テストの構造
 *    - describe: テストグループの作成
 *    - it: 個別のテストケース
 *    - expect: アサーション（期待値の確認）
 * 
 * 2. Testing Library の使い方
 *    - render: コンポーネントのレンダリング
 *    - screen: DOM要素の検索
 *    - fireEvent: ユーザーインタラクションのシミュレート
 * 
 * 3. モック（Mock）の活用
 *    - vi.fn(): 関数のモック作成
 *    - toHaveBeenCalledWith: 関数の呼び出し確認
 *    - 外部依存の切り離し
 * 
 * 4. テストケースの設計
 *    - 正常ケース: 期待される動作の確認
 *    - 境界ケース: 空データ、エラー状態
 *    - ユーザビリティ: アクセシビリティ、操作性
 * 
 * 5. 実際のユーザー視点
 *    - ユーザーが見る内容をテスト
 *    - 実装詳細ではなく動作をテスト
 *    - 実際の使用パターンを意識
 */