"use server";

import { getJwtSecretKey, TOKEN_NAME } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

export async function currentUser() {
  try {
    const token = (await cookies()).get(TOKEN_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (!payload.sub) return null;

    return prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
    });
  } catch {
    return null;
  }
}

export async function updateProfile({
  username,
  email,
}: {
  username: string;
  email: string;
}) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { username, email },
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while updating profile." };
  }
}

export async function updatePassword({
  currentPassword,
  newPassword,
  confirmPassword,
}: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!dbUser) return { error: "User not found." };

    const match = await bcrypt.compare(currentPassword, dbUser.password);
    if (!match) return { error: "Current password is incorrect." };
    if (newPassword !== confirmPassword)
      return { error: "Passwords do not match." };
    if (newPassword.length < 8)
      return { error: "Password must be at least 8 characters." };

    const hashed = bcrypt.hashSync(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while updating password." };
  }
}

export async function deleteAccount(username: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized." };

  if (user.username !== username) {
    return { error: "Incorrect username, try again." };
  }

  try {
    await prisma.user.delete({ where: { id: user.id } });
    (await cookies()).delete(TOKEN_NAME);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while deleting account." };
  }
}
