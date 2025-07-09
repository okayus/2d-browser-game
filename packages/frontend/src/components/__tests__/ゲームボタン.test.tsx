/**
 * ゲームボタンコンポーネントのテスト
 * 
 * 初学者向けメモ:
 * - TDD (Test-Driven Development) の実践
 * - まずテストを書いて、実装は後で行う
 * - Testing Library を使用したReactコンポーネントテスト
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ゲームボタン } from '../ゲームボタン';

describe('ゲームボタン', () => {
  test('ボタンテキストが正しく表示される', () => {
    // Arrange: テストデータの準備
    const テストテキスト = 'ゲーム開始';
    
    // Act: コンポーネントをレンダリング
    render(<ゲームボタン>{テストテキスト}</ゲームボタン>);
    
    // Assert: 期待する結果の確認
    expect(screen.getByRole('button', { name: テストテキスト })).toBeInTheDocument();
  });

  test('クリック時にonClickハンドラーが呼ばれる', async () => {
    // Arrange: モック関数の準備
    const クリック処理 = vi.fn();
    const user = userEvent.setup();
    
    // Act: コンポーネントをレンダリングしてクリック
    render(<ゲームボタン onClick={クリック処理}>クリックテスト</ゲームボタン>);
    const ボタン = screen.getByRole('button', { name: 'クリックテスト' });
    await user.click(ボタン);
    
    // Assert: クリック処理が1回呼ばれることを確認
    expect(クリック処理).toHaveBeenCalledTimes(1);
  });

  test('disabled状態の時はクリックできない', async () => {
    // Arrange: 無効化されたボタンの準備
    const クリック処理 = vi.fn();
    const user = userEvent.setup();
    
    // Act: 無効化されたボタンをレンダリング
    render(
      <ゲームボタン onClick={クリック処理} disabled>
        無効ボタン
      </ゲームボタン>
    );
    const ボタン = screen.getByRole('button', { name: '無効ボタン' });
    await user.click(ボタン);
    
    // Assert: ボタンが無効化されており、クリック処理が呼ばれないことを確認
    expect(ボタン).toBeDisabled();
    expect(クリック処理).not.toHaveBeenCalled();
  });

  test('loading状態の時はローディング表示される', () => {
    // Arrange: ローディング状態のボタン
    render(
      <ゲームボタン loading>
        読み込み中
      </ゲームボタン>
    );
    
    // Assert: ローディング表示があることを確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  test('variantプロパティで適切なスタイルが適用される', () => {
    // Arrange: 異なるvariantのテスト
    const { rerender } = render(<ゲームボタン variant="primary">プライマリ</ゲームボタン>);
    
    // Assert: プライマリボタンのスタイルクラスが適用されることを確認
    let ボタン = screen.getByRole('button', { name: 'プライマリ' });
    expect(ボタン).toHaveClass('bg-game-primary');
    
    // Act: secondaryボタンに変更
    rerender(<ゲームボタン variant="secondary">セカンダリ</ゲームボタン>);
    
    // Assert: セカンダリボタンのスタイルが適用されることを確認
    ボタン = screen.getByRole('button', { name: 'セカンダリ' });
    expect(ボタン).toHaveClass('bg-secondary');
  });

  test('sizeプロパティで適切なサイズが適用される', () => {
    // Arrange: 異なるサイズのテスト
    render(<ゲームボタン size="lg">大きいボタン</ゲームボタン>);
    
    // Assert: 大きいサイズのクラスが適用されることを確認
    const ボタン = screen.getByRole('button', { name: '大きいボタン' });
    expect(ボタン).toHaveClass('h-11', 'px-8');
  });

  test('キーボードナビゲーション対応（Enterキー）', async () => {
    // Arrange: キーボード操作のテスト準備
    const クリック処理 = vi.fn();
    const user = userEvent.setup();
    
    // Act: ボタンにフォーカスしてEnterキーを押す
    render(<ゲームボタン onClick={クリック処理}>キーボードテスト</ゲームボタン>);
    const ボタン = screen.getByRole('button', { name: 'キーボードテスト' });
    ボタン.focus();
    await user.keyboard('{Enter}');
    
    // Assert: Enterキーでクリック処理が呼ばれることを確認
    expect(クリック処理).toHaveBeenCalledTimes(1);
  });

  test('アクセシビリティ: aria-label が適切に設定される', () => {
    // Arrange: アクセシビリティテスト
    render(
      <ゲームボタン aria-label="ゲーム開始ボタン">
        🎮
      </ゲームボタン>
    );
    
    // Assert: aria-labelが正しく設定されることを確認
    const ボタン = screen.getByRole('button', { name: 'ゲーム開始ボタン' });
    expect(ボタン).toHaveAttribute('aria-label', 'ゲーム開始ボタン');
  });
});