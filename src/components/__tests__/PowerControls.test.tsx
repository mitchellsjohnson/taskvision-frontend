import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PowerControls } from '../PowerControls';

describe('PowerControls', () => {
  let onMove: jest.Mock;

  beforeEach(() => {
    onMove = jest.fn();
  });

  const renderComponent = (props: any) => {
    const defaultProps = {
      taskId: 'task-1',
      listId: 'MIT',
      onMove,
      mitListLength: 2,
      litListLength: 3,
    };
    return render(<PowerControls {...defaultProps} {...props} />);
  };

  describe('when task is in MIT list', () => {
    it('shows LIT label with position buttons', () => {
      renderComponent({ listId: 'MIT', litListLength: 3 });
      expect(screen.getByText('LIT')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to lit priority 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to lit priority 2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to lit priority 3/i })).toBeInTheDocument();
    });

    it('shows buttons based on available positions when LIT list is short', () => {
      renderComponent({ listId: 'MIT', litListLength: 1 });
      expect(screen.getByText('LIT')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to lit priority 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to lit priority 2/i })).toBeInTheDocument(); // MIT task can add to LIT
    });

    it('calls onMove with correct parameters when clicking position button', () => {
      renderComponent({ taskId: 'test-task', listId: 'MIT', litListLength: 3 });
      fireEvent.click(screen.getByRole('button', { name: /move to lit priority 2/i }));
      expect(onMove).toHaveBeenCalledWith('test-task', 'LIT', 1); // 0-based index
    });

    it('does not show MIT label or buttons', () => {
      renderComponent({ listId: 'MIT' });
      expect(screen.queryByText('MIT')).not.toBeInTheDocument();
    });
  });

  describe('when task is in LIT list', () => {
    it('shows MIT label with position buttons', () => {
      renderComponent({ listId: 'LIT', mitListLength: 2 });
      expect(screen.getByText('MIT')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to mit priority 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to mit priority 2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to mit priority 3/i })).toBeInTheDocument(); // LIT task can add to MIT
    });

    it('shows buttons based on available positions when MIT list is short', () => {
      renderComponent({ listId: 'LIT', mitListLength: 1 });
      expect(screen.getByText('MIT')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to mit priority 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to mit priority 2/i })).toBeInTheDocument(); // LIT task can add to MIT
    });

    it('calls onMove with correct parameters when clicking position button', () => {
      renderComponent({ taskId: 'test-task', listId: 'LIT', mitListLength: 3 });
      fireEvent.click(screen.getByRole('button', { name: /move to mit priority 3/i }));
      expect(onMove).toHaveBeenCalledWith('test-task', 'MIT', 2); // 0-based index
    });

    it('does not show LIT label or buttons', () => {
      renderComponent({ listId: 'LIT' });
      expect(screen.queryByText('LIT')).not.toBeInTheDocument();
    });
  });

  describe('when target list is empty', () => {
    it('shows LIT label with one button when LIT is empty (for the move)', () => {
      renderComponent({ listId: 'MIT', litListLength: 0 });
      expect(screen.getByText('LIT')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to lit priority 1/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /move to lit priority 2/i })).not.toBeInTheDocument();
    });

    it('shows MIT label with one button when MIT is empty (for the move)', () => {
      renderComponent({ listId: 'LIT', mitListLength: 0 });
      expect(screen.getByText('MIT')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /move to mit priority 1/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /move to mit priority 2/i })).not.toBeInTheDocument();
    });
  });
}); 