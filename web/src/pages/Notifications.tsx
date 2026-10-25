import { useEffect, useState } from "react";
import { errorMessage } from "../api/client";
import { listNotifications, markRead } from "../api/notifications";
import type { Notification } from "../api/types";

export default function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listNotifications().then(setItems).catch((err) => setError(errorMessage(err)));
  }, []);

  async function read(id: number) {
    const updated = await markRead(id);
    setItems(items.map((n) => (n.id === id ? updated : n)));
  }

  return (
    <section>
      <h1>Notifications</h1>
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {items.map((n) => (
          <li key={n.id} className={n.read ? "muted" : ""}>
            {n.message}
            {!n.read && <button className="link" onClick={() => read(n.id)}>Mark read</button>}
          </li>
        ))}
        {items.length === 0 && <li className="muted">Nothing new.</li>}
      </ul>
    </section>
  );
}
