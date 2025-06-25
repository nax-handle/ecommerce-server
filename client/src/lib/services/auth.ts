import Cookies from "js-cookie";
import { dummyUser, generateAuthResponse, delay } from "@/data/dummy/auth";

const isClient = typeof window !== "undefined";

interface RegisterData {
  email: string;
  password: string;
}

interface VerifyData {
  email: string;
  otp: string;
}

interface LoginData {
  email: string;
  password: string;
  type: "email" | "google";
  code?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  cashbackBalance: number;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
  status: number;
}

const TOKEN_EXPIRY = 7;

export async function register(data: RegisterData): Promise<AuthResponse> {
  await delay(500); // Simulate network delay
  console.log("Register attempt with:", { email: data.email });

  const response = generateAuthResponse({
    ...dummyUser,
    email: data.email,
  });

  if (isClient) {
    Cookies.set("accessToken", response.accessToken, { expires: TOKEN_EXPIRY });
    Cookies.set("refreshToken", response.refreshToken, {
      expires: TOKEN_EXPIRY,
    });
  }
  return response;
}

export async function verify(data: VerifyData): Promise<AuthResponse> {
  await delay(500); // Simulate network delay
  console.log("Verify attempt with:", { email: data.email, otp: data.otp });

  const response = generateAuthResponse({
    ...dummyUser,
    email: data.email,
  });

  if (isClient) {
    Cookies.set("accessToken", response.accessToken, { expires: TOKEN_EXPIRY });
    Cookies.set("refreshToken", response.refreshToken, {
      expires: TOKEN_EXPIRY,
    });
  }
  return response;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    await delay(500); // Simulate network delay
    console.log("Attempting login with data:", {
      ...data,
      password: "[REDACTED]",
    });

    const response = generateAuthResponse({
      ...dummyUser,
      email: data.email,
    });

    console.log("Login successful:", {
      user: response.user,
      hasToken: !!response.accessToken,
    });

    if (isClient) {
      Cookies.set("accessToken", response.accessToken, {
        expires: TOKEN_EXPIRY,
      });
      Cookies.set("refreshToken", response.refreshToken, {
        expires: TOKEN_EXPIRY,
      });
    }
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User> {
  await delay(300); // Simulate network delay
  return dummyUser;
}

export async function logout(): Promise<void> {
  await delay(300); // Simulate network delay
  if (isClient) {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  }
}

export async function refreshToken(): Promise<AuthResponse> {
  await delay(300); // Simulate network delay
  const response = generateAuthResponse();

  if (isClient && response.accessToken) {
    Cookies.set("accessToken", response.accessToken, { expires: TOKEN_EXPIRY });
    Cookies.set("refreshToken", response.refreshToken, {
      expires: TOKEN_EXPIRY,
    });
  }
  return response;
}

export function isAuthenticated(): boolean {
  return true; // Always return true for dummy mode
}
