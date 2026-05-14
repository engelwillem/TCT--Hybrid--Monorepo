"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/lib/api";
import { setAuthCookie } from "@/lib/auth";
import { trackMetric } from "@/lib/metrics";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => email.trim() !== "" && password.trim() !== "", [email, password]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await loginRequest(email.trim(), password);
      if (!result.status || !result.token) {
        if (result.statusCode === 422 || result.statusCode === 401) {
          setError("Email or password is incorrect.");
        } else if (result.statusCode && result.statusCode >= 500) {
          setError("Server is having issues. Please try again shortly.");
        } else {
          setError(result.message || "Login failed. Check your email/password.");
        }
        return;
      }

      setAuthCookie(result.token);
      trackMetric("login_success");
      router.replace(nextPath);
    } catch (_err) {
      setError("Failed to connect to server. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 460, margin: "48px auto" }}>
      <h1>WA Dashboard Login</h1>
      <p>Sign in to manage customer reminders.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error ? <div className="error">{error}</div> : null}

        <button className="button" type="submit" disabled={!canSubmit || loading}>
          {loading ? "Processing..." : "Login"}
        </button>
      </form>
    </div>
  );
}
