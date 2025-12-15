import React from 'react';
import { vi } from "vitest";
import { render, screen } from '@testing-library/react';
import { UpcomingTasksList } from '../UpcomingTasksList';

// Mock the task API and edit modal
vi.mock('../../services/task-api', () => ({
  useTaskApi: () => ({
    getTasks: vi.fn(),
  }),
}));

vi.mock('../edit-task-form', () => ({
  EditTaskForm: ({ task, onSave, onCancel }: any) => 
    <div data-testid="edit-task-form">Edit Form for {task?.title || 'New Task'}</div>,
}));

vi.mock('../ui/Dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
}));

describe('UpcomingTasksList', () => {
  it('should render without crashing', () => {
    render(<UpcomingTasksList />);
    expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<UpcomingTasksList />);
    expect(screen.getByText('Loading upcoming tasks...')).toBeInTheDocument();
  });
}); 