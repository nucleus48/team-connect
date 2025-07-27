"use server";

import { getAccessToken } from "./tokens";

export async function fetchAccessToken() {
  return await getAccessToken();
}
