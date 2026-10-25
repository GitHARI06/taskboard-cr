import { api } from "./client";
import type { Notification } from "./types";

export async function listNotifications(): Promise<Notification[]> {
  const res = await api.get("/notifications");
  return res.data;
}

export async function markRead(id: number): Promise<Notification> {
  const res = await api.post(`/notifications/${id}/read`);
  return res.data;
}
