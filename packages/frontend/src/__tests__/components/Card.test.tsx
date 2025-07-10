/**
 * Cardコンポーネントのテスト
 * 初学者向け: コンテナコンポーネントのテストパターン
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/common/Card';

describe('Card コンポーネント', () => {
  // 初学者向けメモ：
  // 基本的なカードの表示テスト
  it('基本的なカードが正しく表示される', () => {
    render(
      <Card>
        <CardContent>
          <p>カードの内容</p>
        </CardContent>
      </Card>
    );
    
    // カードの内容が表示されることを確認
    expect(screen.getByText('カードの内容')).toBeInTheDocument();
  });

  // 初学者向けメモ：
  // 完全なカード構造のテスト
  it('完全なカード構造が正しく表示される', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>カードタイトル</CardTitle>
        </CardHeader>
        <CardContent>
          <p>メインコンテンツ</p>
        </CardContent>
        <CardFooter>
          <button>アクション</button>
        </CardFooter>
      </Card>
    );
    
    // 各部分が正しく表示されることを確認
    expect(screen.getByText('カードタイトル')).toBeInTheDocument();
    expect(screen.getByText('メインコンテンツ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'アクション' })).toBeInTheDocument();
  });

  // 初学者向けメモ：
  // カスタムクラス名のテスト
  it('カスタムクラス名が適用される', () => {
    render(
      <Card className="custom-card">
        <CardContent>内容</CardContent>
      </Card>
    );
    
    // カスタムクラスが適用されることを確認
    const card = screen.getByText('内容').closest('.custom-card');
    expect(card).toBeInTheDocument();
  });

  // 初学者向けメモ：
  // CardHeaderのテスト
  it('CardHeaderが正しく表示される', () => {
    render(
      <Card>
        <CardHeader className="test-header">
          <p>ヘッダー内容</p>
        </CardHeader>
      </Card>
    );
    
    const headerContent = screen.getByText('ヘッダー内容');
    expect(headerContent).toBeInTheDocument();
    
    // ヘッダーに適切なクラスが適用されることを確認
    const header = headerContent.closest('.test-header');
    expect(header).toBeInTheDocument();
  });

  // 初学者向けメモ：
  // CardTitleのテスト
  it('CardTitleが正しく表示される', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>テストタイトル</CardTitle>
        </CardHeader>
      </Card>
    );
    
    const title = screen.getByText('テストタイトル');
    expect(title).toBeInTheDocument();
    
    // タイトルがh3要素として表示されることを確認
    expect(title.tagName).toBe('H3');
  });

  // 初学者向けメモ：
  // CardContentのテスト
  it('CardContentが正しく表示される', () => {
    render(
      <Card>
        <CardContent className="test-content">
          <div>
            <p>段落1</p>
            <p>段落2</p>
          </div>
        </CardContent>
      </Card>
    );
    
    // 複数の子要素が正しく表示されることを確認
    expect(screen.getByText('段落1')).toBeInTheDocument();
    expect(screen.getByText('段落2')).toBeInTheDocument();
    
    // コンテンツエリアにカスタムクラスが適用されることを確認
    const content = screen.getByText('段落1').closest('.test-content');
    expect(content).toBeInTheDocument();
  });

  // 初学者向けメモ：
  // CardFooterのテスト
  it('CardFooterが正しく表示される', () => {
    render(
      <Card>
        <CardFooter className="test-footer">
          <button>保存</button>
          <button>キャンセル</button>
        </CardFooter>
      </Card>
    );
    
    // フッター内のボタンが正しく表示されることを確認
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    
    // フッターにカスタムクラスが適用されることを確認
    const footer = screen.getByRole('button', { name: '保存' }).closest('.test-footer');
    expect(footer).toBeInTheDocument();
  });

  // 初学者向けメモ：
  // プレイヤー情報カードの実際の使用例テスト
  it('プレイヤー情報カードとして使用できる', () => {
    const playerData = {
      name: 'テストプレイヤー',
      id: 'player123',
      createdAt: '2024-01-01',
    };

    render(
      <Card>
        <CardHeader>
          <CardTitle>プレイヤー情報</CardTitle>
        </CardHeader>
        <CardContent>
          <p>名前: {playerData.name}</p>
          <p>ID: {playerData.id}</p>
          <p>作成日: {playerData.createdAt}</p>
        </CardContent>
        <CardFooter>
          <button>編集</button>
          <button>削除</button>
        </CardFooter>
      </Card>
    );
    
    // プレイヤー情報が正しく表示されることを確認
    expect(screen.getByText('プレイヤー情報')).toBeInTheDocument();
    expect(screen.getByText('名前: テストプレイヤー')).toBeInTheDocument();
    expect(screen.getByText('ID: player123')).toBeInTheDocument();
    expect(screen.getByText('作成日: 2024-01-01')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
  });

  // 初学者向けメモ：
  // モンスター情報カードの実際の使用例テスト
  it('モンスター情報カードとして使用できる', () => {
    const monsterData = {
      nickname: 'でんきちゃん',
      species: 'でんきネズミ',
      hp: 85,
      maxHp: 100,
    };

    render(
      <Card>
        <CardHeader>
          <CardTitle>{monsterData.nickname || monsterData.species}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>種族: {monsterData.species}</p>
          <p>HP: {monsterData.hp}/{monsterData.maxHp}</p>
        </CardContent>
        <CardFooter>
          <button>詳細</button>
        </CardFooter>
      </Card>
    );
    
    // モンスター情報が正しく表示されることを確認
    expect(screen.getByText('でんきちゃん')).toBeInTheDocument();
    expect(screen.getByText('種族: でんきネズミ')).toBeInTheDocument();
    expect(screen.getByText('HP: 85/100')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '詳細' })).toBeInTheDocument();
  });
});