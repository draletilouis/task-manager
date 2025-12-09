import apiClient from "./client";

export const login = async (email, password) => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data; // { accessToken, refreshToken }
};

export const register = async (email, password, name) => {
  await apiClient.post("/auth/register", { email, password, name });
};

export const refreshToken = async (refreshToken) => {
  const response = await apiClient.post("/auth/refresh-token", { refreshToken });
  return response.data; // { accessToken }
};

