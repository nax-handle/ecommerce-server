import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as auth from "@/lib/services/auth";
import { setAuthTokens, clearAuthTokens } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  cashbackBalance?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    type?: "email" | "google",
    code?: string
  ) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  verify: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {
        id: "user-1",
        email: "user@example.com",
        name: "John Doe",
        avatar: "/logo/avatar.png",
        role: "user",
        cashbackBalance: 25.49,
      },
      isAuthenticated: true,

      initialize: async () => {
        // Always set dummy user as authenticated
        set({
          user: {
            id: "user-1",
            email: "user@example.com",
            name: "John Doe",
            avatar: "/logo/avatar.png",
            role: "user",
            cashbackBalance: 25.49,
          },
          isAuthenticated: true,
        });
      },

      setUser: (user) =>
        set({
          user,
          isAuthenticated: Boolean(user && user.id),
        }),

      login: async (email, password, type = "email", code) => {
        try {
          const response = await auth.login({
            email,
            password,
            type,
            code,
          });
          setAuthTokens(response.accessToken, response.refreshToken);
          set({
            user: response.user,
            isAuthenticated: true,
          });
        } catch (error) {
          throw error;
        }
      },

      register: async (email, password) => {
        const response = await auth.register({ email, password });
        setAuthTokens(response.accessToken, response.refreshToken);
        set({
          user: response.user,
          isAuthenticated: Boolean(response.user),
        });
      },

      verify: async (email, otp) => {
        const response = await auth.verify({ email, otp });
        setAuthTokens(response.accessToken, response.refreshToken);
        set({
          user: response.user,
          isAuthenticated: Boolean(response.user),
        });
      },

      logout: async () => {
        await auth.logout();
        clearAuthTokens();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
