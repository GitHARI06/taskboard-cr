import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { errorMessage } from "../api/client";
import { addMember, listMembers } from "../api/projects";
import { createTask, listTasks, setStatus } from "../api/tasks";
import type { Member, Task, TaskStatus } from "../api/types";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "doing", label: "Doing" },
  { status: "done", label: "Done" },
];

export default function ProjectBoard() {
  const projectId = Number(useParams().projectId);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [invite, setInvite] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    listMembers(projectId).then(setMembers).catch((err) => setError(errorMessage(err)));
  }, [projectId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      listTasks(projectId, search).then(setTasks).catch((err) => setError(errorMessage(err)));
    }, 200);
    return () => clearTimeout(timer);
  }, [projectId, search]);

  async function addTask(e: FormEvent) {
    e.preventDefault();
    try {
      const task = await createTask(projectId, title, description, assignee ? Number(assignee) : null);
      setTasks([task, ...tasks]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function move(task: Task, status: TaskStatus) {
    const updated = await setStatus(task.id, status);
    setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function inviteMember(e: FormEvent) {
    e.preventDefault();
    try {
      const member = await addMember(projectId, invite);
      setMembers([...members, member]);
      setInvite("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const memberName = (id: number | null) => members.find((m) => m.user_id === id)?.name;

  return (
    <section>
      <h1>Board</h1>
      {error && <p className="error">{error}</p>}
      <input className="search" placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="board">
        {COLUMNS.map((col) => (
          <div key={col.status} className="column">
            <h2>{col.label}</h2>
            {tasks
              .filter((t) => t.status === col.status)
              .map((t) => (
                <div key={t.id} className="card">
                  <Link to={`/tasks/${t.id}`}>{t.title}</Link>
                  {t.assignee_id && <p className="muted">{memberName(t.assignee_id)}</p>}
                  <select value={t.status} onChange={(e) => move(t, e.target.value as TaskStatus)}>
                    {COLUMNS.map((c) => (
                      <option key={c.status} value={c.status}>{c.label}</option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
        ))}
      </div>

      <form className="card" onSubmit={addTask}>
        <h2>New task</h2>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>{m.name}</option>
          ))}
        </select>
        <button type="submit">Add task</button>
      </form>

      <form className="inline" onSubmit={inviteMember}>
        <input type="email" placeholder="Invite by email" value={invite} onChange={(e) => setInvite(e.target.value)} required />
        <button type="submit">Invite</button>
      </form>
      <p className="muted">Members: {members.map((m) => m.name).join(", ")}</p>
    </section>
  );
}
