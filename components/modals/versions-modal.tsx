"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listVersions } from "@/lib/api";
import type { FileVersion, StorageNodeDto } from "@/lib/types";
import { toast } from "sonner";

function formatBytes(bytes: number) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function VersionsModal({ open, onOpenChange, node, }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    node: StorageNodeDto | null;
}) {
    const [loading, setLoading] = useState(false);
    const [versions, setVersions] = useState<FileVersion[]>([]);

    useEffect(() => {
        if (!open || !node) return;
        setLoading(true);
        setVersions([]);
        listVersions(node.id)
            .then(setVersions)
            .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load versions"))
            .finally(() => setLoading(false));
    }, [open, node]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Versions — {node?.name ?? ""}</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                ) : versions.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No versions found.</div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/40">
                            <div className="col-span-2">Version</div>
                            <div className="col-span-3">Created</div>
                            <div className="col-span-2">Size</div>
                            <div className="col-span-5">Object key</div>
                        </div>
                        <div className="divide-y">
                            {versions
                                .slice()
                                .sort((a, b) => b.versionNo - a.versionNo)
                                .map((v) => (
                                    <div key={v.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm">
                                        <div className="col-span-2 font-medium">v{v.versionNo}</div>
                                        <div className="col-span-3 text-muted-foreground">
                                            {new Date(v.createdAt).toLocaleString()}
                                        </div>
                                        <div className="col-span-2 text-muted-foreground">{formatBytes(v.sizeBytes)}</div>
                                        <div className="col-span-5 font-mono text-xs truncate" title={v.objectKey}>
                                            {v.objectKey}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                <p className="text-xs text-muted-foreground">
                    Tip: version downloads/restore aren’t wired in this UI yet. The backend already keeps version metadata.
                </p>
            </DialogContent>
        </Dialog>
    );
}
