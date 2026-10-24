import bag from "@/assets/bag.jpg";
import hero from "@/assets/hero.jpg";
import sneaker from "@/assets/sneaker.jpg";
import watch from "@/assets/watch.jpg";

const configuredApiUrl = import.meta.env["VITE_API_URL"];

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error("VITE_API_URL must be set for production builds.");
}

export const apiBaseUrl = (
  configuredApiUrl ?? "http://localhost:4000/api"
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
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
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
  if (source.startsWith("/uploads/products/")) {
    if (apiBaseUrl.startsWith("/")) return source;
    return new URL(source, apiBaseUrl).toString();
  }
  return bundledImages[source] ?? source;
}
