import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TaskDetailModal from "@/components/kanban/TaskDetailModal";
import { Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";

type Member = { id: string; username: string; avatar: string | null };
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

const priorityConfig: Record<string, { dot: string; text: string }> = {
  LOW: {
    dot: "bg-neutral-300 dark:bg-neutral-600",
    text: "text-neutral-400 dark:text-neutral-500",
  },
  MEDIUM: { dot: "bg-blue-400", text: "text-blue-600 dark:text-blue-400" },
  HIGH: { dot: "bg-orange-400", text: "text-orange-600 dark:text-orange-400" },
  URGENT: { dot: "bg-red-500", text: "text-red-600 dark:text-red-400" },
};

export function TaskRow({
  task,
  isViewer,
  members,
  isDone,
}: {
  task: Task;
  isViewer: boolean;
  members: Member[];
  isDone: boolean;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const p = priorityConfig[task.priority] ?? priorityConfig.MEDIUM;
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && !isDone;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group grid grid-cols-[1fr_80px_100px] md:grid-cols-[1fr_80px_100px_80px_60px] items-center gap-0 px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 cursor-pointer transition-colors"
      >
        {/* Title + priority dot + tags */}
        <div className="flex items-center gap-2.5 min-w-0 pl-1">
          <div className={`size-1.5 rounded-full shrink-0 ${p.dot}`} />
          <span
            className={`text-sm truncate ${
              isDone
                ? "line-through text-muted-foreground"
                : "text-neutral-800 dark:text-neutral-200"
            }`}
          >
            {task.title}
          </span>
          {task.tags.slice(0, 2).map(({ tag }) => (
            <span
              key={tag.id}
              className="hidden sm:inline-flex text-[11px] px-1.5 py-px rounded font-medium shrink-0"
              style={{
                backgroundColor: `${tag.color}18`,
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Assignee */}
        <div className="flex justify-center">
          {task.assignee ? (
            <Avatar className="size-5">
              <AvatarFallback className="text-[9px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                {task.assignee.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="size-5 rounded-full border border-dashed border-neutral-300 dark:border-neutral-600" />
          )}
        </div>

        {/* Due date */}
        <div className="flex justify-center">
          {task.dueDate ? (
            <span
              className={`flex items-center gap-1 text-xs ${
                isOverdue
                  ? "text-red-500"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              <Calendar className="size-3" />
              {format(new Date(task.dueDate), "MMM d")}
            </span>
          ) : (
            <span className="text-xs text-neutral-300 dark:text-neutral-700">
              —
            </span>
          )}
        </div>

        {/* Priority */}
        <div className="hidden md:flex justify-center">
          <span className={`text-[11px] font-medium ${p.text}`}>
            {task.priority}
          </span>
        </div>

        {/* Comments */}
        <div className="hidden md:flex justify-center">
          {task._count.comments > 0 ? (
            <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
              <MessageSquare className="size-3" />
              {task._count.comments}
            </span>
          ) : (
            <span className="text-xs text-neutral-300 dark:text-neutral-700">
              —
            </span>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TaskDetailModal
          taskId={task.id}
          isViewer={isViewer}
          members={members}
          onClose={() => setIsModalOpen(false)}
          onTaskUpdated={(updated) => {
            router.refresh();
            setIsModalOpen(false);
          }}
          onTaskDeleted={(taskId, columnId) => {
            router.refresh();
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}
