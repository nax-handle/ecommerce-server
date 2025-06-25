export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  cashbackBalance: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
  status: number;
}

export const dummyUser: User = {
  id: "user-1",
  email: "user@example.com",
  name: "John Doe",
  avatar: "/logo/avatar.png",
  role: "user",
  cashbackBalance: 25.49,
};

export const generateAuthResponse = (user: User = dummyUser): AuthResponse => {
  return {
    user,
    accessToken: "dummy-access-token-" + Date.now(),
    refreshToken: "dummy-refresh-token-" + Date.now(),
    message: "Authentication successful",
    status: 200,
  };
};

// Simulate delay for realistic behavior
export const delay = (ms: number = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
