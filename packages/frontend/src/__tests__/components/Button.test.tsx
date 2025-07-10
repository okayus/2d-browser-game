/**
 * Buttonコンポーネントのテスト
 * 初学者向け: Reactコンポーネントのテスト基本パターン
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/common/Button';

describe('Button コンポーネント', () => {
  // 初学者向けメモ：
  // 基本的な表示テスト
  it('テキストが正しく表示される', () => {
    render(<Button>クリックしてください</Button>);
    
    // getByTextでボタンのテキストを確認
    expect(screen.getByText('クリックしてください')).toBeInTheDocument();
  });

  // 初学者向けメモ：
  // クリックイベントのテスト
  it('クリックイベントが正しく発火する', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn(); // モック関数を作成
    
    render(
      <Button onClick={handleClick}>
        クリック
      </Button>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // モック関数が1回呼ばれたことを確認
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // 初学者向けメモ：
  // 無効化状態のテスト
  it('disabledプロパティが正しく動作する', () => {
    const handleClick = vi.fn();
    
    render(
      <Button disabled onClick={handleClick}>
        無効なボタン
      </Button>
    );
    
    const button = screen.getByRole('button');
    
    // ボタンが無効化されていることを確認
    expect(button).toBeDisabled();
    
    // 無効化されたボタンをクリックしても関数が呼ばれないことを確認
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // 初学者向けメモ：
  // バリアント（見た目の種類）のテスト
  it('variant="primary"のクラスが適用される', () => {
    render(<Button variant="primary">プライマリボタン</Button>);
    
    const button = screen.getByRole('button');
    
    // Tailwindのプライマリカラークラスが含まれることを確認
    expect(button.className).toMatch(/bg-blue-600/);
  });

  it('variant="secondary"のクラスが適用される', () => {
    render(<Button variant="secondary">セカンダリボタン</Button>);
    
    const button = screen.getByRole('button');
    
    // セカンダリカラークラスが含まれることを確認
    expect(button.className).toMatch(/bg-gray-600/);
  });

  it('variant="destructive"のクラスが適用される', () => {
    render(<Button variant="destructive">削除ボタン</Button>);
    
    const button = screen.getByRole('button');
    
    // 危険なアクション用の赤いクラスが含まれることを確認
    expect(button.className).toMatch(/bg-red-600/);
  });

  // 初学者向けメモ：
  // サイズのテスト
  it('size="sm"のクラスが適用される', () => {
    render(<Button size="sm">小さいボタン</Button>);
    
    const button = screen.getByRole('button');
    
    // 小さいサイズのパディングクラスが含まれることを確認
    expect(button.className).toMatch(/px-3.*py-1/);
  });

  it('size="lg"のクラスが適用される', () => {
    render(<Button size="lg">大きいボタン</Button>);
    
    const button = screen.getByRole('button');
    
    // 大きいサイズのパディングクラスが含まれることを確認
    expect(button.className).toMatch(/px-6.*py-3/);
  });

  // 初学者向けメモ：
  // カスタムクラス名のテスト
  it('追加のクラス名が適用される', () => {
    render(
      <Button className="custom-class">
        カスタムボタン
      </Button>
    );
    
    const button = screen.getByRole('button');
    
    // カスタムクラスが追加されることを確認
    expect(button).toHaveClass('custom-class');
  });

  // 初学者向けメモ：
  // type属性のテスト
  it('type="submit"が正しく設定される', () => {
    render(<Button type="submit">送信</Button>);
    
    const button = screen.getByRole('button');
    
    // type属性がsubmitに設定されることを確認
    expect(button).toHaveAttribute('type', 'submit');
  });

  // 初学者向けメモ：
  // aria属性のアクセシビリティテスト
  it('aria-label属性が正しく設定される', () => {
    render(
      <Button aria-label="メニューを開く">
        ☰
      </Button>
    );
    
    const button = screen.getByRole('button');
    
    // aria-label属性が設定されることを確認
    expect(button).toHaveAttribute('aria-label', 'メニューを開く');
  });
});