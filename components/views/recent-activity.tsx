"use client";

import { useEffect, useState } from "react";
import { listActivity } from "@/lib/api";
import type { AuditEventDto } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock } from "lucide-react";

export function RecentActivityView() {
  const [items, setItems] = useState<AuditEventDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listActivity()
      .then(setItems)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load activity"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Recent activity</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No activity yet.</div>
          ) : (
            <div className="space-y-3">
              {items.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium">{e.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {e.nodeId ? `node=${e.nodeId}` : ""}
                      {e.metadata?.["name"] ? ` • ${(e.metadata as any).name}` : ""}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(e.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
