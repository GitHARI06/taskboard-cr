import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { errorMessage } from "../api/client";
import { addComment, listComments } from "../api/comments";
import { deleteTask, getTask } from "../api/tasks";
import type { Comment, Task } from "../api/types";

export default function TaskDetail() {
  const taskId = Number(useParams().taskId);
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getTask(taskId).then(setTask).catch((err) => setError(errorMessage(err)));
    listComments(taskId).then(setComments).catch((err) => setError(errorMessage(err)));
  }, [taskId]);

  async function comment(e: FormEvent) {
    e.preventDefault();
    try {
      const created = await addComment(taskId, body);
      setComments([...comments, created]);
      setBody("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function remove() {
    if (!task || !confirm(`Delete "${task.title}"?`)) return;
    await deleteTask(task.id);
    navigate(`/projects/${task.project_id}`);
  }

  if (error) return <p className="error">{error}</p>;
  if (!task) return <p className="muted">Loading…</p>;

  return (
    <section>
      <Link to={`/projects/${task.project_id}`}>← Back to board</Link>
      <h1>{task.title}</h1>
      <p className="muted">Status: {task.status}</p>
      <p>{task.description || <span className="muted">No description.</span>}</p>
      <button className="danger" onClick={remove}>Delete task</button>

      <h2>Comments</h2>
      <ul className="list">
        {comments.map((c) => (
          <li key={c.id}>{c.body}</li>
        ))}
      </ul>
      <form className="inline" onSubmit={comment}>
        <input placeholder="Add a comment" value={body} onChange={(e) => setBody(e.target.value)} required />
        <button type="submit">Post</button>
      </form>
    </section>
  );
}
