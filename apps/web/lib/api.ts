import { Configuration, ResponseError } from "@repo/api-sdk";

export const config = new Configuration({
  basePath: "http://localhost:3030",
});

export async function handleApiError<T>(res: Promise<T>) {
  try {
    const data = await res;
    return { success: true, data } as const;
  } catch (error) {
    let message = "An error has occurred";

    if (error instanceof ResponseError) {
      const data = await error.response.json();
      message = data.message;
    }

    return { success: false, data: { message } } as const;
  }
}
