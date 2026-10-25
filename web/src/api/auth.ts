import { api, saveToken } from "./client";
import type { User } from "./types";

export async function signup(email: string, name: string, password: string) {
  const res = await api.post("/auth/signup", { email, name, password });
  saveToken(res.data.access_token);
}

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  saveToken(res.data.access_token);
}

export async function getMe(): Promise<User> {
  const res = await api.get("/auth/me");
  return res.data;
}
