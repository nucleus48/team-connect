import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function tryCatch<T>(promise: Promise<T>) {
  try {
    return { success: true as const, data: await promise, error: null };
  } catch (error) {
    return {
      success: false as const,
      data: null,
      error: error instanceof Error ? error : new Error("Something went wrong"),
    };
  }
}

export function nameInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
