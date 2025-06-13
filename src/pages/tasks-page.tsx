import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import { PageLayout } from '../components/page-layout';
import { EditTaskModal } from '../components/edit-task-modal';
import { TaskCard } from '../components/TaskCard';
import { Task } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DropAnimation,
  defaultDropAnimationSideEffects,
  UniqueIdentifier,
  useDroppable
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useTaskApi } from '../services/task-api';
import { DropdownFilter } from '../components/DropdownFilter';

const STATUS_OPTIONS = ['Open', 'Completed', 'Canceled', 'Waiting'] as const;
type TaskStatus = (typeof STATUS_OPTIONS)[number];

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5'
      }
    }
  })
};

interface DndContainerProps {
  id: UniqueIdentifier;
  items: Task[];
  children: React.ReactNode;
}

const DndContainer: React.FC<DndContainerProps> = ({ id, items, children }) => {
  const { setNodeRef } = useDroppable({ id: id.toString() });
  return (
    <SortableContext id={id.toString()} items={items.map(i => i.TaskId)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className="flex flex-col gap-4 p-6 bg-gray-900/50 rounded-xl min-h-[200px] border-2 border-dashed border-gray-700 transition-colors duration-200 hover:border-gray-600"
      >
        {children}
      </div>
    </SortableContext>
  );
};

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>(['Open', 'Waiting']);
  const [dueDateFilter, setDueDateFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
        search: searchTerm
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
      setTasks([]);
    }
  }, [getTasks, statusFilter, tagFilter, searchTerm]);

  useEffect(() => {
    // Debounce fetching to avoid excessive API calls
    const timerId = setTimeout(() => {
      fetchTasks();
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [fetchTasks]);

  const handleCardClick = (taskId: string) => {
    const task = tasks.find((t) => t.TaskId === taskId);
    if (task) {
      setSelectedTask(task);
      setIsEditModalOpen(true);
    }
  };

  const handleCreateClick = () => {
    setSelectedTask(null);
    setIsEditModalOpen(true);
  };

  const handleStatusFilterChange = (status: TaskStatus) => {
    setStatusFilter(prev => {
      const newFilter = prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status];
      return newFilter;
    });
  };

  const handleTagFilterChange = (tag: string) => {
    setTagFilter(prev => {
      const newFilter = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
      return newFilter;
    });
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (selectedTask) {
      // Update existing task
      const updatedTask = await updateTask(selectedTask.TaskId, taskData);
      // Validate MIT task count
      const currentMITCount = tasks.filter(t => t.isMIT && t.TaskId !== selectedTask.TaskId).length;
      const willBeMIT = taskData.isMIT || (taskData.priority !== undefined && taskData.priority <= 3);
      if (willBeMIT && currentMITCount >= 3) {
        alert('Cannot have more than 3 MIT tasks. Please adjust the priority to be greater than 3.');
        return;
      }
      setTasks(currentTasks =>
        currentTasks.map(t => (t.TaskId === selectedTask.TaskId ? { ...t, ...updatedTask } : t))
      );
    } else {
      // Create new task
      const newTask = await createTask(taskData);
      // Validate MIT task count for new tasks
      const currentMITCount = tasks.filter(t => t.isMIT).length;
      const willBeMIT = taskData.isMIT || (taskData.priority !== undefined && taskData.priority <= 3);
      if (willBeMIT && currentMITCount >= 3) {
        alert('Cannot have more than 3 MIT tasks. Please adjust the priority to be greater than 3.');
        return;
      }
      setTasks(currentTasks => [...currentTasks, newTask]);
    }
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(taskId, updates);
      setTasks(currentTasks => currentTasks.map(t => (t.TaskId === taskId ? { ...t, ...updatedTask } : t)));
    } catch (error) {
      // Optionally, show an error to the user
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        await fetchTasks();
      } catch (error) {
        alert('Failed to delete the task. Please try again.');
      }
    }
  };

  const findContainer = (id: UniqueIdentifier) => {
    const task = tasks.find(({ TaskId }) => TaskId === id);
    if (task) {
      return task.isMIT ? 'mit-zone' : 'lit-zone';
    }
    if (id === 'mit-zone' || id === 'lit-zone') {
      return id;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    const originalTasks = [...tasks];
    let newTasks = [...tasks];
    const activeTaskIndex = newTasks.findIndex(t => t.TaskId === activeId);

    if (activeTaskIndex === -1) {
      return;
    }

    // Reordering logic
    if (activeContainer === overContainer) {
      const overTaskIndex = newTasks.findIndex(t => t.TaskId === overId);
      if (overTaskIndex !== -1) {
        newTasks = arrayMove(newTasks, activeTaskIndex, overTaskIndex);
      }
    } else {
      // Moving between containers
      const activeTaskForCheck = originalTasks[activeTaskIndex];
      if (overContainer === 'lit-zone') {
        const isMandatoryMIT = activeTaskForCheck.priority > 0 && activeTaskForCheck.priority <= 3;
        if (isMandatoryMIT) {
          return;
        }
      }

      const activeTask = { ...newTasks[activeTaskIndex] };

      const mitTaskCount = newTasks.filter(
        t => (t.isMIT || (t.priority > 0 && t.priority <= 3)) && t.TaskId !== activeId
      ).length;
      if (overContainer === 'mit-zone' && mitTaskCount >= 3) {
        return;
      }

      activeTask.isMIT = overContainer === 'mit-zone';

      newTasks.splice(activeTaskIndex, 1);

      const overIsContainer = overId === 'mit-zone' || overId === 'lit-zone';
      const overTaskIndex = newTasks.findIndex(t => t.TaskId === overId);

      if (!overIsContainer && overTaskIndex !== -1) {
        newTasks.splice(overTaskIndex, 0, activeTask);
      } else {
        if (overContainer === 'mit-zone') {
          // Find first non-MIT task and insert before it
          const firstLitIndex = newTasks.findIndex(t => !t.isMIT && !(t.priority > 0 && t.priority <= 3));
          if (firstLitIndex !== -1) {
            newTasks.splice(firstLitIndex, 0, activeTask);
          } else {
            newTasks.push(activeTask);
          }
        } else {
          // Dropped on LIT container
          newTasks.push(activeTask);
        }
      }
    }

    // Recalculate all priorities and update state optimistically
    const updatedTasksWithPriority = newTasks.map((task, index) => ({
      ...task,
      priority: index + 1
    }));

    setTasks(updatedTasksWithPriority);

    // Persist priority and isMIT changes to the backend
    const updatePromises = updatedTasksWithPriority
      .map(task => {
        const originalTask = originalTasks.find(t => t.TaskId === task.TaskId);
        if (!originalTask || originalTask.priority !== task.priority || originalTask.isMIT !== task.isMIT) {
          return updateTask(task.TaskId, {
            priority: task.priority,
            isMIT: task.isMIT
          });
        }
        return null;
      })
      .filter((p): p is Promise<Task> => p !== null);

    if (updatePromises.length > 0) {
      Promise.all(updatePromises).catch(() => {
        // Revert state on failure
        setTasks(originalTasks);
        alert('Failed to save the new task order. Please check your connection and try again.');
      });
    }
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [tasks]);

  const mitTasks = tasks
    .filter(t => t.isMIT || (t.priority > 0 && t.priority <= 3))
    .sort((a, b) => a.priority - b.priority)
    .filter(task => {
      if (!task || typeof task !== 'object' || !task.TaskId) {
        return false;
      }
      return true;
    });
  const litTasks = tasks
    .filter(t => !(t.isMIT || (t.priority > 0 && t.priority <= 3)))
    .sort((a, b) => a.priority - b.priority)
    .filter(task => {
      if (!task || typeof task !== 'object' || !task.TaskId) {
        return false;
      }
      return true;
    });
  const activeTask = useMemo(() => tasks.find((task) => task.TaskId === activeId), [activeId, tasks]);

  return (
    <div className="tasks-page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Tasks</h1>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="flex-grow"></div>
          <button
            onClick={handleCreateClick}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create New Task
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          <DropdownFilter
            title="Status"
            options={STATUS_OPTIONS}
            selectedOptions={statusFilter}
            onSelectionChange={handleStatusFilterChange}
          />
          <select
            className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dueDateFilter}
            onChange={e => setDueDateFilter(e.target.value)}
          >
            <option value="all">All Due Dates</option>
            <option value="7">Next 7 Days</option>
            <option value="14">Next 14 Days</option>
            <option value="30">Next 30 Days</option>
          </select>
          <DropdownFilter
            title="Tags"
            options={allTags}
            selectedOptions={tagFilter}
            onSelectionChange={handleTagFilterChange}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm mr-2">MIT</span>
              Most Important Tasks
            </h2>
            <DndContainer id="mit-zone" items={mitTasks}>
              {mitTasks.map(task => (
                <TaskCard
                  key={task.TaskId}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleDeleteTask}
                  onEdit={handleCardClick}
                  onDragStart={handleDragStart}
                  onDragOver={() => {}}
                  onDrop={() => {}}
                />
              ))}
            </DndContainer>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm mr-2">LIT</span>
              Less Important Tasks
            </h2>
            <DndContainer id="lit-zone" items={litTasks}>
              {litTasks.map(task => (
                <TaskCard
                  key={task.TaskId}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleDeleteTask}
                  onEdit={handleCardClick}
                  onDragStart={handleDragStart}
                  onDragOver={() => {}}
                  onDrop={() => {}}
                />
              ))}
            </DndContainer>
          </div>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onUpdate={async () => Promise.resolve()}
              onDelete={async () => Promise.resolve()}
              onEdit={() => {}}
              onDragStart={() => {}}
              onDragOver={() => {}}
              onDrop={() => {}}
            />
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
