"use server";

import { api } from "@/lib/api";
import { TokensEntity } from "@repo/shared-types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signup(email: string, password: string) {
  const res = await api.post<TokensEntity>("/auth/signup", { email, password });
  const cookieStore = await cookies();
  cookieStore.set("access_token", res.data.access_token);
  return redirect("/");
}

export async function login(email: string, password: string) {
  const res = await api.post<TokensEntity>("/auth/login", { email, password });
  const cookieStore = await cookies();
  cookieStore.set("access_token", res.data.access_token);
  return redirect("/");
}
