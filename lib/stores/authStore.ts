import { create } from "zustand";
import { clearTokens, hasTokens, setTokens } from "@/lib/auth/tokenStorage";
import { loginApi } from "@/lib/api/authApi";

type AuthState = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,

  async login(email, password) {
    const res = await loginApi(email, password);
    setTokens(res.access_token, res.refresh_token);
    set({ isAuthenticated: true });
  },

  logout() {
    clearTokens();
    set({ isAuthenticated: false });
  },

  hydrate() {
    set({ isAuthenticated: hasTokens() });
  }
}));

if (typeof window !== "undefined") {
  useAuthStore.getState().hydrate();
}
