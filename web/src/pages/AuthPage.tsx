import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, login, signup } from "../api/auth";
import { errorMessage } from "../api/client";
import type { User } from "../api/types";

export default function AuthPage({ onSignedIn }: { onSignedIn: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") await signup(email, name, password);
      else await login(email, password);
      onSignedIn(await getMe());
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>{mode === "login" ? "Sign in" : "Create an account"}</h1>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      {mode === "signup" && (
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
      )}
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit">{mode === "login" ? "Sign in" : "Sign up"}</button>
      <button type="button" className="link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "No account? Sign up" : "Have an account? Sign in"}
      </button>
    </form>
  );
}
