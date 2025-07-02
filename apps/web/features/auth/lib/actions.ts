"use server";

import { config, handleApiError } from "@/lib/api";
import { AuthApi } from "@repo/api-sdk";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const authApi = new AuthApi(config);

export async function signup(email: string, password: string) {
  const res = await handleApiError(
    authApi.authControllerSignup({
      signUpDto: { email, password },
    }),
  );

  if (!res.success) return res.data;

  const cookieStore = await cookies();
  cookieStore.set("access_token", res.data.accessToken);
  return redirect("/");
}

export async function login(email: string, password: string) {
  const res = await handleApiError(
    authApi.authControllerLogin({
      logInDto: { email, password },
    }),
  );

  if (!res.success) return res.data;

  const cookieStore = await cookies();
  cookieStore.set("access_token", res.data.accessToken);
  return redirect("/");
}
