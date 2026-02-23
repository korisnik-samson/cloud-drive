import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth/tokenStorage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const http = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("Missing refresh token");

  const res = await axios.post(
    `${API_BASE}/auth/refresh`,
    { refresh_token: refresh },
    { headers: { "Content-Type": "application/json" } }
  );

  const access = (res.data as any)?.access_token;
  const newRefresh = (res.data as any)?.refresh_token;

  if (!access || !newRefresh) throw new Error("Refresh response missing tokens");

  setTokens(access, newRefresh);
  return access;
}

http.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original: any = error.config;

    if (status === 401 && original && !original._retry) {
      original._retry = true;

      try {
        if (!refreshing) refreshing = refreshAccessToken();
        const newAccess = await refreshing;
        refreshing = null;

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccess}`;

        return http.request(original);
      } catch {
        refreshing = null;
        clearTokens();
        return Promise.reject(new Error("Session expired. Please log in again."));
      }
    }

    const msg =
      (error.response?.data as any)?.message ||
      (error.response?.data as any)?.error ||
      error.message ||
      "Request failed";

    return Promise.reject(new Error(msg));
  }
);
