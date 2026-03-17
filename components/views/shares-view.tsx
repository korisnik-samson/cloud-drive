"use client";

import { useEffect, useMemo, useState } from "react";
import { listShares, revokeShare } from "@/lib/api";
import type { ShareListItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Link2, Trash2 } from "lucide-react";

export function SharesView() {
  const [items, setItems] = useState<ShareListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const base = useMemo(() => {
    return process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const res = await listShares();
      setItems(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load shares");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    if (!filter.trim()) return items;
    const q = filter.toLowerCase();
    return items.filter(
      (s) => s.node.name.toLowerCase().includes(q) || s.token.toLowerCase().includes(q)
    );
  }, [items, filter]);

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Copied");
    } catch {
      toast.message("Copy not available");
    }
  }

  async function revoke(id: string) {
    try {
      await revokeShare(id);
      toast.success("Revoked");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to revoke");
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Shared links</h2>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Your share links</CardTitle>
          <Input
            className="max-w-xs"
            placeholder="Filter…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No share links yet.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((s) => {
                const url = `${base}/share/${s.token}`;
                return (
                  <div key={s.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{s.node.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.active ? "Active" : "Revoked"} • downloads {s.downloadCount}
                          {s.maxDownloads != null ? `/${s.maxDownloads}` : ""} •
                          {s.expiresAt ? ` expires ${new Date(s.expiresAt).toLocaleString()}` : " never expires"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => void copy(url)} title="Copy link">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => void revoke(s.id)}
                          title="Revoke"
                          disabled={!s.active}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Input readOnly value={url} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
