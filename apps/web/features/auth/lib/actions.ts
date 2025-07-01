"use server";

import { redirect } from "next/navigation";

export async function signup(email: string, password: string) {
  return redirect("/");
}

export async function login(email: string, password: string) {
  return redirect("/");
}
