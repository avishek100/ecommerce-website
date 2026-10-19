import bag from "@/assets/bag.jpg";
import hero from "@/assets/hero.jpg";
import sneaker from "@/assets/sneaker.jpg";
import watch from "@/assets/watch.jpg";

export const apiBaseUrl = (
  import.meta.env["VITE_API_URL"] ?? "http://localhost:4000/api"
).replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let body: { message?: string };
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      "The server returned an invalid response.",
      response.status,
    );
  }
  if (!response.ok)
    throw new ApiError(
      body.message ?? `Request failed (${response.status}).`,
      response.status,
    );
  return body as T;
}

const bundledImages: Record<string, string> = {
  "asset:bag": bag,
  "asset:hero": hero,
  "asset:sneaker": sneaker,
  "asset:watch": watch,
};

export function productImage(source: string) {
  return bundledImages[source] ?? source;
}
