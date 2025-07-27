"use server";

import { api } from "@/lib/api";
import { redirect, unstable_rethrow as rethrow } from "next/navigation";

export async function createRoom() {
  try {
    const res = await api.post<string>("/rooms/create");
    redirect(`/room/${res.data}`);
  } catch (error) {
    rethrow(error);
    return "Failed to create a room";
  }
}
