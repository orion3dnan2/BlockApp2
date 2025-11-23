import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get the base URL for API requests
function getApiBaseUrl(): string {
  // In production, use the APP_URL from environment or location origin
  if (typeof window !== "undefined") {
    // Use current origin if available (works with any domain/IP)
    return window.location.origin;
  }
  return "";
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Resolve URL to full path including origin
function resolveUrl(url: string): string {
  // If URL already has protocol/origin, return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Otherwise prepend origin
  return `${getApiBaseUrl()}${url}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = resolveUrl(url);
  const res = await fetch(fullUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeader(),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const fullUrl = resolveUrl(url);
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: {
        ...getAuthHeader(),
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
