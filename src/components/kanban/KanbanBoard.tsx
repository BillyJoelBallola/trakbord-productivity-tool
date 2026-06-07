"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { moveTask } from "@/actions/task.action";
import { pusherClient } from "@/lib/pusher-client";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import TaskCard from "@/components/kanban/TaskCard";
import AddColumnButton from "@/components/kanban/AddColumnButton";

type Tag = { tag: { id: string; name: string; color: string } };
type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: Date | null;
  order: number;
  columnId: string;
  projectId: string;
  assignee: { id: string; username: string; avatar: string | null } | null;
  tags: Tag[];
  _count: { comments: number };
};
type Column = { id: string; name: string; order: number; tasks: Task[] };
type Member = { id: string; username: string; avatar: string | null };

function KanbanBoard({
  project,
  currentUserId,
  members,
  isViewer,
}: {
  project: { id: string; columns: Column[] };
  currentUserId: string;
  members: Member[];
  isViewer: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [columns, setColumns] = useState<Column[]>(project.columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const columnsRef = useRef(columns);
  const activeTaskRef = useRef<Task | null>(null);
  const isDraggingRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const channel = pusherClient.subscribe(`project-${project.id}`);

    channel.bind(
      "task:created",
      ({ task, columnId }: { task: Task; columnId: string }) => {
        setColumns((prev) =>
          prev.map((col) =>
            col.id === columnId ? { ...col, tasks: [...col.tasks, task] } : col,
          ),
        );
      },
    );

    channel.bind("task:updated", ({ task }: { task: Task }) => {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => (t.id === task.id ? task : t)),
        })),
      );
    });

    channel.bind(
      "task:deleted",
      ({ taskId, columnId }: { taskId: string; columnId: string }) => {
        setColumns((prev) =>
          prev.map((col) =>
            col.id === columnId
              ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
              : col,
          ),
        );
      },
    );

    channel.bind(
      "task:moved",
      ({
        taskId,
        newColumnId,
        newOrder,
      }: {
        taskId: string;
        newColumnId: string;
        newOrder: number;
      }) => {
        // 👇 skip if current user is dragging — their state is already updated
        if (isDraggingRef.current) return;

        setColumns((prev) => {
          const sourceCol = prev.find((c) =>
            c.tasks.some((t) => t.id === taskId),
          );
          const task = sourceCol?.tasks.find((t) => t.id === taskId);
          if (!task) return prev;

          return prev.map((col) => {
            if (col.id === sourceCol?.id) {
              return {
                ...col,
                tasks: col.tasks.filter((t) => t.id !== taskId),
              };
            }
            if (col.id === newColumnId) {
              const newTasks = [...col.tasks];
              newTasks.splice(newOrder, 0, {
                ...task,
                columnId: newColumnId,
                order: newOrder,
              });
              return { ...col, tasks: newTasks };
            }
            return col;
          });
        });
      },
    );

    return () => {
      pusherClient.unsubscribe(`project-${project.id}`);
    };
  }, [project.id]);

  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true;
    const task = columnsRef.current
      .flatMap((c) => c.tasks)
      .find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
      activeTaskRef.current = task;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentColumns = columnsRef.current;

    const activeColumn = currentColumns.find((c) =>
      c.tasks.some((t) => t.id === activeId),
    );
    const overColumn =
      currentColumns.find((c) => c.id === overId) ??
      currentColumns.find((c) => c.tasks.some((t) => t.id === overId));

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    setColumns((prev) => {
      const activeTask = prev
        .flatMap((c) => c.tasks)
        .find((t) => t.id === activeId);
      if (!activeTask) return prev;

      const overTaskIndex = overColumn.tasks.findIndex((t) => t.id === overId);
      const insertIndex =
        overTaskIndex >= 0 ? overTaskIndex : overColumn.tasks.length;

      return prev.map((col) => {
        if (col.id === activeColumn.id) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) };
        }
        if (col.id === overColumn.id) {
          const newTasks = [...col.tasks];
          newTasks.splice(insertIndex, 0, {
            ...activeTask,
            columnId: overColumn.id,
          });
          return { ...col, tasks: newTasks };
        }
        return prev.find((c) => c.id === col.id) ?? col;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 1000);

    if (!over) {
      isDraggingRef.current = false;
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentColumns = columnsRef.current;

    const activeColumn = currentColumns.find((c) =>
      c.tasks.some((t) => t.id === activeId),
    );
    const overColumn =
      currentColumns.find((c) => c.id === overId) ??
      currentColumns.find((c) => c.tasks.some((t) => t.id === overId));

    if (!activeColumn || !overColumn) {
      isDraggingRef.current = false;
      return;
    }

    // same column reordering
    if (activeColumn.id === overColumn.id) {
      const oldIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
      const newIndex = activeColumn.tasks.findIndex((t) => t.id === overId);

      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        setColumns((prev) =>
          prev.map((col) =>
            col.id === activeColumn.id
              ? { ...col, tasks: arrayMove(col.tasks, oldIndex, newIndex) }
              : col,
          ),
        );
      }
    }

    const newOrder = overColumn.tasks.findIndex((t) => t.id === activeId);

    const response = await moveTask({
      taskId: activeId,
      newColumnId: overColumn.id,
      newOrder: newOrder >= 0 ? newOrder : overColumn.tasks.length,
      projectId: project.id,
    });

    if (response.error) {
      toast.error(response.error);
      setColumns(project.columns);
    }

    isDraggingRef.current = false;
  };

  if (!isMounted) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-180px)]">
        {project.columns.map((column) => (
          <div
            key={column.id}
            className="w-72 shrink-0 bg-neutral-50 dark:bg-neutral-900 rounded-xl border h-32 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-180px)]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            projectId={project.id}
            members={members}
            isViewer={isViewer}
            onColumnDeleted={(columnId) =>
              setColumns((prev) => prev.filter((c) => c.id !== columnId))
            }
            onTaskAdded={(task) =>
              setColumns((prev) =>
                prev.map((col) =>
                  col.id === task.columnId
                    ? { ...col, tasks: [...col.tasks, task] }
                    : col,
                ),
              )
            }
            onTaskUpdated={(updatedTask) =>
              setColumns((prev) =>
                prev.map((col) => ({
                  ...col,
                  tasks: col.tasks.map((t) =>
                    t.id === updatedTask.id ? updatedTask : t,
                  ),
                })),
              )
            }
            onTaskDeleted={(taskId, columnId) =>
              setColumns((prev) =>
                prev.map((col) =>
                  col.id === columnId
                    ? {
                        ...col,
                        tasks: col.tasks.filter((t) => t.id !== taskId),
                      }
                    : col,
                ),
              )
            }
          />
        ))}

        <DragOverlay>
          {activeTask && (
            <TaskCard task={activeTask} isViewer={isViewer} isDragging />
          )}
        </DragOverlay>

        {/* 👇 moved inside DndContext */}
        {!isViewer && (
          <AddColumnButton
            projectId={project.id}
            onColumnAdded={(column) =>
              setColumns((prev) => [...prev, { ...column, tasks: [] }])
            }
          />
        )}
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
