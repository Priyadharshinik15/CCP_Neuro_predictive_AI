const BASE_URL = "http://localhost:5000/api"; // Your backend URL

const getAuthToken = (): string | null => {
  return localStorage.getItem("astralex_token");
};

const apiServices = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unexpected error" }));
    throw new Error(errorData.message || "Server error");
  }

  if (response.status === 204) return null; // No content
  return response.json();
};

export default apiServices;

