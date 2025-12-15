import React from 'react';
import { vi } from "vitest";
import { render, screen } from '@testing-library/react';
import { CharacterCounter } from '../CharacterCounter';

describe('CharacterCounter', () => {
  it('should show remaining characters for normal usage', () => {
    render(<CharacterCounter current={50} max={200} />);
    expect(screen.getByText('150 characters remaining')).toBeInTheDocument();
  });

  it('should show warning color when near limit', () => {
    render(<CharacterCounter current={185} max={200} />); // 92.5% usage
    const counter = screen.getByText('15 characters remaining').parentElement;
    expect(counter).toHaveClass('text-yellow-400');
  });

  it('should show error color when over limit', () => {
    render(<CharacterCounter current={250} max={200} />);
    const counterDiv = screen.getByText('50 characters over limit').parentElement;
    const counterSpan = screen.getByText('50 characters over limit');
    expect(counterDiv).toHaveClass('text-red-400');
    expect(counterSpan).toHaveClass('font-medium');
  });

  it('should show normal color for safe usage', () => {
    render(<CharacterCounter current={100} max={200} />);
    const counter = screen.getByText('100 characters remaining').parentElement;
    expect(counter).toHaveClass('text-muted-foreground');
  });

  it('should handle exact limit', () => {
    render(<CharacterCounter current={200} max={200} />);
    expect(screen.getByText('0 characters remaining')).toBeInTheDocument();
  });

  it('should handle zero current characters', () => {
    render(<CharacterCounter current={0} max={200} />);
    expect(screen.getByText('200 characters remaining')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-counter-class';
    const { container } = render(
      <CharacterCounter current={50} max={200} className={customClass} />
    );
    expect(container.firstChild).toHaveClass(customClass);
  });

  describe('color thresholds', () => {
    it('should be normal at 89% usage', () => {
      render(<CharacterCounter current={178} max={200} />); // 89%
      const counter = screen.getByText('22 characters remaining').parentElement;
      expect(counter).toHaveClass('text-muted-foreground');
    });

    it('should be warning at 91% usage', () => {
      render(<CharacterCounter current={182} max={200} />); // 91%
      const counter = screen.getByText('18 characters remaining').parentElement;
      expect(counter).toHaveClass('text-yellow-400');
    });

    it('should be error at 101% usage', () => {
      render(<CharacterCounter current={202} max={200} />); // 101%
      const counter = screen.getByText('2 characters over limit').parentElement;
      expect(counter).toHaveClass('text-red-400');
    });
  });

  describe('different max values', () => {
    it('should work with small max values', () => {
      render(<CharacterCounter current={8} max={10} />);
      expect(screen.getByText('2 characters remaining')).toBeInTheDocument();
    });

    it('should work with large max values', () => {
      render(<CharacterCounter current={4500} max={5000} />);
      expect(screen.getByText('500 characters remaining')).toBeInTheDocument();
    });
  });
}); 