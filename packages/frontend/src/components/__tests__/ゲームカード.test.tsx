/**
 * ゲームカードコンポーネントのテスト
 * 
 * 初学者向けメモ:
 * - TDD の Red段階: まずテストを書く
 * - Card は情報のグループ化とレイアウト統一に使用
 * - プレイヤー情報、モンスター選択、ゲーム説明等で活用
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ゲームカード } from '../ゲームカード';

describe('ゲームカード', () => {
  test('子要素が正しく表示される', () => {
    // Arrange: テストコンテンツの準備
    const テストコンテンツ = 'カード内のテスト内容';
    
    // Act: コンポーネントをレンダリング
    render(<ゲームカード>{テストコンテンツ}</ゲームカード>);
    
    // Assert: コンテンツが表示されることを確認
    expect(screen.getByText(テストコンテンツ)).toBeInTheDocument();
  });

  test('interactive variant の時はクリック可能', async () => {
    // Arrange: クリック可能なカードの準備
    const クリック処理 = vi.fn();
    const user = userEvent.setup();
    
    // Act: interactive カードをレンダリングしてクリック
    render(
      <ゲームカード variant="interactive" onClick={クリック処理}>
        クリック可能カード
      </ゲームカード>
    );
    const カード = screen.getByText('クリック可能カード').closest('div');
    await user.click(カード!);
    
    // Assert: クリック処理が呼ばれることを確認
    expect(クリック処理).toHaveBeenCalledTimes(1);
  });

  test('selected状態が視覚的に表現される', () => {
    // Arrange: 選択状態のカード
    render(
      <ゲームカード selected>
        選択されたカード
      </ゲームカード>
    );
    
    // Assert: 選択状態のスタイルクラスが適用されることを確認
    const カード = screen.getByText('選択されたカード').closest('div');
    expect(カード).toHaveClass('ring-2', 'ring-primary');
  });

  test('variant プロパティで適切なスタイルが適用される', () => {
    // Arrange: 異なるvariantのテスト
    const { rerender } = render(<ゲームカード variant="outlined">アウトラインカード</ゲームカード>);
    
    // Assert: アウトラインスタイルが適用されることを確認
    let カード = screen.getByText('アウトラインカード').closest('div');
    expect(カード).toHaveClass('border-2');
    
    // Act: elevated カードに変更
    rerender(<ゲームカード variant="elevated">立体カード</ゲームカード>);
    
    // Assert: 立体効果スタイルが適用されることを確認
    カード = screen.getByText('立体カード').closest('div');
    expect(カード).toHaveClass('shadow-lg');
  });

  test('padding プロパティでサイズが調整される', () => {
    // Arrange: 異なるパディングのテスト
    render(<ゲームカード padding="lg">大きいパディング</ゲームカード>);
    
    // Assert: 大きいパディングのクラスが適用されることを確認
    const カード = screen.getByText('大きいパディング').closest('div');
    expect(カード).toHaveClass('p-6');
  });

  test('Header, Content, Actions の Compound Component が動作する', () => {
    // Arrange: 複合コンポーネントのテスト
    render(
      <ゲームカード>
        <ゲームカード.Header>
          <h2>カードタイトル</h2>
        </ゲームカード.Header>
        <ゲームカード.Content>
          <p>カード本文</p>
        </ゲームカード.Content>
        <ゲームカード.Actions>
          <button>アクション</button>
        </ゲームカード.Actions>
      </ゲームカード>
    );
    
    // Assert: 各セクションが正しく表示されることを確認
    expect(screen.getByText('カードタイトル')).toBeInTheDocument();
    expect(screen.getByText('カード本文')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'アクション' })).toBeInTheDocument();
  });

  test('キーボードナビゲーション対応（interactive時）', async () => {
    // Arrange: キーボード操作可能なカード
    const クリック処理 = vi.fn();
    const user = userEvent.setup();
    
    // Act: フォーカスしてEnterキーを押す
    render(
      <ゲームカード variant="interactive" onClick={クリック処理}>
        キーボードテスト
      </ゲームカード>
    );
    const カード = screen.getByText('キーボードテスト').closest('div');
    カード!.focus();
    await user.keyboard('{Enter}');
    
    // Assert: Enterキーでクリック処理が呼ばれることを確認
    expect(クリック処理).toHaveBeenCalledTimes(1);
  });

  test('アクセシビリティ: role属性が適切に設定される', () => {
    // Arrange: interactive カードのアクセシビリティテスト（onClickが必要）
    const クリック処理 = vi.fn();
    render(
      <ゲームカード variant="interactive" onClick={クリック処理}>
        アクセシブルカード
      </ゲームカード>
    );
    
    // Assert: button roleが設定されることを確認
    const カード = screen.getByRole('button');
    expect(カード).toHaveAttribute('tabIndex', '0');
  });

  test('ホバー効果が interactive variant で適用される', () => {
    // Arrange: ホバー可能なカード
    render(
      <ゲームカード variant="interactive">
        ホバーテスト
      </ゲームカード>
    );
    
    // Assert: ホバー効果のクラスが適用されることを確認
    const カード = screen.getByText('ホバーテスト').closest('div');
    expect(カード).toHaveClass('hover:shadow-lg', 'transition-all');
  });

  test('非 interactive カードはクリックイベントを持たない', () => {
    // Arrange: 通常のカード（非interactive）
    const クリック処理 = vi.fn();
    
    render(
      <ゲームカード onClick={クリック処理}>
        通常カード
      </ゲームカード>
    );
    
    // Assert: クリック可能な要素として認識されないことを確認
    const カード = screen.getByText('通常カード').closest('div');
    expect(カード).not.toHaveAttribute('role', 'button');
    expect(カード).not.toHaveAttribute('tabIndex');
  });
});