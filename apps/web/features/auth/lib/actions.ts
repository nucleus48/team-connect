"use server";

import { publicApi } from "@/lib/api";
import { setTokenCookies } from "@/lib/tokens";
import { TokensEntity } from "@repo/shared-types";
import { AxiosError } from "axios";
import { redirect, unstable_rethrow as rethrow } from "next/navigation";

export async function signup(email: string, password: string) {
  try {
    const res = await publicApi.post<TokensEntity | null>("/auth/signup", {
      email,
      password,
    });

    if (res.data) {
      await setTokenCookies(res.data);
    }

    redirect("/");
  } catch (error) {
    rethrow(error);

    if (error instanceof AxiosError && error.status) {
      if (error.status === 409) return "Email address already exist";
    }

    return "An error has occurred";
  }
}

export async function login(email: string, password: string) {
  try {
    const res = await publicApi.post<TokensEntity>("/auth/login", {
      email,
      password,
    });

    await setTokenCookies(res.data);
    redirect("/");
  } catch (error) {
    rethrow(error);

    if (error instanceof AxiosError && error.status) {
      if (error.status === 401) return "Invalid credentials";
    }

    return "An error has occurred";
  }
}
