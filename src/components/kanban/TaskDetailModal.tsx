"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  X,
  Trash2,
  Calendar,
  User,
  Flag,
  MessageSquare,
  Loader,
  Send,
} from "lucide-react";
import {
  getTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
} from "@/actions/task.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrentWorkspaceMember } from "@/actions/workspace.action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import { priorityColor } from "@/lib/priorityConfig";
import { Textarea } from "@/components/ui/textarea";
import { pusherClient } from "@/lib/pusher-client";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

function TaskDetailModal({
  taskId,
  isViewer,
  members,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}: {
  taskId: string;
  isViewer: boolean;
  members: IMember[];
  onClose: () => void;
  onTaskUpdated: (task: any) => void;
  onTaskDeleted: (taskId: string, columnId: string) => void;
}) {
  const pathname = usePathname();
  const workspaceSlug = pathname.split("/")[2];
  const [task, setTask] = useState<ITaskModal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [workspaceMember, setWorkspaceMember] = useState<
    (IMember & { role: string }) | null
  >(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      try {
        const [taskData, member] = await Promise.all([
          getTask(taskId),
          getCurrentWorkspaceMember(workspaceSlug),
        ]);

        if (!cancelled) {
          if (taskData) {
            setTask(taskData as any);
            setTitle(taskData.title);
            setDescription(taskData.description ?? "");
            setPriority(taskData.priority);
            setDueDate(
              taskData.dueDate
                ? format(new Date(taskData.dueDate), "yyyy-MM-dd")
                : "",
            );
            setAssigneeId(taskData.assignee?.id ?? "none");
          }
          if (member) setWorkspaceMember(member);
        }
      } catch {
        if (!cancelled) toast.error("An error occurred.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  // real-time comments
  useEffect(() => {
    if (!task) return;
    const channel = pusherClient.subscribe(`task-${taskId}`);

    channel.bind("comment:added", ({ comment }: { comment: IComment }) => {
      setTask((prev) =>
        prev ? { ...prev, comments: [...prev.comments, comment] } : prev,
      );
    });

    channel.bind("comment:deleted", ({ commentId }: { commentId: string }) => {
      setTask((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.filter((c) => c.id !== commentId),
            }
          : prev,
      );
    });

    return () => {
      pusherClient.unsubscribe(`task-${taskId}`);
    };
  }, [taskId, task]);

  const handleSave = async () => {
    if (!task) return;
    setIsSaving(true);

    const response = await updateTask(taskId, {
      title,
      description,
      priority: priority as any,
      dueDate: dueDate || undefined,
      assigneeId: assigneeId === "none" ? undefined : assigneeId,
    });

    if (response.error) {
      toast.error(response.error);
    } else if (response.task) {
      toast.success("Task updated.");
      onTaskUpdated(response.task);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    setIsDeleting(true);

    const response = await deleteTask(taskId);
    if (response.error) {
      toast.error(response.error);
      setIsDeleting(false);
      return;
    }

    toast.success("Task deleted.");
    onTaskDeleted(taskId, task.columnId);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setIsCommenting(true);

    const response = await addComment(taskId, comment);
    if (response.error) {
      toast.error(response.error);
    } else {
      setComment("");
    }
    setIsCommenting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const response = await deleteComment(commentId);
    if (response.error) toast.error(response.error);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-background rounded-xl border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !task ? (
            <div className="p-6 text-center text-muted-foreground">
              Task not found.
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6 p-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-xs ${priorityColor[task.priority]}`}
                    >
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      in <span className="font-medium">{task.column.name}</span>
                    </span>
                  </div>
                  {isViewer ? (
                    <h2 className="text-xl font-semibold">{task.title}</h2>
                  ) : (
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xl font-semibold w-full bg-transparent border-none outline-none focus:ring-0 p-0"
                    />
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="md:col-span-2 space-y-4">
                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    {isViewer ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {task.description || "No description."}
                      </p>
                    ) : (
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description..."
                        className="resize-none"
                        rows={4}
                      />
                    )}
                  </div>

                  {/* Comments */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="size-4" />
                      Comments ({task.comments.length})
                    </label>

                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {task.comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No comments yet.
                        </p>
                      ) : (
                        task.comments.map((c) => (
                          <div key={c.id} className="flex gap-3">
                            <Avatar className="size-7 shrink-0">
                              <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                                {c.user.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">
                                    {c.user.username}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(
                                      new Date(c.createdAt),
                                      "MMM d, h:mm a",
                                    )}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="text-xs font-semibold text-muted-foreground hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                              <p className="text-sm bg-neutral-50 dark:bg-neutral-900 rounded-lg p-2">
                                {c.content}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="resize-none text-sm"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleComment();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        onClick={handleComment}
                        disabled={isCommenting || !comment.trim()}
                        className="shrink-0 self-end"
                      >
                        {isCommenting ? (
                          <Loader className="size-4 animate-spin" />
                        ) : (
                          <Send className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                    {/* Priority */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Flag className="size-3" /> Priority
                      </label>
                      {isViewer ? (
                        <Badge className={`text-xs ${priorityColor[priority]}`}>
                          {priority}
                        </Badge>
                      ) : (
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger className="w-full h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Assignee */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <User className="size-3" /> Assignee
                      </label>
                      {isViewer ? (
                        <p className="text-sm">
                          {task.assignee?.username ?? "Unassigned"}
                        </p>
                      ) : (
                        <Select
                          value={assigneeId}
                          onValueChange={setAssigneeId}
                        >
                          <SelectTrigger className="w-full h-8 text-sm">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
                            {members.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="size-3" /> Due Date
                    </label>
                    {isViewer ? (
                      <p className="text-sm">
                        {task.dueDate
                          ? format(new Date(task.dueDate), "MMM dd, yyyy")
                          : "No due date"}
                      </p>
                    ) : (
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full h-8 text-sm px-3 rounded-md border bg-background"
                      />
                    )}
                  </div>

                  {/* Created by */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Created by
                    </label>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                          {task.createdBy.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.createdBy.username}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isViewer && (
                    <div className="space-y-2 pt-2 border-t">
                      <Button
                        className="w-full"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader className="size-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      {workspaceMember?.role !== "MEMBER" && (
                        <Button
                          variant="outline"
                          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => setConfirmDelete(true)}
                        >
                          <Trash2 className="size-4" />
                          Delete Task
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmLabel="Delete"
      />
    </>
  );
}

export default TaskDetailModal;
