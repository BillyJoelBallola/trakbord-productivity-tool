"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@/actions/user.action";
import { workspaceSchema } from "@/lib/validations";
import { apiAj } from "@/lib/arcjet";
import { request } from "@arcjet/next";

function generateSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${Date.now()}`;
}

export async function getWorkspaces() {
  const user = await currentUser();
  if (!user) return null;

  return prisma.workspace.findMany({
    where: {
      members: { some: { userId: user.id } },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
      },
      _count: { select: { projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWorkspace(slug: string) {
  const user = await currentUser();
  if (!user) return null;

  return prisma.workspace.findFirst({
    where: {
      slug,
      members: { some: { userId: user.id } },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, username: true, email: true, avatar: true },
          },
        },
      },
      projects: {
        include: {
          _count: { select: { columns: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createWorkspace(data: {
  name: string;
  description?: string;
}) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  const req = await request();
  const decision = await apiAj.protect(req);
  if (decision.isDenied()) return { error: "Too many requests." };

  const parsed = workspaceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const slug = generateSlug(parsed.data.name);

    const workspace = await prisma.workspace.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    return { success: true, workspace };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while creating workspace." };
  }
}

export async function updateWorkspace(
  id: string,
  data: { name: string; description?: string },
) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  const parsed = workspaceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    // check if user is owner or admin
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!member)
      return { error: "You don't have permission to update this workspace." };

    const workspace = await prisma.workspace.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
      },
    });

    return { success: true, workspace };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while updating workspace." };
  }
}

export async function deleteWorkspace(id: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId: id, userId: user.id, role: "OWNER" },
    });

    console.log(member);

    if (!member) return { error: "Only the owner can delete this workspace." };

    await prisma.workspace.delete({ where: { id } });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while deleting workspace." };
  }
}

export async function inviteMember(workspaceId: string, email: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    // check if inviter is owner or admin
    const inviter = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!inviter)
      return { error: "You don't have permission to invite members." };

    // find user by email
    const invitee = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitee) return { error: "No user found with that email." };

    // check if already a member
    const existing = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: invitee.id },
    });

    if (existing)
      return { error: "User is already a member of this workspace." };

    await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: invitee.id,
        role: "MEMBER",
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while inviting member." };
  }
}

export async function removeMember(workspaceId: string, memberId: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const requester = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!requester)
      return { error: "You don't have permission to remove members." };

    // prevent removing the owner
    const targetMember = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: memberId },
    });

    if (targetMember?.role === "OWNER") {
      return { error: "Cannot remove the workspace owner." };
    }

    await prisma.workspaceMember.deleteMany({
      where: { workspaceId, userId: memberId },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while removing member." };
  }
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  role: "ADMIN" | "MEMBER" | "VIEWER",
) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const requester = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: user.id, role: "OWNER" },
    });

    if (!requester) return { error: "Only the owner can change member roles." };

    await prisma.workspaceMember.updateMany({
      where: { workspaceId, userId: memberId },
      data: { role },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while updating member role." };
  }
}

export async function leaveWorkspace(workspaceId: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: user.id },
    });

    if (!member) return { error: "You are not a member of this workspace." };
    if (member.role === "OWNER") {
      return {
        error:
          "Owner cannot leave the workspace. Transfer ownership or delete it.",
      };
    }

    await prisma.workspaceMember.deleteMany({
      where: { workspaceId, userId: user.id },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while leaving workspace." };
  }
}

export async function searchUsers(query: string) {
  const user = await currentUser();
  if (!user) return [];
  if (query.length < 3) return [];

  return prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } },
      ],
      NOT: { id: user.id },
    },
    select: { id: true, username: true, email: true },
    take: 5,
  });
}

export async function getCurrentWorkspaceMember(workspaceSlug: string) {
  const user = await currentUser();
  if (!user) return null;

  const workspace = await prisma.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      members: { some: { userId: user.id } },
    },
    select: {
      members: {
        where: { userId: user.id },
        select: {
          role: true,
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      },
    },
  });

  if (!workspace) return null;

  const member = workspace.members[0];
  if (!member) return null;

  return {
    id: member.user.id,
    username: member.user.username,
    avatar: member.user.avatar,
    role: member.role,
  };
}
