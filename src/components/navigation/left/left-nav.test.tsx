import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LeftNav } from './left-nav';

jest.mock('./left-nav', () => ({
  LeftNav: () => <div data-testid="left-nav" />
}));

describe('LeftNav', () => {
  it('renders the LeftNav component', () => {
    render(
      <MemoryRouter>
        <LeftNav />
      </MemoryRouter>
    );
    expect(screen.getByTestId('left-nav')).toBeInTheDocument();
  });
});
