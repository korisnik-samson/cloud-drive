"use client";

import { useEffect, useState } from "react";
import { sharesApi } from "@/lib/api/driveApi";

export default function SharePage({ params }: { params: { token: string } }) {
  const token = params.token;
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function resolve() {
    setErr(null);
    setBusy(true);
    try {
      const res = await sharesApi.resolve(token, password || undefined);
      setInfo(res);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to open share");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    resolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="container" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <div className="card" style={{ width: "100%", maxWidth: 720 }}>
        <h1 style={{ margin: 0 }}>Shared file</h1>
        <p className="muted" style={{ marginTop: 6 }}>Token: <code>{token}</code></p>
        <div className="hr" />

        {err && (
          <div className="card" style={{ borderColor: "rgba(251,113,133,0.35)", background: "rgba(251,113,133,0.08)" }}>
            {err}
          </div>
        )}

        {info ? (
          <>
            <div className="spread" style={{ gap: 14, flexWrap: "wrap" }}>
              <div><div className="muted" style={{ fontSize: 13 }}>Name</div><div style={{ fontWeight: 600 }}>{info.name}</div></div>
              <div><div className="muted" style={{ fontSize: 13 }}>Type</div><div style={{ fontWeight: 600 }}>{info.type}</div></div>
              <div><div className="muted" style={{ fontSize: 13 }}>Size</div><div style={{ fontWeight: 600 }}>{info.sizeBytes ?? 0} bytes</div></div>
            </div>
            <div className="hr" />
            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="btn" onClick={() => window.open(info.downloadUrl, "_blank")} disabled={!info.downloadUrl}>Download</button>
              <button className="btn secondary" onClick={() => resolve()} disabled={busy}>Refresh</button>
            </div>
          </>
        ) : (
          <>
            <p className="muted">If the share is password-protected, enter it below:</p>
            <div className="row">
              <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password (optional)" style={{ width: 280 }} />
              <button className="btn" onClick={() => resolve()} disabled={busy}>{busy ? "Opening..." : "Open"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
