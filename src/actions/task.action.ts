"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@/actions/user.action";
import { taskSchema, commentSchema } from "@/lib/validations";
import { pusherServer } from "@/lib/pusher-server";

export async function createTask(
  projectId: string,
  data: {
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate?: string;
    assigneeId?: string;
    columnId: string;
  },
) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  const parsed = taskSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const tasksInColumn = await prisma.task.count({
      where: { columnId: parsed.data.columnId },
    });

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority ?? "MEDIUM",
        dueDate: parsed.data.dueDate
          ? new Date(parsed.data.dueDate)
          : undefined,
        assigneeId: parsed.data.assigneeId || null,
        columnId: parsed.data.columnId,
        projectId,
        createdById: user.id,
        order: tasksInColumn,
      },
      include: {
        assignee: { select: { id: true, username: true, avatar: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
    });

    // 👇 trigger real-time event
    await pusherServer.trigger(`project-${projectId}`, "task:created", {
      task,
      columnId: parsed.data.columnId,
    });

    return { success: true, task };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while creating task." };
  }
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate?: string;
    assigneeId?: string;
  },
) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assigneeId: data.assigneeId || null,
      },
      include: {
        assignee: { select: { id: true, username: true, avatar: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
    });

    // 👇 trigger real-time event
    await pusherServer.trigger(`project-${task.projectId}`, "task:updated", {
      task,
    });

    return { success: true, task };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while updating task." };
  }
}

export async function deleteTask(taskId: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return { error: "Task not found." };

    await prisma.task.delete({ where: { id: taskId } });

    // 👇 trigger real-time event
    await pusherServer.trigger(`project-${task.projectId}`, "task:deleted", {
      taskId,
      columnId: task.columnId,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while deleting task." };
  }
}

export async function moveTask({
  taskId,
  newColumnId,
  newOrder,
  projectId,
}: {
  taskId: string;
  newColumnId: string;
  newOrder: number;
  projectId: string;
}) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: newColumnId,
        order: newOrder,
      },
    });

    // 👇 trigger real-time event for all connected clients
    await pusherServer.trigger(`project-${projectId}`, "task:moved", {
      taskId,
      newColumnId,
      newOrder,
    });

    return { success: true, task };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while moving task." };
  }
}

export async function getTask(taskId: string) {
  const user = await currentUser();
  if (!user) return null;

  return prisma.task.findFirst({
    where: {
      id: taskId,
      column: {
        project: {
          workspace: { members: { some: { userId: user.id } } },
        },
      },
    },
    include: {
      assignee: { select: { id: true, username: true, avatar: true } },
      createdBy: { select: { id: true, username: true, avatar: true } },
      tags: { include: { tag: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
      },
      column: true,
    },
  });
}

export async function addComment(taskId: string, content: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  const parsed = commentSchema.safeParse({ content });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return { error: "Task not found." };

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        taskId,
        userId: user.id,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });

    // 👇 real-time comment
    await pusherServer.trigger(`task-${taskId}`, "comment:added", { comment });

    return { success: true, comment };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while adding comment." };
  }
}

export async function deleteComment(commentId: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) return { error: "Comment not found." };
    if (comment.userId !== user.id)
      return { error: "You can only delete your own comments." };

    await prisma.comment.delete({ where: { id: commentId } });

    await pusherServer.trigger(`task-${comment.taskId}`, "comment:deleted", {
      commentId,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while deleting comment." };
  }
}
