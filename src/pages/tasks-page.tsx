import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import { PageLayout } from '../components/page-layout';
import { EditTaskModal } from '../components/edit-task-modal';
import { TaskCard, TaskCardProps } from '../components/TaskCard';
import { Task } from '../types';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useTaskApi } from '../services/task-api';
import { DropdownFilter } from '../components/DropdownFilter';
import { TagFilterPills } from '../components/TagFilterPills';
import { DropPointer } from '../components/DropPointer';

const STATUS_OPTIONS = ['Open', 'Completed', 'Canceled', 'Waiting'] as const;
type TaskStatus = (typeof STATUS_OPTIONS)[number];

type DndContainerProps = {
  id: string;
  items: Task[];
  title: string;
  taskCardProps: Omit<TaskCardProps, 'task' | 'isOverlay'>;
  pointerState: { y: number | null; containerId: string | null };
};

const DndContainer: React.FC<DndContainerProps> = ({ id, items, title, taskCardProps, pointerState }) => {
  const { setNodeRef } = useDroppable({ id });

  const containerStyle = `
    p-4 rounded-lg
    bg-gray-800/50
    transition-colors duration-200 ease-in-out
    relative
  `;

  return (
    <div ref={setNodeRef} id={id} className={`${containerStyle} dnd-container`}>
      {pointerState.containerId === id && pointerState.y !== null && <DropPointer y={pointerState.y} />}
      <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
      <div className="space-y-4">
        <SortableContext items={items.map(t => t.TaskId)}>
          {items.map((task, index) => (
            <TaskCard 
              key={task.TaskId} 
              task={task} 
              {...taskCardProps}
              listId={id.toUpperCase() as 'MIT' | 'LIT'}
              index={index}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pointerState, setPointerState] = useState<{ overId: string | null; position: 'top' | 'bottom' | null, y: number | null; containerId: string | null }>({ overId: null, position: null, y: null, containerId: null });
  const [lastDroppedId, setLastDroppedId] = useState<string | null>(null);
  const [isDragSessionActive, setIsDragSessionActive] = useState(false);

  useEffect(() => {
    if (activeId) {
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = '';
    }
  }, [activeId]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>(['Open', 'Waiting']);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const { getTasks, updateTask, deleteTask, createTask } = useTaskApi();

  const fetchTasks = useCallback(async () => {
    try {
      const fetchedTasks = await getTasks({
        status: statusFilter,
        tags: tagFilter,
        search: searchFilter
      });

      // Validate and sanitize tasks
      const validTasks = fetchedTasks
        .filter(task => {
          if (!task || typeof task !== 'object' || !task.TaskId) {
            return false;
          }
          return true;
        })
        .map(task => ({
          ...task,
          title: String(task.title || 'Untitled Task'),
          status: task.status || 'Open',
          priority: Number(task.priority) || 0,
          tags: Array.isArray(task.tags) ? task.tags.map(String) : []
        }));

      setTasks(validTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
    }
  }, [getTasks, statusFilter, tagFilter, searchFilter]);

  useEffect(() => {
    // Debounce fetching to avoid excessive API calls
    const timerId = setTimeout(() => {
      fetchTasks();
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [fetchTasks]);

  const handleStatusFilterChangeSingle = (status: TaskStatus) => {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleTagFilterChange = (tag: string) => {
    setTagFilter(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSearchFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (selectedTask) {
      // Update existing task
      const updatedTask = await updateTask(selectedTask.TaskId, taskData);
      setTasks(currentTasks =>
        currentTasks.map(t => (t.TaskId === selectedTask.TaskId ? { ...t, ...updatedTask } : t))
      );
    } else {
      // Create new task. The backend will assign the correct priority.
      const newTask = await createTask(taskData);
      setTasks(currentTasks => [...currentTasks, newTask]);
    }
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(taskId, updates);
      if (updates.status === 'Canceled' || updates.status === 'Completed') {
        setTasks(currentTasks => currentTasks.filter(t => t.TaskId !== taskId));
      } else {
        setTasks(currentTasks => currentTasks.map(t => (t.TaskId === taskId ? { ...t, ...updatedTask } : t)));
      }
    } catch (error) {
      // Optionally, show an error to the user
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(currentTasks => currentTasks.filter(t => t.TaskId !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const mitTasks = useMemo(() => tasks.filter(task => task.isMIT).sort((a, b) => a.priority - b.priority), [tasks]);
  const litTasks = useMemo(() => tasks.filter(task => !task.isMIT).sort((a, b) => a.priority - b.priority), [tasks]);

  const findContainer = (taskId: string) => {
    if (mitTasks.some(t => t.TaskId === taskId)) return { id: 'MIT-container', tasks: mitTasks };
    if (litTasks.some(t => t.TaskId === taskId)) return { id: 'LIT-container', tasks: litTasks };
    return null;
  };

  const handleMove = (taskId: string, targetListId: 'MIT' | 'LIT', targetIndex: number) => {
    const taskToMove = tasks.find(t => t.TaskId === taskId);
    if (!taskToMove) return;

    // Optimistically update the UI
    setTasks(currentTasks => {
      const newTasks = currentTasks.filter(t => t.TaskId !== taskId);
      const updatedMovedTask = { ...taskToMove, isMIT: targetListId === 'MIT' };
      newTasks.splice(targetIndex, 0, updatedMovedTask);
      return newTasks;
    });

    // Tell the backend the task's MIT status has changed
    updateTask(taskId, { isMIT: targetListId === 'MIT' });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setIsDragSessionActive(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      setPointerState({ overId: null, position: null, y: null, containerId: null });
      return;
    }
  
    const activeId = active.id;
    const overId = over.id;
  
    if (activeId === overId) {
      return;
    }

    const overElement = document.getElementById(overId as string);

    // If hovering over an empty container, force the drop indicator to the top.
    const isOverEmptyLitContainer = overId === 'lit' && litTasks.filter(t => t.TaskId !== activeId).length === 0;
    const isOverEmptyMitContainer = overId === 'mit' && mitTasks.filter(t => t.TaskId !== activeId).length === 0;

    if (overElement && (isOverEmptyLitContainer || isOverEmptyMitContainer)) {
        setPointerState({
            overId: overId as string,
            position: 'top',
            y: 0, // Position at the very top
            containerId: overId as string,
        });
        return;
    }
  
    const overContainer = overElement?.closest('.dnd-container');
  
    if (!overElement || !overContainer) {
      setPointerState({ overId: null, position: null, y: null, containerId: null });
      return;
    }
  
    const overContainerId = overContainer.id;
    const overRect = overElement.getBoundingClientRect();
    
    const activeRect = event.active.rect.current;
    const activeTranslatedTop = activeRect.translated?.top;

    if (activeTranslatedTop === undefined) {
      setPointerState({ overId: null, position: null, y: null, containerId: null });
      return;
    }
  
    const position = activeTranslatedTop < overRect.top ? 'top' : 'bottom';
  
    const containerRect = overContainer.getBoundingClientRect();
    const y = position === 'top' 
      ? overRect.top - containerRect.top 
      : overRect.bottom - containerRect.top;
  
    setPointerState({
      overId: overId as string,
      position,
      y,
      containerId: overContainerId,
    });
  };

  const activeTask = useMemo(() => tasks.find(task => task.TaskId === activeId), [activeId, tasks]);

  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const taskCardProps = {
    onUpdate: handleTaskUpdate,
    onDelete: handleDeleteTask,
    onTagClick: handleTagFilterChange,
    lastDroppedId,
    onOpenEditModal: handleOpenEditModal,
    isDragSessionActive,
    onMove: handleMove,
    mitListLength: mitTasks.length,
    litListLength: litTasks.length,
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }
    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(activeId)?.id;
    let overContainerId = findContainer(overId)?.id;

    if (!overContainerId) {
      if (over.data.current?.droppableContainer?.id) {
        overContainerId = over.data.current?.droppableContainer?.id;
      } else {
        setActiveId(null);
        return; // Cannot determine the drop target
      }
    }

    if (activeContainer !== overContainerId) {
      // Moving between lists
      const isMovingToMit = overContainerId === 'MIT-container';
      updateTask(activeId, { isMIT: isMovingToMit });

      // Optimistic UI update
      setTasks(currentTasks => {
        const task = currentTasks.find(t => t.TaskId === activeId);
        if (!task) return currentTasks;
        const otherTasks = currentTasks.filter(t => t.TaskId !== activeId);
        const updatedTask = { ...task, isMIT: isMovingToMit };

        // Find the index in the new list
        const overIndex = otherTasks.findIndex(t => t.TaskId === overId);
        if (overIndex !== -1) {
          otherTasks.splice(overIndex, 0, updatedTask);
        } else {
          // If dropping on the container, not an item, add to the end
          if (isMovingToMit) {
            const lastMitIndex = otherTasks.reduce((last, t, i) => (t.isMIT ? i : last), -1);
            otherTasks.splice(lastMitIndex + 1, 0, updatedTask);
          } else {
            otherTasks.push(updatedTask);
          }
        }
        return otherTasks;
      });
    } else {
      // Reordering within the same list
      const activeIndex = tasks.findIndex(t => t.TaskId === activeId);
      const overIndex = tasks.findIndex(t => t.TaskId === overId);

      if (activeIndex !== overIndex) {
        // Optimistically update the UI
        setTasks(currentTasks => {
          const newTasks = Array.from(currentTasks);
          const [removed] = newTasks.splice(activeIndex, 1);
          newTasks.splice(overIndex, 0, removed);
          return newTasks;
        });

        // Send a single update to the backend. The backend will handle reprioritization.
        updateTask(activeId, { priority: overIndex + 1 });
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setIsDragSessionActive(false);
    setPointerState({ overId: null, position: null, y: null, containerId: null });
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [tasks]);

  return (
    <div className="p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Tasks</h1>
        <div className="flex items-center space-x-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchFilter}
              onChange={handleSearchFilterChange}
            />
          </div>
          <button
            onClick={() => {
              setSelectedTask(null);
              setIsEditModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            + New Task
          </button>
        </div>
      </header>
      
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <TagFilterPills
            selectedTags={tagFilter}
            onTagClick={handleTagFilterChange}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <DropdownFilter
            options={STATUS_OPTIONS}
            selectedOptions={statusFilter}
            onSelectionChange={handleStatusFilterChangeSingle}
            title="Status"
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DndContainer id="mit" items={mitTasks} title="MIT Tasks" taskCardProps={taskCardProps} pointerState={pointerState} />
          <DndContainer id="lit" items={litTasks} title="LIT Tasks" taskCardProps={taskCardProps} pointerState={pointerState} />
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isOverlay {...taskCardProps} isMoveIndicatorActive={pointerState.containerId !== null} />
          ) : null}
        </DragOverlay>
      </DndContext>
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={selectedTask}
        onSave={handleSaveTask}
        allTags={allTags}
      />
    </div>
  );
};
