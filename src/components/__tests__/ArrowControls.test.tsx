import React from 'react';
import { vi } from "vitest";
import { render, screen, fireEvent } from '@testing-library/react';
import { ArrowControls, ArrowControlsProps } from '../ArrowControls';

describe('ArrowControls', () => {
  let onMove: any;

  beforeEach(() => {
    onMove = vi.fn();
  });

  const renderComponent = (props: Partial<ArrowControlsProps>) => {
    const defaultProps: ArrowControlsProps = {
      taskId: 'task-1',
      listId: 'MIT',
      index: 1,
      mitListLength: 3,
      litListLength: 3,
      onMove,
    };
    return render(<ArrowControls {...defaultProps} {...props} />);
  };

  describe('when task is in MIT list', () => {
    it('shows up and down arrows when in the middle of the list', () => {
      renderComponent({ listId: 'MIT', index: 1, mitListLength: 3 });
      expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move down/i })).toBeInTheDocument();
    });

    it('hides up arrow when at the top globally (first MIT task)', () => {
      renderComponent({ listId: 'MIT', index: 0, mitListLength: 3 });
      expect(screen.queryByRole('button', { name: /move up/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move down/i })).toBeInTheDocument();
    });

    it('shows down arrow when at the bottom of MIT (moves to LIT)', () => {
      renderComponent({ listId: 'MIT', index: 2, mitListLength: 3 });
      expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to lit/i })).toBeInTheDocument();
    });
    
    it('shows only down arrow when it is the only task', () => {
      renderComponent({ listId: 'MIT', index: 0, mitListLength: 1, litListLength: 0 });
      expect(screen.queryByRole('button', { name: /move up/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /move down/i })).not.toBeInTheDocument();
    });

    it('calls onMove correctly for moving up in MIT', () => {
      renderComponent({ taskId: 'task-b', listId: 'MIT', index: 1 });
      fireEvent.click(screen.getByRole('button', { name: /move up/i }));
      expect(onMove).toHaveBeenCalledWith('task-b', 'MIT', 0);
    });

    it('calls onMove correctly for moving down in MIT', () => {
      renderComponent({ taskId: 'task-b', listId: 'MIT', index: 1 });
      fireEvent.click(screen.getByRole('button', { name: /move down/i }));
      expect(onMove).toHaveBeenCalledWith('task-b', 'MIT', 2);
    });
      
    it('calls onMove correctly for moving from MIT to LIT', () => {
      renderComponent({ taskId: 'task-b', listId: 'MIT', index: 2, mitListLength: 3 });
      fireEvent.click(screen.getByRole('button', { name: /move to lit/i }));
      expect(onMove).toHaveBeenCalledWith('task-b', 'LIT', 0);
    });
  });

  describe('when task is in LIT list', () => {
    it('shows up and down arrows when in the middle of the list', () => {
      renderComponent({ listId: 'LIT', index: 1, litListLength: 3 });
      expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move down/i })).toBeInTheDocument();
    });

    it('shows up arrow for moving to MIT when at top of LIT', () => {
      renderComponent({ listId: 'LIT', index: 0, mitListLength: 2 });
      expect(screen.getByRole('button', { name: /move to mit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move down/i })).toBeInTheDocument();
    });

    it('shows tooltip about bumping when MIT is full', () => {
      renderComponent({ listId: 'LIT', index: 0, mitListLength: 3 });
      expect(screen.getByRole('button', { name: /move to mit \(bumps lowest mit to lit\)/i })).toBeInTheDocument();
    });

    it('hides down arrow when at bottom globally', () => {
      renderComponent({ listId: 'LIT', index: 2, litListLength: 3, mitListLength: 3 });
      expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /move down/i })).not.toBeInTheDocument();
    });

    it('calls onMove correctly for moving up in LIT', () => {
      renderComponent({ taskId: 'task-l', listId: 'LIT', index: 1 });
      fireEvent.click(screen.getByRole('button', { name: /move up/i }));
      expect(onMove).toHaveBeenCalledWith('task-l', 'LIT', 0);
    });

    it('calls onMove correctly for moving down in LIT', () => {
      renderComponent({ taskId: 'task-l', listId: 'LIT', index: 1 });
      fireEvent.click(screen.getByRole('button', { name: /move down/i }));
      expect(onMove).toHaveBeenCalledWith('task-l', 'LIT', 2);
    });

    it('calls onMove correctly for moving from LIT to MIT', () => {
      renderComponent({ taskId: 'task-l', listId: 'LIT', index: 0, mitListLength: 2 });
      fireEvent.click(screen.getByRole('button', { name: /move to mit/i }));
      expect(onMove).toHaveBeenCalledWith('task-l', 'MIT', 2);
    });
  });
}); 