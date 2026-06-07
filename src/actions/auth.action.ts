"use server";

import { getJwtSecretKey, TOKEN_NAME } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { authAj } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { signUpSchema, signInSchema } from "@/lib/validations";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function signUp(data: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const req = await request();
  const decision = await authAj.protect(req);
  if (decision.isDenied()) {
    return { error: "Too many attempts. Please try again later." };
  }

  const parsed = signUpSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: parsed.data.username }, { email: parsed.data.email }],
      },
    });

    if (existing) return { error: "Username or email already exists." };

    const hashedPassword = bcrypt.hashSync(parsed.data.password, 10);

    const user = await prisma.user.create({
      data: {
        username: parsed.data.username,
        email: parsed.data.email,
        password: hashedPassword,
      },
    });

    // create a personal workspace on sign up
    const slug = `${generateSlug(parsed.data.username)}-workspace`;
    await prisma.workspace.create({
      data: {
        name: `${parsed.data.username}'s Workspace`,
        slug,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while signing up." };
  }
}

export async function signIn(data: { username: string; password: string }) {
  const req = await request();
  const decision = await authAj.protect(req);
  if (decision.isDenied()) {
    return { error: "Too many attempts. Please try again later." };
  }

  const parsed = signInSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const user = await prisma.user.findUnique({
      where: { username: parsed.data.username },
      select: { id: true, username: true, password: true },
    });

    if (!user) return { error: "User not found." };

    const passwordMatch = await bcrypt.compare(
      parsed.data.password,
      user.password,
    );
    if (!passwordMatch) return { error: "Invalid password." };

    const token = await new SignJWT({
      sub: user.id,
      username: user.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(getJwtSecretKey());

    (await cookies()).set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while signing in." };
  }
}

export async function signOut() {
  (await cookies()).delete(TOKEN_NAME);
}
