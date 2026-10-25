import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { errorMessage } from "../api/client";
import { createProject, listProjects } from "../api/projects";
import type { Project } from "../api/types";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    listProjects().then(setProjects).catch((err) => setError(errorMessage(err)));
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    try {
      const project = await createProject(name);
      setProjects([...projects, project]);
      setName("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <section>
      <h1>Projects</h1>
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {projects.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.name}</Link>
          </li>
        ))}
        {projects.length === 0 && <li className="muted">No projects yet.</li>}
      </ul>
      <form className="inline" onSubmit={add}>
        <input placeholder="New project name" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit">Create</button>
      </form>
    </section>
  );
}
