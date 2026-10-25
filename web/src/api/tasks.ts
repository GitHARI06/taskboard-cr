import { api } from "./client";
import type { Task, TaskStatus } from "./types";

export async function listTasks(projectId: number, search?: string): Promise<Task[]> {
  const res = await api.get("/tasks", { params: { project_id: projectId, q: search || undefined } });
  return res.data;
}

export async function createTask(
  projectId: number,
  title: string,
  description: string,
  assigneeId: number | null,
): Promise<Task> {
  const res = await api.post("/tasks", {
    project_id: projectId,
    title,
    description,
    assignee_id: assigneeId,
  });
  return res.data;
}

export async function getTask(taskId: number): Promise<Task> {
  const res = await api.get(`/task/${taskId}`);
  return res.data;
}

export async function setStatus(taskId: number, status: TaskStatus): Promise<Task> {
  const res = await api.patch(`/tasks/${taskId}`, { status });
  return res.data;
}

export async function assign(taskId: number, assigneeId: number | null): Promise<Task> {
  const res = await api.patch(`/tasks/${taskId}`, { assignee_id: assigneeId });
  return res.data;
}

export async function deleteTask(taskId: number): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}
