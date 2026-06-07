"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Plus, Trash2, MoreHorizontal } from "lucide-react";
import { deleteColumn } from "@/actions/project.action";
import { createTask } from "@/actions/task.action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TaskCard from "@/components/kanban/TaskCard";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";

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

function KanbanColumn({
  column,
  projectId,
  members,
  isViewer,
  onColumnDeleted,
  onTaskAdded,
  onTaskUpdated,
  onTaskDeleted,
}: {
  column: Column;
  projectId: string;
  members: Member[];
  isViewer: boolean;
  onColumnDeleted: (columnId: string) => void;
  onTaskAdded: (task: Task) => void;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string, columnId: string) => void;
}) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { setNodeRef } = useDroppable({ id: column.id });

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    const response = await createTask(projectId, {
      title: newTaskTitle.trim(),
      columnId: column.id,
    });

    if (response.error) {
      toast.error(response.error);
      return;
    }

    if (response.task) {
      onTaskAdded(response.task);
      setNewTaskTitle("");
      setIsAddingTask(false);
    }
  };

  const handleDeleteColumn = async () => {
    setIsDeleting(true);
    const response = await deleteColumn(column.id);
    if (response.error) {
      toast.error(response.error);
    } else {
      onColumnDeleted(column.id);
    }
    setIsDeleting(false);
    setConfirmDelete(false);
  };

  return (
    <>
      <div className="flex flex-col w-72 shrink-0 bg-neutral-50 dark:bg-neutral-900 rounded-xl border">
        {/* Column Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{column.name}</span>
            <span className="text-xs text-muted-foreground bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded-full">
              {column.tasks.length}
            </span>
          </div>
          {!isViewer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmDelete(true)}
                    className="text-red-500 hover:text-red-600 dark:hover:bg-red-950 w-full"
                  >
                    <Trash2 className="size-4" />
                    <span>Delete Column</span>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Tasks */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto p-2 space-y-2 min-h-20"
        >
          <SortableContext
            items={column.tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed h-18 mt-1  grid place-items-center bg-neutral-100 dark:bg-neutral-700/10">
                <span className="text-xs text-muted-foreground">
                  Drag/Add Task
                </span>
              </div>
            ) : (
              column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isViewer={isViewer}
                  members={members}
                  onTaskUpdated={onTaskUpdated}
                  onTaskDeleted={onTaskDeleted}
                />
              ))
            )}
          </SortableContext>
        </div>

        {/* Add Task */}
        {!isViewer && (
          <div className="p-2 border-t">
            {isAddingTask ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddTask();
                    }
                    if (e.key === "Escape") {
                      setIsAddingTask(false);
                      setNewTaskTitle("");
                    }
                  }}
                  placeholder="Task title..."
                  className="w-full text-sm p-2 rounded-lg border resize-none bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={handleAddTask}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskTitle("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="size-4 mr-1" />
                Add task
              </Button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Column"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{column.name}</span>?<br />
            All tasks in this column will be deleted.
          </>
        }
        onConfirm={handleDeleteColumn}
        isLoading={isDeleting}
        confirmLabel="Delete"
      />
    </>
  );
}

export default KanbanColumn;
