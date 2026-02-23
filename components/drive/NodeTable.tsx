"use client";

import { StorageNode } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/utils";

export function NodeTable({
  items,
  loading,
  onOpenFolder,
  onDownload,
  onTrash,
  onShare
}: {
  items: StorageNode[];
  loading: boolean;
  onOpenFolder: (id: string) => void;
  onDownload: (n: StorageNode) => void;
  onTrash: (n: StorageNode) => void;
  onShare: (n: StorageNode) => void;
}) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th style={{ width: 46 }}></th>
          <th>Name</th>
          <th style={{ width: 140 }}>Size</th>
          <th style={{ width: 200 }}>Updated</th>
          <th style={{ width: 280 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={5} className="muted">Loading...</td>
          </tr>
        ) : items.length === 0 ? (
          <tr>
            <td colSpan={5} className="muted">No items.</td>
          </tr>
        ) : (
          items.map((n) => (
            <tr key={n.id}>
              <td>{n.type === "FOLDER" ? "📁" : "📄"}</td>
              <td>
                {n.type === "FOLDER" ? (
                  <button className="btn secondary" onClick={() => onOpenFolder(n.id)} style={{ padding: "6px 10px" }}>
                    {n.name}
                  </button>
                ) : (
                  <span>{n.name}</span>
                )}
                {n.mimeType ? <span className="badge" style={{ marginLeft: 10 }}>{n.mimeType}</span> : null}
              </td>
              <td className="muted">{n.type === "FILE" ? formatBytes(n.sizeBytes ?? 0) : "—"}</td>
              <td className="muted">{formatDate(n.updatedAt)}</td>
              <td>
                <div className="row" style={{ flexWrap: "wrap" }}>
                  {n.type === "FILE" && (
                    <button className="btn secondary" onClick={() => onDownload(n)} style={{ padding: "6px 10px" }}>
                      Download
                    </button>
                  )}
                  {n.type === "FILE" && (
                    <button className="btn secondary" onClick={() => onShare(n)} style={{ padding: "6px 10px" }}>
                      Share
                    </button>
                  )}
                  <button className="btn danger" onClick={() => onTrash(n)} style={{ padding: "6px 10px" }}>
                    Trash
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
