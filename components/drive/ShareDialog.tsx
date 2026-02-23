"use client";

import { useState } from "react";
import { StorageNode } from "@/lib/types";

export function ShareDialog({
  node,
  onClose,
  onCreate
}: {
  node: StorageNode;
  onClose: () => void;
  onCreate: (node: StorageNode, opts: { expiresHours?: number; password?: string; maxDownloads?: number }) => Promise<{ url: string; token: string }>;
}) {
  const [expiresHours, setExpiresHours] = useState<string>("24");
  const [maxDownloads, setMaxDownloads] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function create() {
    setErr(null);
    setBusy(true);
    try {
      const res = await onCreate(node, {
        expiresHours: expiresHours ? Number(expiresHours) : undefined,
        maxDownloads: maxDownloads ? Number(maxDownloads) : undefined,
        password: password || undefined
      });
      setLink(res.url);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create share link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "grid", placeItems: "center", padding: 22 }}
      onClick={onClose}
    >
      <div className="card" style={{ width: "100%", maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="spread">
          <div>
            <h2 style={{ margin: 0 }}>Share</h2>
            <p className="muted" style={{ margin: "6px 0 0 0" }}>{node.name}</p>
          </div>
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>

        <div className="hr" />

        <div style={{ display: "grid", gap: 10 }}>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span className="muted" style={{ fontSize: 13 }}>Expires (hours)</span>
              <input value={expiresHours} onChange={(e) => setExpiresHours(e.target.value)} style={{ width: 160 }} />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span className="muted" style={{ fontSize: 13 }}>Max downloads</span>
              <input value={maxDownloads} onChange={(e) => setMaxDownloads(e.target.value)} placeholder="optional" style={{ width: 160 }} />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span className="muted" style={{ fontSize: 13 }}>Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="optional" style={{ width: 200 }} type="password" />
            </label>

            <button className="btn" onClick={create} disabled={busy}>
              {busy ? "Creating..." : "Create link"}
            </button>
          </div>

          {err && <div className="muted" style={{ color: "var(--danger)" }}>{err}</div>}

          {link && (
            <div className="card" style={{ padding: 12 }}>
              <div className="muted" style={{ fontSize: 13 }}>Share URL</div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <code style={{ wordBreak: "break-all" }}>{link}</code>
                <button className="btn secondary" onClick={async () => { await navigator.clipboard.writeText(link); }} style={{ whiteSpace: "nowrap" }}>
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
