import "server-only"

import {
  ACCESS_TOKEN_DURATION,
  COOKIE,
  REFRESH_TOKEN_DURATION,
  TokensEntity,
} from "@repo/shared-types";
import { cookies } from "next/headers";
import { unauthorized } from "next/navigation";
import { publicApi } from "./api";

export async function tokenRefresh() {
  try {
    const refreshToken = (await cookies()).get(COOKIE.REFRESH_TOKEN)?.value;

    if (!refreshToken) {
      throw new Error();
    }

    const res = await publicApi.post<TokensEntity>("/auth/refresh", undefined, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    await setTokenCookies(res.data);
    return res.data;
  } catch {
    unauthorized();
  }
}

export async function getAccessToken() {
  const accessToken = (await cookies()).get(COOKIE.ACCESS_TOKEN)?.value;

  if (!accessToken) {
    const { accessToken } = await tokenRefresh();
    return accessToken;
  }

  return accessToken;
}

export async function setTokenCookies(tokens: TokensEntity) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE.ACCESS_TOKEN, tokens.accessToken, {
    secure: true,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_DURATION - 60,
  });

  cookieStore.set(COOKIE.REFRESH_TOKEN, tokens.refreshToken, {
    secure: true,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_DURATION - 24 * 60 * 60,
  });
}
