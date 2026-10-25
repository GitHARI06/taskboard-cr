import { api } from "./client";
import type { Comment } from "./types";

export async function listComments(taskId: number): Promise<Comment[]> {
  const res = await api.get(`/tasks/${taskId}/comments`);
  return res.data;
}

export async function addComment(taskId: number, body: string): Promise<Comment> {
  const res = await api.post(`/tasks/${taskId}/comments`, { body });
  return res.data;
}
