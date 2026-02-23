"use client";

import { useMemo } from "react";

// Minimal breadcrumbs: Root > (folderId). Upgrade later once backend exposes ancestors.
export function Breadcrumbs({
  parentId,
  onNavigate
}: {
  parentId: string | null;
  onNavigate: (id: string | null) => void;
}) {
  const crumbs = useMemo(() => {
    if (!parentId) return [{ label: "Root", id: null as string | null }];
    return [
      { label: "Root", id: null as string | null },
      { label: parentId.slice(0, 8) + "…", id: parentId }
    ];
  }, [parentId]);

  return (
    <div className="row" style={{ flexWrap: "wrap" }}>
      {crumbs.map((c, idx) => (
        <div key={idx} className="row" style={{ gap: 8 }}>
          <button className="btn secondary" onClick={() => onNavigate(c.id)}>
            {c.label}
          </button>
          {idx < crumbs.length - 1 && <span className="muted">/</span>}
        </div>
      ))}
    </div>
  );
}
