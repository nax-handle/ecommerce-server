// This file is kept for backwards compatibility but is no longer used for API calls
// All API calls have been replaced with dummy data

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Note: This instance is no longer used as all services now use dummy data
