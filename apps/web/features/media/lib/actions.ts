"use server";

import { api } from "@/lib/api";
import { redirect } from "next/navigation";

export async function createRouter() {
  const res = await api.post<string>("/media/create");
  redirect(`/room/${res.data}`);
}
