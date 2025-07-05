"use server";

import { redirect } from "next/navigation";

export async function createRoom() {
  const roomId = crypto.randomUUID();
  redirect(`/room/${roomId}`);
}
