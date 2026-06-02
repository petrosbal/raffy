import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/useAuth";

type LocationState = {
  from?: { pathname?: string };
};

export function AuthPage() {
  const { isAuthenticated, login, register } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || "/";

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !password || (mode === "register" && !displayName)) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ displayName, email, password });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label="Authentication">
        <div className="auth-heading">
          <h1>raffy</h1>
          <p>Your personal reading tracker</p>
        </div>

        <div className="segmented-control">
          <button
            className={mode === "login" ? "active" : ""}
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
          >
            Log in
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              <span>Display name</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
              />
            </label>
          )}

          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Working..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
