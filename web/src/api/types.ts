export type TaskStatus = "todo" | "doing" | "done";

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Project {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
}

export interface Member {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: TaskStatus;
  assignee_id: number | null;
  created_by: number;
  created_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  author_id: number;
  body: string;
  created_at: string;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  created_at: string;
}
