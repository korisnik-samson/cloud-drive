"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { nodesApi, sharesApi, uploadsApi } from "@/lib/api/driveApi";
import { StorageNode } from "@/lib/types";
import { Breadcrumbs } from "@/components/drive/Breadcrumbs";
import { NodeTable } from "@/components/drive/NodeTable";
import { UploadButton } from "@/components/drive/UploadButton";
import { CreateFolderDialog } from "@/components/drive/CreateFolderDialog";
import { ShareDialog } from "@/components/drive/ShareDialog";

export default function DrivePage() {
  const router = useRouter();
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const [parentId, setParentId] = useState<string | null>(null);
  const [items, setItems] = useState<StorageNode[]>([]);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shareNode, setShareNode] = useState<StorageNode | null>(null);

  useEffect(() => {
    if (!isAuthed) router.replace("/login");
  }, [isAuthed, router]);

  async function load() {
    setError(null);
    setBusy(true);
    try {
      const res = q.trim() ? await nodesApi.search(q.trim()) : await nodesApi.list(parentId);
      setItems(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (isAuthed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, parentId]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.type !== b.type) return a.type === "FOLDER" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [items]);

  async function onCreateFolder(name: string) {
    await nodesApi.createFolder(parentId, name);
    await load();
  }

  async function onTrash(n: StorageNode) {
    await nodesApi.trash(n.id);
    await load();
  }

  async function onDownload(n: StorageNode) {
    const { url } = await nodesApi.getDownloadUrl(n.id);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function onShare(node: StorageNode, opts: { expiresHours?: number; password?: string; maxDownloads?: number }) {
    const { url, token } = await sharesApi.create(node.id, opts);
    const base = process.env.NEXT_PUBLIC_APP_BASE_URL ?? window.location.origin;
    const absolute = url.startsWith("http") ? url : `${base}${url}`;
    return { token, url: absolute };
  }

  async function onUpload(file: File) {
    const init = await uploadsApi.initiate({
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      parentId
    });

    const put = await fetch(init.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file
    });

    if (!put.ok) throw new Error("Direct upload failed (pre-signed PUT).");

    await uploadsApi.complete({
      objectKey: init.objectKey,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      parentId
    });

    await load();
  }

  return (
    <div className="container">
      <header className="spread">
        <div>
          <h1 style={{ margin: 0 }}>My Drive</h1>
          <p className="muted" style={{ margin: "4px 0 0 0" }}>Drive-like explorer for your Spring + MinIO backend.</p>
        </div>
        <div className="row">
          <button className="btn secondary" onClick={() => load()} disabled={busy}>Refresh</button>
          <button className="btn danger" onClick={() => { logout(); router.push("/login"); }}>Logout</button>
        </div>
      </header>

      <div className="hr" />

      <div className="card">
        <div className="spread" style={{ gap: 16, flexWrap: "wrap" }}>
          <Breadcrumbs parentId={parentId} onNavigate={setParentId} />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by filename..."
              style={{ width: 260 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") load();
                if (e.key === "Escape") { setQ(""); setTimeout(() => load(), 0); }
              }}
            />
            <button className="btn secondary" onClick={() => load()} disabled={busy}>Search</button>
            <CreateFolderDialog onCreate={onCreateFolder} />
            <UploadButton onUpload={onUpload} />
          </div>
        </div>

        {error && (
          <div className="card" style={{ marginTop: 12, borderColor: "rgba(251,113,133,0.35)", background: "rgba(251,113,133,0.08)" }}>
            <b>Backend/API error</b>
            <div className="muted" style={{ marginTop: 6 }}>{error}</div>
            <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
              This UI expects <code>/api/v1/nodes</code>, <code>/api/v1/uploads</code>, <code>/api/v1/shares</code>. (You’ll add these on the backend next.)
            </div>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <NodeTable
            loading={busy}
            items={sorted}
            onOpenFolder={(id) => setParentId(id)}
            onDownload={onDownload}
            onTrash={onTrash}
            onShare={(node) => setShareNode(node)}
          />
        </div>
      </div>

      {shareNode && (
        <ShareDialog node={shareNode} onClose={() => setShareNode(null)} onCreate={onShare} />
      )}
    </div>
  );
}
