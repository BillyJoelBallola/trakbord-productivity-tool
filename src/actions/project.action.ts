"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@/actions/user.action";
import { projectSchema } from "@/lib/validations";
import { Role } from "@/generated/prisma";

const DEFAULT_COLUMNS = ["Todo", "In Progress", "Review", "Done"];

async function checkWorkspaceAccess(
  workspaceId: string,
  userId: string,
  roles: Role[] = ["OWNER", "ADMIN", "MEMBER"],
) {
  return prisma.workspaceMember.findFirst({
    where: { workspaceId, userId, role: { in: roles } },
  });
}

export async function getProject(projectId: string) {
  const user = await currentUser();
  if (!user) return null;

  return prisma.project.findFirst({
    where: {
      id: projectId,
      workspace: { members: { some: { userId: user.id } } },
    },
    include: {
      workspace: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, username: true, avatar: true },
              },
            },
          },
        },
      },
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
            include: {
              assignee: {
                select: { id: true, username: true, avatar: true },
              },
              tags: { include: { tag: true } },
              _count: { select: { comments: true } },
            },
          },
        },
      },
    },
  });
}

export async function createProject(
  workspaceId: string,
  data: { name: string; description?: string; color?: string },
) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const member = await checkWorkspaceAccess(workspaceId, user.id);
  if (!member) return { error: "You don't have access to this workspace." };

  try {
    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        color: parsed.data.color ?? "#6366f1",
        workspaceId,
        columns: {
          create: DEFAULT_COLUMNS.map((name, index) => ({
            name,
            order: index,
          })),
        },
      },
    });

    return { success: true, project };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while creating project." };
  }
}

export async function updateProject(
  projectId: string,
  data: { name: string; description?: string; color?: string },
) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspace: { members: { some: { userId: user.id } } },
      },
      include: { workspace: true },
    });

    if (!project) return { error: "Project not found." };

    const member = await checkWorkspaceAccess(project.workspaceId, user.id, [
      "OWNER",
      "ADMIN",
    ]);
    if (!member)
      return { error: "You don't have permission to update this project." };

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        color: parsed.data.color,
      },
    });

    return { success: true, project: updated };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while updating project." };
  }
}

export async function deleteProject(projectId: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspace: { members: { some: { userId: user.id } } },
      },
    });

    if (!project) return { error: "Project not found." };

    const member = await checkWorkspaceAccess(project.workspaceId, user.id, [
      "OWNER",
      "ADMIN",
    ]);
    if (!member)
      return { error: "You don't have permission to delete this project." };

    await prisma.project.delete({ where: { id: projectId } });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while deleting project." };
  }
}

export async function addColumn(projectId: string, name: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspace: { members: { some: { userId: user.id } } },
      },
      include: { columns: true },
    });

    if (!project) return { error: "Project not found." };

    const column = await prisma.column.create({
      data: {
        name,
        order: project.columns.length,
        projectId,
      },
    });

    return { success: true, column };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while adding column." };
  }
}

export async function deleteColumn(columnId: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const column = await prisma.column.findFirst({
      where: {
        id: columnId,
        project: {
          workspace: { members: { some: { userId: user.id } } },
        },
      },
    });

    if (!column) return { error: "Column not found." };

    await prisma.column.delete({ where: { id: columnId } });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while deleting column." };
  }
}
