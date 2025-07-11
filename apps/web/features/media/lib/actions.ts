"use server";

import { redirect } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

export async function createRouter() {
  const res = await fetch(`${API_BASE_URL}/media/create`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`Failed to create router: ${res.status}`);
  }

  const text = await res.text();

  if (!text || text.trim().length === 0) {
    throw new Error("Invalid router ID received");
  }

  redirect(`/room/${text}`);
}
