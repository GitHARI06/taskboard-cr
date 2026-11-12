import { api } from "./client";
import type { Member, Project } from "./types";

export async function listProjects(): Promise<Project[]> {
  const res = await api.get("/projects");
  return res.data;
}

export async function createProject(name: string): Promise<Project> {
  const res = await api.post("/projects", { name });
  return res.data;
}

export async function listMembers(projectId: number): Promise<Member[]> {
  const res = await api.get(`/projects/${projectId}/collaborators`);
  return res.data;
}

export async function addMember(projectId: number, email: string, role = "member"): Promise<Member> {
  const res = await api.post(`/projects/${projectId}/collaborators`, { email, role });
  return res.data;
}
