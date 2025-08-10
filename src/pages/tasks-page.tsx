import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
// import { PageLayout } from '../components/page-layout';
import { EditTaskModal } from '../components/edit-task-modal';
// import { DarkModeToggle } from '../components/DarkModeToggle';
import { TaskCard } from '../components/TaskCard';
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

  const mitTasks = useMemo(() => {
    const allMitTasks = tasks.filter(task => task.isMIT).sort((a, b) => a.priority - b.priority);
    // Enforce MIT limit: only first 3 tasks can be MIT
    return allMitTasks.slice(0, 3);
  }, [tasks]);
  
  const litTasks = useMemo(() => {
    const allMitTasks = tasks.filter(task => task.isMIT).sort((a, b) => a.priority - b.priority);
    const allLitTasks = tasks.filter(task => !task.isMIT).sort((a, b) => a.priority - b.priority);
    
    // Any MIT tasks beyond the first 3 should be treated as LIT
    const overflowMitTasks = allMitTasks.slice(3).map(task => ({ ...task, isMIT: false }));
    
    return [...overflowMitTasks, ...allLitTasks].sort((a, b) => a.priority - b.priority);
  }, [tasks]);
  
  // Open tasks for search (excludes completed and canceled)
  const openTasks = useMemo(() => tasks.filter(task => task.status === 'Open' || task.status === 'Waiting'), [tasks]);

  // Combined tasks for unified list (MIT first, then LIT)
  const allTasks = useMemo(() => [...mitTasks, ...litTasks], [mitTasks, litTasks]);

  const handleMouseMove = (e: MouseEvent) => { pointerY.current = e.clientY; };
  const handleTouchMove = (e: TouchEvent) => { pointerY.current = e.touches[0].clientY; };

  const flashTask = useCallback((taskId: string) => {
    setFlashingTasks(prev => new Set(prev).add(taskId));
    
    // Remove the flash after animation completes - longer duration for subtle fade
    setTimeout(() => {
      setFlashingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 1200); // 1.2 seconds for a gentle, noticeable fade
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findTaskInUnifiedList = (taskId: string) => {
    const taskIndex = allTasks.findIndex(task => task.TaskId === taskId);
    if (taskIndex === -1) return null;
    
    const task = allTasks[taskIndex];
    return {
      task,
      index: taskIndex,
      globalIndex: taskIndex,
      isMIT: task.isMIT,
      localIndex: task.isMIT ? mitTasks.findIndex(t => t.TaskId === taskId) : litTasks.findIndex(t => t.TaskId === taskId)
    };
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

    const activeTask = findTaskInUnifiedList(activeId);
    const overTask = findTaskInUnifiedList(overId);
    
    if (!activeTask || !overTask) {
      setDropIndicator(null);
      return;
    }

    const overRect = over.rect;
    const isBelow = (pointerY.current - overRect.top) > (overRect.height / 2);
    
    // Calculate what the target position would be
    const targetIndex = isBelow ? overTask.globalIndex + 1 : overTask.globalIndex;
    
    // Don't show indicator if dropping in the same position or adjacent
    if (targetIndex === activeTask.globalIndex || targetIndex === activeTask.globalIndex + 1) {
        setDropIndicator(null);
        return;
    }

    // Allow dropping LIT task into MIT positions even if it would exceed 3 tasks
    // The handleDragEnd function will handle bumping the lowest MIT task to LIT

    setDropIndicator({
        overItemId: overId,
        position: isBelow ? 'after' : 'before'
    });
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

    const activeTask = findTaskInUnifiedList(active.id as string);
    const overTask = findTaskInUnifiedList(over.id as string);
    
    if (!activeTask || !overTask) {
        cleanup();
        return;
    }

    // Calculate target position
    let targetGlobalIndex: number;
    if (dropIndicator) {
        const dropTask = findTaskInUnifiedList(dropIndicator.overItemId);
        if (!dropTask) {
            cleanup();
            return;
        }
        targetGlobalIndex = dropIndicator.position === 'after' ? dropTask.globalIndex + 1 : dropTask.globalIndex;
    } else {
        targetGlobalIndex = overTask.globalIndex;
    }

    // Allow moving LIT task to MIT section even if it would exceed the limit
    // The overflow handling below will bump the lowest MIT task to LIT

    // MIT section is ALWAYS the first 3 positions (0, 1, 2)
    // LIT section starts after the MIT section
    const mitSectionSize = Math.min(mitTasks.length, 3);
    
    // Calculate the new MIT status based on target position
    let newIsMIT: boolean;
    let newLocalIndex: number;
    
    if (targetGlobalIndex <= mitSectionSize) {
        // Dropping in MIT section (positions 0-2, or within current MIT if less than 3)
        newIsMIT = true;
        newLocalIndex = targetGlobalIndex;
    } else {
        // Dropping in LIT section
        newIsMIT = false;
        newLocalIndex = targetGlobalIndex - mitSectionSize;
    }

    setTasks(currentTasks => {
        const newMitTasks = [...mitTasks];
        const newLitTasks = [...litTasks];
        
        // Remove from current position
        if (activeTask.isMIT) {
            newMitTasks.splice(activeTask.localIndex, 1);
        } else {
            newLitTasks.splice(activeTask.localIndex, 1);
        }
        
        // Insert at new position
        const updatedTask = { ...activeTask.task, isMIT: newIsMIT };
        if (newIsMIT) {
            newMitTasks.splice(newLocalIndex, 0, updatedTask);
            // If MIT list now has > 3 tasks, move the last one to LIT
            if (newMitTasks.length > 3) {
                const bumpedTask = newMitTasks.pop();
                if (bumpedTask) {
                    newLitTasks.unshift({ ...bumpedTask, isMIT: false });
                }
            }
        } else {
            newLitTasks.splice(newLocalIndex, 0, updatedTask);
        }
        
        // Re-index priorities for both lists (1-based)
        newMitTasks.forEach((task, index) => { task.priority = index + 1; });
        newLitTasks.forEach((task, index) => { task.priority = index + 1; });
        
        return [...newMitTasks, ...newLitTasks];
    });

    await updateTask(activeTask.task.TaskId, {
        isMIT: newIsMIT,
        position: newLocalIndex,
    });
    
    // Flash the moved task
    flashTask(activeTask.task.TaskId);
    
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
      
      // Re-index priorities for both lists (1-based)
      newMit.forEach((t, i) => { t.priority = i + 1; });
      newLit.forEach((t, i) => { t.priority = i + 1; });
      
      // Update the backend with the new priority and isMIT status
      const newPriority = newIndex + 1; // Priority is 1-based for both MIT and LIT
      const newIsMIT = listId === 'MIT';
      
      // Send the corrected data to backend
      updateTask(taskId, { 
        priority: newPriority,
        isMIT: newIsMIT
      }).catch(error => {
        console.error('Failed to persist task move:', error);
        // Could add error handling/rollback here
      });
      
      return [...newMit, ...newLit];
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
    <div className="p-2 sm:p-3 lg:p-6 bg-gray-900 text-white min-h-screen">
      {/* <DarkModeToggle /> */}
      <header className="flex justify-center mb-3 sm:mb-4">
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
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3 sm:gap-4">
        <div className="w-full sm:flex-1 sm:min-w-[300px]">
          <TagFilterPills
            selectedTags={tagFilter}
            onTagClick={handleTagFilterChange}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors min-h-[44px] flex-1 sm:flex-none"
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
        {/* Mobile: Single Column Layout */}
        <div className="lg:hidden max-w-4xl mx-auto">
          {/* Section Headers */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm font-medium text-white">MIT Tasks ({mitTasks.length}/3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-sm font-medium text-white">LIT Tasks ({litTasks.length})</span>
            </div>
          </div>

          {/* Single Unified List */}
          <div className="space-y-2">
            {/* MIT Tasks First */}
            {mitTasks.map((task, index) => (
              <React.Fragment key={task.TaskId}>
                {dropIndicator?.overItemId === task.TaskId && dropIndicator.position === 'before' && <DropIndicator />}
                <TaskCard 
                  task={task} 
                  {...taskCardProps}
                  listId="MIT"
                  index={index}
                />
                {dropIndicator?.overItemId === task.TaskId && dropIndicator.position === 'after' && <DropIndicator />}
              </React.Fragment>
            ))}
            
            {/* Visual separator between MIT and LIT */}
            {mitTasks.length > 0 && litTasks.length > 0 && (
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-900 px-3 text-gray-400">Less Important Tasks</span>
                </div>
              </div>
            )}

            {/* LIT Tasks */}
            {litTasks.map((task, index) => (
              <React.Fragment key={task.TaskId}>
                {dropIndicator?.overItemId === task.TaskId && dropIndicator.position === 'before' && <DropIndicator />}
                <TaskCard 
                  task={task} 
                  {...taskCardProps}
                  listId="LIT"
                  index={index}
                />
                {dropIndicator?.overItemId === task.TaskId && dropIndicator.position === 'after' && <DropIndicator />}
              </React.Fragment>
            ))}

            {/* Empty State */}
            {mitTasks.length === 0 && litTasks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No tasks yet</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first task</p>
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setIsEditModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Create First Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Two Column Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-6">
            {/* MIT Column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 bg-green-600 rounded"></div>
                <h2 className="text-xl font-bold text-white">MIT - Most Important Tasks</h2>
                <span className="text-sm font-medium text-white bg-green-600/20 px-2 py-1 rounded">
                  {mitTasks.length}/3
                </span>
              </div>
              
              <div className="space-y-3 min-h-[200px]">
                {mitTasks.map((task, index) => (
                  <React.Fragment key={task.TaskId}>
                    {dropIndicator?.overItemId === task.TaskId && dropIndicator.position === 'before' && <DropIndicator />}
                    <TaskCard 
                      task={task} 
                      {...taskCardProps}
                      listId="MIT"
                      index={index}
                    />
                    {dropIndicator?.overItemId === task.TaskId && dropIndicator.position === 'after' && <DropIndicator />}
                  </React.Fragment>
                ))}
                
                {/* MIT Empty State */}
                {mitTasks.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-green-600/30 rounded-lg">
                    <div className="text-green-400/60 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-green-300/60 text-sm">No MIT tasks yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* LIT Column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 bg-blue-600 rounded"></div>
                <h2 className="text-xl font-bold text-white">LIT - Less Important Tasks</h2>
                <span className="text-sm font-medium text-white bg-blue-600/20 px-2 py-1 rounded">
                  {litTasks.length}
                </span>
              </div>
              
              <div className="space-y-3 min-h-[200px]">
                {litTasks.map((task, index) => (
                  <React.Fragment key={task.TaskId}>
                    {dropIndicator?.overItemId === task.TaskId && dropIndicator.position === 'before' && <DropIndicator />}
                    <TaskCard 
                      task={task} 
                      {...taskCardProps}
                      listId="LIT"
                      index={index}
                    />
                    {dropIndicator?.overItemId === task.TaskId && dropIndicator.position === 'after' && <DropIndicator />}
                  </React.Fragment>
                ))}
                
                {/* LIT Empty State */}
                {litTasks.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-blue-600/30 rounded-lg">
                    <div className="text-blue-400/60 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-blue-300/60 text-sm">No LIT tasks yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Empty State - when both columns are empty */}
          {mitTasks.length === 0 && litTasks.length === 0 && (
            <div className="text-center py-12 mt-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first task</p>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setIsEditModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Create First Task
              </button>
            </div>
          )}
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
        mitTaskCount={mitTasks.length}
        litTaskCount={litTasks.length}
      />
    </div>
  );
};
