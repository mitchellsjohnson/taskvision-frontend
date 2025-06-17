import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArrowControls, ArrowControlsProps } from '../ArrowControls';

describe('ArrowControls', () => {
  let onMove: jest.Mock;

  beforeEach(() => {
    onMove = jest.fn();
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
    it('shows all valid arrows when in the middle of the list', () => {
      renderComponent({ listId: 'MIT', index: 1, mitListLength: 3 });
      expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move down/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to lit at same position/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to top of lit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to bottom of lit/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /move to mit/i })).not.toBeInTheDocument();
    });

    it('hides up arrow when at the top of the list', () => {
        renderComponent({ listId: 'MIT', index: 0, mitListLength: 3 });
        expect(screen.queryByRole('button', { name: /move up/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /move down/i })).toBeInTheDocument();
    });

    it('hides down arrow when at the bottom of the list', () => {
        renderComponent({ listId: 'MIT', index: 2, mitListLength: 3 });
        expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /move down/i })).not.toBeInTheDocument();
    });
    
    it('hides up and down arrows when it is the only task', () => {
      renderComponent({ listId: 'MIT', index: 0, mitListLength: 1 });
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
      
    it('calls onMove correctly for moving to LIT (same position)', () => {
        renderComponent({ taskId: 'task-b', listId: 'MIT', index: 1 });
        fireEvent.click(screen.getByRole('button', { name: /move to lit at same position/i }));
        expect(onMove).toHaveBeenCalledWith('task-b', 'LIT', 1);
    });

    it('calls onMove correctly for moving to top of LIT', () => {
        renderComponent({ taskId: 'task-b', listId: 'MIT', index: 1 });
        fireEvent.click(screen.getByRole('button', { name: /move to top of lit/i }));
        expect(onMove).toHaveBeenCalledWith('task-b', 'LIT', 0);
    });

    it('calls onMove correctly for moving to bottom of LIT', () => {
        renderComponent({ taskId: 'task-b', listId: 'MIT', index: 1, litListLength: 5 });
        fireEvent.click(screen.getByRole('button', { name: /move to bottom of lit/i }));
        expect(onMove).toHaveBeenCalledWith('task-b', 'LIT', 5);
    });

    describe('when LIT list is empty', () => {
      it('shows only the horizontal arrow to LIT', () => {
        renderComponent({ listId: 'MIT', litListLength: 0 });
        expect(screen.getByRole('button', { name: /move to lit/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /move to top of lit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /move to bottom of lit/i })).not.toBeInTheDocument();
      });

      it('calls onMove correctly for moving to empty LIT list', () => {
        renderComponent({ taskId: 'task-c', listId: 'MIT', litListLength: 0 });
        fireEvent.click(screen.getByRole('button', { name: /move to lit/i }));
        expect(onMove).toHaveBeenCalledWith('task-c', 'LIT', 0);
      });
    });
  });

  describe('when task is in LIT list', () => {
    it('shows all valid arrows when in the middle of the list', () => {
      renderComponent({ listId: 'LIT', index: 1, litListLength: 3 });
      expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move down/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to mit at same position/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to top of mit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to bottom of mit/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /move to lit/i })).not.toBeInTheDocument();
    });

    it('calls onMove correctly for moving to MIT (same position)', () => {
      renderComponent({ taskId: 'task-l', listId: 'LIT', index: 1 });
      fireEvent.click(screen.getByRole('button', { name: /move to mit at same position/i }));
      expect(onMove).toHaveBeenCalledWith('task-l', 'MIT', 1);
    });

    it('calls onMove correctly for moving to top of MIT', () => {
        renderComponent({ taskId: 'task-l', listId: 'LIT', index: 1 });
        fireEvent.click(screen.getByRole('button', { name: /move to top of mit/i }));
        expect(onMove).toHaveBeenCalledWith('task-l', 'MIT', 0);
    });

    it('calls onMove correctly for moving to bottom of MIT', () => {
        renderComponent({ taskId: 'task-l', listId: 'LIT', index: 1, mitListLength: 4 });
        fireEvent.click(screen.getByRole('button', { name: /move to bottom of mit/i }));
        expect(onMove).toHaveBeenCalledWith('task-l', 'MIT', 4);
    });

    describe('when MIT list is empty', () => {
      it('shows only the horizontal arrow to MIT', () => {
        renderComponent({ listId: 'LIT', mitListLength: 0 });
        expect(screen.getByRole('button', { name: /move to mit/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /move to top of mit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /move to bottom of mit/i })).not.toBeInTheDocument();
      });

      it('calls onMove correctly for moving to empty MIT list', () => {
        renderComponent({ taskId: 'task-d', listId: 'LIT', mitListLength: 0 });
        fireEvent.click(screen.getByRole('button', { name: /move to mit/i }));
        expect(onMove).toHaveBeenCalledWith('task-d', 'MIT', 0);
      });
    });
  });
}); 