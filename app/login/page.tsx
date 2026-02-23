"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (isAuthed) router.replace("/drive");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
      router.push("/drive");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <div className="card" style={{ width: "100%", maxWidth: 520 }}>
        <h1 style={{ margin: 0 }}>Cloud Store</h1>
        <p className="muted" style={{ marginTop: 6 }}>Sign in to your personal cloud.</p>

        <div className="hr" />

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="muted">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span className="muted">Password</span>
            <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>

          {err && (
            <div className="card" style={{ borderColor: "rgba(251,113,133,0.35)", background: "rgba(251,113,133,0.08)" }}>
              {err}
            </div>
          )}

          <button className="btn" disabled={busy || !email || !password} type="submit">
            {busy ? "Signing in..." : "Sign in"}
          </button>

          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            Auth endpoints expected: <code>/auth/login</code> and <code>/auth/refresh</code>.
          </p>
        </form>
      </div>
    </div>
  );
}
