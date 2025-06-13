export interface Task {
  TaskId: string;
  title: string;
  description?: string;
  dueDate?: string;
  tags?: string[];
  status: 'Open' | 'Completed' | 'Canceled' | 'Waiting';
  creationDate: string;
  modifiedDate: string;
  completedDate: string | null;
  UserId: string;
  isMIT: boolean;
  priority: number;
}
