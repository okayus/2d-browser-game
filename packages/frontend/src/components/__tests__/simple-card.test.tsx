/// <reference types="vitest" />
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// 簡単なCardコンポーネントを直接定義
const SimpleCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="simple-card">{children}</div>;
};

describe('SimpleCard', () => {
  test('renders children', () => {
    render(<SimpleCard>Test Content</SimpleCard>);
    expect(screen.getByTestId('simple-card')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});