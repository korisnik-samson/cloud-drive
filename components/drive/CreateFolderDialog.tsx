"use client";

import { useState } from "react";

export function CreateFolderDialog({ onCreate }: { onCreate: (name: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      await onCreate(name.trim());
      setName("");
      setOpen(false);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create folder");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button className="btn secondary" onClick={() => setOpen(true)}>
        New folder
      </button>
    );
  }

  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="row" style={{ flexWrap: "wrap" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" style={{ width: 220 }} />
        <button className="btn" onClick={submit} disabled={busy || !name.trim()}>
          {busy ? "Creating..." : "Create"}
        </button>
        <button className="btn secondary" onClick={() => { setOpen(false); setErr(null); }}>
          Cancel
        </button>
      </div>
      {err && <div className="muted" style={{ marginTop: 8, color: "var(--danger)" }}>{err}</div>}
    </div>
  );
}
