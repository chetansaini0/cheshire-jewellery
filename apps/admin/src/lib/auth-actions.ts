"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminPassword, authMode, createSessionToken, safeEqual, safeNext, SESSION_COOKIE, SESSION_TTL_SECONDS } from "./auth";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, fd: FormData): Promise<LoginState> {
  if (authMode() === "off") redirect("/");
  if (authMode() === "misconfigured") return { error: "Admin password isn't set for this deployment." };
  const password = String(fd.get("password") ?? "");
  if (!password) return { error: "Enter the admin password." };
  if (!(await safeEqual(password, adminPassword()))) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return { error: "That password isn't right. Try again." };
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect(safeNext(String(fd.get("next") ?? "")));
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}
