export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * A simple wrapper around fetch that always includes credentials (cookies)
 * so the FastAPI backend can authenticate the user via the HTTP-only cookie.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Ensures the access_token cookie is sent
  });

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // Body is not JSON
    }
    const error = new Error(errorMessage);
    (error as { status?: number }).status = response.status;
    throw error;
  }

  // Support empty responses (e.g., 204 No Content)
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text; // Return raw text if not JSON
  }
}
