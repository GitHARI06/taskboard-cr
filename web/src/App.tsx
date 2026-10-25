import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe } from "./api/auth";
import { clearToken, hasToken } from "./api/client";
import type { User } from "./api/types";
import AuthPage from "./pages/AuthPage";
import Projects from "./pages/Projects";
import ProjectBoard from "./pages/ProjectBoard";
import TaskDetail from "./pages/TaskDetail";
import Notifications from "./pages/Notifications";

function RequireAuth({ children }: { children: JSX.Element }) {
  return hasToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [me, setMe] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasToken()) getMe().then(setMe).catch(() => setMe(null));
  }, []);

  function signOut() {
    clearToken();
    setMe(null);
    navigate("/login");
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">TaskBoard</Link>
        {me && (
          <nav>
            <Link to="/notifications">Notifications</Link>
            <span className="muted">{me.name}</span>
            <button className="link" onClick={signOut}>Sign out</button>
          </nav>
        )}
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<AuthPage onSignedIn={setMe} />} />
          <Route path="/" element={<RequireAuth><Projects /></RequireAuth>} />
          <Route path="/projects/:projectId" element={<RequireAuth><ProjectBoard /></RequireAuth>} />
          <Route path="/tasks/:taskId" element={<RequireAuth><TaskDetail /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
