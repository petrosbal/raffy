import { apiRequest } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "./types";

export const authApi = {
  login(request: LoginRequest) {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  register(request: RegisterRequest) {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
};
