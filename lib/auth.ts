import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.password) {
    throw new Error("Invalid credentials");
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const cookieStore = await cookies();
  cookieStore.set("session", user.id, sessionCookieOptions);

  if (user.mustChangePassword) {
    cookieStore.set("must_change_pw", "1", sessionCookieOptions);
  } else {
    cookieStore.delete({ name: "must_change_pw", path: "/" });
  }

  return { mustChangePassword: user.mustChangePassword };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: "session", path: "/" });
  cookieStore.delete({ name: "must_change_pw", path: "/" });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return null;

  const user = await prisma.user.findUnique({ where: { id: session.value } });
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
