import "server-only";

import bcrypt from "bcryptjs";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export interface AdminSession {
  adminId?: number;
  username?: string;
  isLoggedIn: boolean;
}

const sessionPassword =
  process.env.SESSION_PASSWORD ??
  "change-this-to-a-very-long-random-secret-32-plus";

if (sessionPassword.length < 32) {
  throw new Error("SESSION_PASSWORD must be at least 32 characters long.");
}

const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: "spk_admin_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
  ttl: 60 * 60 * 24 * 7,
};

export async function getAdminSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSession>(cookieStore, sessionOptions);

  if (typeof session.isLoggedIn !== "boolean") {
    session.isLoggedIn = false;
  }

  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session.isLoggedIn || !session.adminId) {
    redirect("/login");
  }

  return {
    id: session.adminId,
    username: session.username ?? "admin",
  };
}

export async function ensureDefaultAdmin() {
  const accountCount = await prisma.account.count();
  if (accountCount > 0) {
    return;
  }

  const username = process.env.DEFAULT_ADMIN_USERNAME ?? "admin";
  const password = process.env.DEFAULT_ADMIN_PASSWORD ?? "admin12345";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.account.create({
    data: {
      username,
      password: passwordHash,
    },
  });
}

export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<{ ok: true; id: number; username: string } | { ok: false }> {
  const account = await prisma.account.findUnique({ where: { username } });
  if (!account) {
    return { ok: false };
  }

  const passwordMatches = await bcrypt.compare(password, account.password);
  if (!passwordMatches) {
    return { ok: false };
  }

  return {
    ok: true,
    id: account.id,
    username: account.username,
  };
}
