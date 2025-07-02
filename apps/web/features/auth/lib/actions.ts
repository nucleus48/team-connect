"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signup(email: string, password: string) {
  const res = await fetch("http://localhost:3030/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  const cookieStore = await cookies();
  cookieStore.set("accessToken", data.accessToken);
  return redirect("/");
}

export async function login(email: string, password: string) {
  return redirect("/");
}
