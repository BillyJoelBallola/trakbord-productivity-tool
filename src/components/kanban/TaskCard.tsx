"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Calendar, MessageSquare, GripVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TaskDetailModal from "@/components/kanban/TaskDetailModal";

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

const priorityConfig: Record<string, { dot: string; label: string }> = {
  LOW: {
    dot: "bg-neutral-300 dark:bg-neutral-600",
    label: "text-neutral-400 dark:text-neutral-500",
  },
  MEDIUM: { dot: "bg-blue-400", label: "text-blue-500 dark:text-blue-400" },
  HIGH: { dot: "bg-orange-400", label: "text-orange-500 dark:text-orange-400" },
  URGENT: { dot: "bg-red-500", label: "text-red-500 dark:text-red-400" },
};

function TaskCard({
  task,
  isViewer,
  isDragging = false,
  members,
  onTaskUpdated,
  onTaskDeleted,
}: {
  task: Task;
  isViewer: boolean;
  isDragging?: boolean;
  members?: { id: string; username: string; avatar: string | null }[];
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string, columnId: string) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id, disabled: isViewer });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.3 : 1,
  };

  const p = priorityConfig[task.priority] ?? priorityConfig.MEDIUM;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={() => !isSortableDragging && setIsModalOpen(true)}
        className={`
          group relative bg-background rounded-lg border border-neutral-200 dark:border-neutral-800
          px-3 py-3 cursor-pointer select-none
          transition-all duration-150
          hover:border-neutral-300 dark:hover:border-neutral-700
          hover:shadow-sm
          ${isDragging ? "shadow-lg rotate-1 scale-105 border-indigo-300 dark:border-indigo-700" : ""}
        `}
      >
        {/* Priority indicator — left edge accent */}
        <div
          className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${p.dot}`}
        />

        {/* Drag handle — only on hover */}
        {!isViewer && (
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-neutral-300 dark:text-neutral-600"
          >
            <GripVertical className="size-3.5" />
          </div>
        )}

        <div className="pl-2 space-y-2.5">
          {/* Title */}
          <p className="text-sm font-medium leading-snug text-neutral-900 dark:text-neutral-100 pr-4">
            {task.title}
          </p>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="text-xs px-1.5 py-px rounded-sm font-medium"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Priority label */}
              <span className={`text-xs font-medium ${p.label}`}>
                {task.priority}
              </span>

              {/* Due date */}
              {task.dueDate && (
                <span
                  className={`flex items-center gap-1 text-xs ${
                    isOverdue
                      ? "text-red-500"
                      : "text-neutral-400 dark:text-neutral-500"
                  }`}
                >
                  <Calendar className="size-3" />
                  {format(new Date(task.dueDate), "MMM d")}
                </span>
              )}

              {/* Comments */}
              {task._count.comments > 0 && (
                <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                  <MessageSquare className="size-3" />
                  {task._count.comments}
                </span>
              )}
            </div>

            {/* Assignee */}
            {task.assignee && (
              <Avatar className="size-5">
                <AvatarFallback className="text-[10px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  {task.assignee.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TaskDetailModal
          taskId={task.id}
          isViewer={isViewer}
          members={members ?? []}
          onClose={() => setIsModalOpen(false)}
          onTaskUpdated={(updatedTask) => {
            onTaskUpdated?.(updatedTask);
            setIsModalOpen(false);
          }}
          onTaskDeleted={(taskId, columnId) => {
            onTaskDeleted?.(taskId, columnId);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}

export default TaskCard;
