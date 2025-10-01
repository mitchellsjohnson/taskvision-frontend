import { useState, useCallback, useRef } from 'react';
import { Task } from '../types';
import { useTaskApi } from '../services/task-api';

export interface UndoAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  description: string;
  timestamp: number;
  execute: () => Promise<void>;
}

interface CreateTaskAction {
  type: 'create';
  taskId: string;
  taskData: Task;
}

interface UpdateTaskAction {
  type: 'update';
  taskId: string;
  oldData: Partial<Task>;
  newData: Partial<Task>;
}

interface DeleteTaskAction {
  type: 'delete';
  taskId: string;
  taskData: Task;
}

type TaskAction = CreateTaskAction | UpdateTaskAction | DeleteTaskAction;

/**
 * Hook for managing undo functionality for task operations
 */
export const useUndo = () => {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [isUndoing, setIsUndoing] = useState(false);
  const { createTask, updateTask, deleteTask } = useTaskApi();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const addUndoAction = useCallback((action: TaskAction) => {
    const undoAction: UndoAction = {
      id: `undo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: action.type,
      timestamp: Date.now(),
      description: getActionDescription(action),
      execute: async () => {
        setIsUndoing(true);
        try {
          await executeUndo(action);
        } finally {
          setIsUndoing(false);
        }
      }
    };

    setUndoStack(prev => {
      const newStack = [undoAction, ...prev];
      // Keep only last 10 actions
      return newStack.slice(0, 10);
    });

    // Auto-remove after 30 seconds
    timeoutRef.current = setTimeout(() => {
      setUndoStack(prev => prev.filter(a => a.id !== undoAction.id));
    }, 30000);

  }, []);

  const executeUndo = async (action: TaskAction) => {
    switch (action.type) {
      case 'create':
        // Undo create = delete the task
        await deleteTask(action.taskId);
        break;
      
      case 'update':
        // Undo update = restore old data
        await updateTask(action.taskId, action.oldData);
        break;
      
      case 'delete':
        // Undo delete = recreate the task
        const { TaskId, ...taskDataWithoutId } = action.taskData;
        await createTask({ ...taskDataWithoutId, TaskId: action.taskId });
        break;
    }
  };

  const undo = useCallback(async (actionId?: string) => {
    const actionToUndo = actionId 
      ? undoStack.find(a => a.id === actionId)
      : undoStack[0]; // Most recent action

    if (!actionToUndo) {
      throw new Error('No action to undo');
    }

    await actionToUndo.execute();
    
    // Remove the undone action from stack
    setUndoStack(prev => prev.filter(a => a.id !== actionToUndo.id));
  }, [undoStack]);

  const clearUndo = useCallback((actionId?: string) => {
    if (actionId) {
      setUndoStack(prev => prev.filter(a => a.id !== actionId));
    } else {
      setUndoStack([]);
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const recordTaskCreation = useCallback((taskId: string, taskData: Task) => {
    addUndoAction({
      type: 'create',
      taskId,
      taskData
    });
  }, [addUndoAction]);

  const recordTaskUpdate = useCallback((taskId: string, oldData: Partial<Task>, newData: Partial<Task>) => {
    addUndoAction({
      type: 'update',
      taskId,
      oldData,
      newData
    });
  }, [addUndoAction]);

  const recordTaskDeletion = useCallback((taskId: string, taskData: Task) => {
    addUndoAction({
      type: 'delete',
      taskId,
      taskData
    });
  }, [addUndoAction]);

  return {
    undoStack,
    isUndoing,
    undo,
    clearUndo,
    recordTaskCreation,
    recordTaskUpdate,
    recordTaskDeletion
  };
};

function getActionDescription(action: TaskAction): string {
  switch (action.type) {
    case 'create':
      return `Created task: ${action.taskData.title}`;
    case 'update':
      return `Updated task: ${action.newData.title || 'Unknown'}`;
    case 'delete':
      return `Deleted task: ${action.taskData.title}`;
    default:
      return 'Unknown action';
  }
}


