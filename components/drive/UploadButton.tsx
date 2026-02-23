"use client";

import { useRef, useState } from "react";

export function UploadButton({ onUpload }: { onUpload: (f: File) => Promise<void> }) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setErr(null);
    setBusy(true);
    try {
      await onUpload(file);
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="row" style={{ alignItems: "center" }}>
      <input
        ref={ref}
        type="file"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        style={{ width: 250 }}
      />
      {busy && <span className="muted">Uploading…</span>}
      {err && <span className="muted" style={{ color: "var(--danger)" }}>{err}</span>}
    </div>
  );
}
