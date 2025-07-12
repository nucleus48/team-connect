import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function withAbortController<T>(
  promise: Promise<T>,
  signal: AbortSignal,
) {
  if (signal.aborted) {
    return Promise.reject(signal.reason);
  }

  return new Promise<T>((resolve, reject) => {
    const abortHandler = () => reject(signal.reason);
    signal.addEventListener("abort", abortHandler, { once: true });
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener("abort", abortHandler));
  });
}
