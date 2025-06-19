import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
// import { PageLayout } from '../components/page-layout';
import { EditTaskModal } from '../components/edit-task-modal';
// import { DarkModeToggle } from '../components/DarkModeToggle';
import { TaskCard, TaskCardProps } from '../components/TaskCard';
import { SearchBar } from '../components/SearchBar';
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
  defaultDropAnimation,
  DropAnimation,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useTaskApi } from '../services/task-api';
import { DropdownFilter } from '../components/DropdownFilter';
import { TagFilterPills } from '../components/TagFilterPills';
import { DropIndicator } from '../components/DropIndicator';
import { DateFilter, DateFilterOption } from '../components/DateFilter';
import { getDateFilterRanges } from '../utils/dateFilters';

const STATUS_OPTIONS = ['Open', 'Completed', 'Canceled', 'Waiting'] as const;
type TaskStatus = (typeof STATUS_OPTIONS)[number];

const DndTaskContainer: React.FC<{
  id: string;
  title: string;
  items: Task[];
  taskCardProps: Omit<TaskCardProps, 'task' | 'isOverlay'>;
  dropIndicator: { overItemId: string; position: 'before' | 'after' } | null;
}> = ({ id, title, items, taskCardProps, dropIndicator }) => {
  const { setNodeRef } = useDroppable({ id });

  const containerStyle = `p-4 rounded-lg bg-gray-800/50 relative flex flex-col gap-4 min-h-[200px]`;
  const isOverEmptyContainer = items.length === 0 && dropIndicator?.overItemId === id;

  return (
    <div ref={setNodeRef} id={id} className={containerStyle}>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="flex flex-col gap-4">
        {isOverEmptyContainer && <DropIndicator />}
        {items.map((task, index) => (
          <React.Fragment key={task.TaskId}>
            {dropIndicator?.overItemId === task.TaskId && dropIndicator.position === 'before' && <DropIndicator />}
            <TaskCard 
              task={task} 
              {...taskCardProps}
              listId={id.toUpperCase() as 'MIT' | 'LIT'}
              index={index}
            />
            {dropIndicator?.overItemId === task.TaskId && dropIndicator.position === 'after' && <DropIndicator />}
          </React.Fragment>
        ))}
        {items.length === 0 && !isOverEmptyContainer && (
            <div className="flex-1 border-2 border-dashed border-gray-700 rounded-lg flex justify-center items-center text-gray-500 min-h-[100px]">
              Drop tasks here
            </div>
          )}
      </div>
    </div>
  );
};

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>(['Open', 'Waiting']);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ overItemId: string; position: 'before' | 'after' } | null>(null);
  const [flashingTasks, setFlashingTasks] = useState<Set<string>>(new Set());
  const pointerY = useRef(0);

  const { getTasks, updateTask, deleteTask, createTask } = useTaskApi();

  const fetchTasks = useCallback(async () => {
    try {
      const dateRanges = getDateFilterRanges(dateFilter);
      const fetchedTasks = await getTasks({
        status: statusFilter,
        tags: tagFilter,
        search: searchFilter,
        dateFilter: dateFilter,
        startDate: dateRanges?.startDate,
        endDate: dateRanges?.endDate,
        noDueDate: (dateRanges as any)?.noDueDate
      });
      const validTasks = fetchedTasks
        .filter(task => task && task.TaskId)
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
  }, [getTasks, statusFilter, tagFilter, searchFilter, dateFilter]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchTasks();
    }, 500);
    return () => clearTimeout(timerId);
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



  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (selectedTask) {
      await updateTask(selectedTask.TaskId, taskData);
    } else {
      await createTask(taskData);
    }
    fetchTasks();
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
    fetchTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    fetchTasks();
  };
  
  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const mitTasks = useMemo(() => tasks.filter(task => task.isMIT).sort((a, b) => a.priority - b.priority), [tasks]);
  const litTasks = useMemo(() => tasks.filter(task => !task.isMIT).sort((a, b) => a.priority - b.priority), [tasks]);
  
  // Open tasks for search (excludes completed and canceled)
  const openTasks = useMemo(() => tasks.filter(task => task.status === 'Open' || task.status === 'Waiting'), [tasks]);

  const containers = useMemo(() => [
      { id: 'mit', title: 'MIT Tasks', items: mitTasks },
      { id: 'lit', title: 'LIT Tasks', items: litTasks }
  ], [mitTasks, litTasks]);

  const handleMouseMove = (e: MouseEvent) => { pointerY.current = e.clientY; };
  const handleTouchMove = (e: TouchEvent) => { pointerY.current = e.touches[0].clientY; };

  const flashTask = useCallback((taskId: string) => {
    setFlashingTasks(prev => new Set(prev).add(taskId));
    
    // Remove the flash after animation completes
    setTimeout(() => {
      setFlashingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 650); // 150ms delay + 500ms fade
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id: string) => {
    if (containers.some(c => c.id === id)) {
      return containers.find(c => c.id === id);
    }
    return containers.find(c => c.items.some(i => i.TaskId === id));
  };
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    
    if (!over) {
      setDropIndicator(null);
      return;
    }

    const overId = over.id as string;

    if (activeId === overId) {
      setDropIndicator(null);
      return;
    }

    const overContainer = findContainer(overId);
    if (!overContainer) {
      setDropIndicator(null);
      return;
    }
    
    const overIsContainer = overContainer.id === overId;
    if (overIsContainer) {
        // Check MIT limit - don't allow dropping into MIT if it would exceed 3 tasks
        if (overContainer.id === 'mit') {
            const activeContainer = findContainer(activeId);
            if (activeContainer && activeContainer.id !== 'mit' && overContainer.items.length >= 3) {
                setDropIndicator(null);
                return;
            }
        }

        if (overContainer.items.length === 0) {
            setDropIndicator({ overItemId: overId, position: 'before' });
        } else {
            const overRect = over.rect;
            const isBelowMidpoint = (pointerY.current - overRect.top) > (overRect.height / 2);
            const firstItem = overContainer.items[0];
            const lastItem = overContainer.items[overContainer.items.length - 1];

            setDropIndicator({
                overItemId: isBelowMidpoint ? lastItem.TaskId : firstItem.TaskId,
                position: isBelowMidpoint ? 'after' : 'before',
            });
        }
        return;
    }

    const overItem = overContainer.items.find(i => i.TaskId === overId);
    if (overItem) {
        const overRect = over.rect;
        const isBelow = (pointerY.current - overRect.top) > (overRect.height / 2);
        
        // Don't show indicator if dropping in the same position
        const activeContainer = findContainer(activeId);
        if (activeContainer && activeContainer.id === overContainer.id) {
            const activeIndex = activeContainer.items.findIndex(i => i.TaskId === activeId);
            const overIndex = overContainer.items.findIndex(i => i.TaskId === overId);
            
            // Calculate what the target index would be
            const targetIndex = isBelow ? overIndex + 1 : overIndex;
            
            // If the target index would be the same as current position or adjacent, don't show indicator
            if (targetIndex === activeIndex || targetIndex === activeIndex + 1) {
                setDropIndicator(null);
                return;
            }
        }

        // Check MIT limit - don't allow dropping into MIT if it would exceed 3 tasks
        if (overContainer.id === 'mit' && activeContainer && activeContainer.id !== 'mit' && overContainer.items.length >= 3) {
            setDropIndicator(null);
            return;
        }

        setDropIndicator({
            overItemId: overId,
            position: isBelow ? 'after' : 'before'
        });
        return;
    }
    
    setDropIndicator(null);
  };
  
  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    const cleanup = () => {
        setDropIndicator(null);
        setActiveId(null);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
    };

    if (!over) {
        cleanup();
        return;
    }

    const activeContainer = findContainer(active.id as string);
    if (!activeContainer) {
        cleanup();
        return;
    }

    const overId = dropIndicator?.overItemId || over.id as string;
    const targetContainer = findContainer(overId);
    if (!targetContainer) {
        cleanup();
        return;
    }

    const activeItemIndex = activeContainer.items.findIndex(i => i.TaskId === active.id);
    const movedItem = activeContainer.items[activeItemIndex];

    if (!movedItem) {
        cleanup();
        return;
    }

    // Check MIT limit - prevent drop if it would exceed 3 tasks in MIT
    if (targetContainer.id === 'mit' && activeContainer.id !== 'mit' && targetContainer.items.length >= 3) {
        cleanup();
        return;
    }
    
    let targetIndex: number | undefined;

    if (dropIndicator) {
        const indicatorItemIndex = targetContainer.items.findIndex(i => i.TaskId === dropIndicator.overItemId);
        if (indicatorItemIndex !== -1) {
            targetIndex = dropIndicator.position === 'after' ? indicatorItemIndex + 1 : indicatorItemIndex;
        } else if (targetContainer.id === dropIndicator.overItemId) {
            targetIndex = 0;
        } else {
            targetIndex = targetContainer.items.length;
        }
    } else {
        const overIndex = targetContainer.items.findIndex(i => i.TaskId === over.id);
        targetIndex = overIndex !== -1 ? overIndex : targetContainer.items.length;
    }

    if (typeof targetIndex !== 'number') {
        cleanup();
        return;
    }

    const finalTargetIndex = targetIndex;

    setTasks(currentTasks => {
      // Create fresh lists from the most current state to avoid stale closures.
      const oldMitTasks = currentTasks.filter(t => t.isMIT).sort((a, b) => a.priority - b.priority);
      const oldLitTasks = currentTasks.filter(t => !t.isMIT).sort((a, b) => a.priority - b.priority);
      
      let newMitTasks = [...oldMitTasks];
      let newLitTasks = [...oldLitTasks];

      // Find the correct index in the fresh sorted arrays
      const freshActiveIndex = activeContainer.id === 'mit' 
        ? newMitTasks.findIndex(t => t.TaskId === active.id)
        : newLitTasks.findIndex(t => t.TaskId === active.id);

      if (activeContainer.id === targetContainer.id) {
        // Same container move - use splice-based approach for clearer logic
        if (targetContainer.id === 'mit') {
          const [moved] = newMitTasks.splice(freshActiveIndex, 1);
          newMitTasks.splice(finalTargetIndex, 0, moved);
        } else {
          const [moved] = newLitTasks.splice(freshActiveIndex, 1);
          newLitTasks.splice(finalTargetIndex, 0, moved);
        }
      } else {
        const sourceList = activeContainer.id === 'mit' ? newMitTasks : newLitTasks;
        const [moved] = sourceList.splice(freshActiveIndex, 1);
        
        const destinationList = targetContainer.id === 'mit' ? newMitTasks : newLitTasks;
        destinationList.splice(finalTargetIndex, 0, { ...moved, isMIT: targetContainer.id === 'mit' });
      }

      // Reprioritize both lists completely, just like the backend does.
      newMitTasks.forEach((task, index) => { task.priority = index; });
      newLitTasks.forEach((task, index) => { task.priority = index; });
      
      return [...newMitTasks, ...newLitTasks];
    });

    await updateTask(movedItem.TaskId, {
      isMIT: targetContainer.id === 'mit',
      position: finalTargetIndex,
    });
    
    // Flash the moved task
    flashTask(movedItem.TaskId);
    
    /*
      Do NOT call fetchTasks() immediately here.
      The optimistic state we just staged already mirrors the backend logic (we fully re-indexed priorities).
      Re-fetching right away re-introduces a timing race that made the UI "snap back".
      The normal polling/effect will bring fresh data soon after the backend finishes.
    */

    cleanup();
  };
  
  const handleDragCancel = () => {
    setActiveId(null);
    setDropIndicator(null);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('touchmove', handleTouchMove);
  };

  const activeTask = useMemo(() => tasks.find(task => task.TaskId === activeId), [activeId, tasks]);

  const dropAnimation: DropAnimation = { ...defaultDropAnimation };
  
  const handleMove = (taskId: string, listId: 'MIT' | 'LIT', newIndex: number) => {
    setTasks(current => {
      // Split into lists and sort by priority
      const mit = current.filter(t => t.isMIT).sort((a,b)=>a.priority-b.priority);
      const lit = current.filter(t => !t.isMIT).sort((a,b)=>a.priority-b.priority);

      // Find the task in either list
      const taskInMit = mit.find(t => t.TaskId === taskId);
      const taskInLit = lit.find(t => t.TaskId === taskId);
      const task = taskInMit || taskInLit;
      
      if (!task) return current;
      
      // Remove task from current list
      const newMit = mit.filter(t => t.TaskId !== taskId);
      const newLit = lit.filter(t => t.TaskId !== taskId);
      
      // Update task's isMIT flag based on target list
      const updatedTask = { ...task, isMIT: listId === 'MIT' };
      
      // Insert into target list at specified index (this will push existing tasks down)
      if (listId === 'MIT') {
        newMit.splice(newIndex, 0, updatedTask);
        
        // Handle MIT limit - if we now have more than 3 tasks, bump the lowest MIT task to LIT
        if (newMit.length > 3) {
          const bumpedTask = newMit.pop();
          if (bumpedTask) {
            // Add the bumped task to the beginning of LIT list
            newLit.unshift({ ...bumpedTask, isMIT: false });
          }
        }
      } else {
        newLit.splice(newIndex, 0, updatedTask);
      }
      
      // Re-index priorities for both lists
      newMit.forEach((t, i) => { t.priority = i; });
      newLit.forEach((t, i) => { t.priority = i; });
      
      return [...newMit, ...newLit];
    });

    updateTask(taskId, { 
      position: newIndex,
      isMIT: listId === 'MIT'
    });

    // Flash the moved task
    flashTask(taskId);
  };

  const taskCardProps = {
    onUpdate: handleTaskUpdate,
    onDelete: handleDeleteTask,
    onTagClick: handleTagFilterChange,
    onOpenEditModal: handleOpenEditModal,
    onMove: handleMove,
    mitListLength: mitTasks.length,
    litListLength: litTasks.length,
    flashingTasks,
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [tasks]);

  return (
    <div className="p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      {/* <DarkModeToggle /> */}
      <header className="flex justify-center mb-6">
        <SearchBar 
          tasks={openTasks}
          onResultClick={(taskId) => {
            // Optionally clear any backend search filter when using instant search
            if (searchFilter) {
              setSearchFilter('');
            }
          }}
        />
      </header>
      
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <TagFilterPills
            selectedTags={tagFilter}
            onTagClick={handleTagFilterChange}
          />
        </div>
        <div className="flex items-center space-x-4">
          <DateFilter
            selectedOption={dateFilter}
            onSelectionChange={setDateFilter}
            title="Due Date"
          />
          <DropdownFilter
            options={STATUS_OPTIONS}
            selectedOptions={statusFilter}
            onSelectionChange={handleStatusFilterChangeSingle}
            title="Status"
          />
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
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DndTaskContainer id="mit" items={mitTasks} title="MIT Tasks" taskCardProps={taskCardProps} dropIndicator={dropIndicator} />
          <DndTaskContainer id="lit" items={litTasks} title="LIT Tasks" taskCardProps={taskCardProps} dropIndicator={dropIndicator} />
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? (
            <TaskCard task={activeTask} isOverlay {...taskCardProps} />
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
