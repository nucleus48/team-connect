"use server";

import { redirect } from "next/navigation";

export async function createRouter() {
  const res = await fetch("http://localhost:3030/media/create", {
    method: "POST",
  });

  const text = await res.text();
  redirect(`/room/${text}`);
}
