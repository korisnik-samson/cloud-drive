"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createShare } from "@/lib/api";
import type { ShareCreateResponse, StorageNodeDto } from "@/lib/types";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export function ShareModal({ open, onOpenChange, node, }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    node: StorageNodeDto | null;
}) {
    const [busy, setBusy] = useState(false);
    const [expiresHours, setExpiresHours] = useState<string>("24");
    const [maxDownloads, setMaxDownloads] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [created, setCreated] = useState<ShareCreateResponse | null>(null);

    const shareUrl = useMemo(() => {
        if (!created) return null;
        const base = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
        return `${base}/share/${created.token}`;
    }, [created]);

    async function submit() {
        if (!node) return;
        setBusy(true);
        try {
            const res = await createShare({
                nodeId: node.id,
                expiresInHours: expiresHours.trim() ? Number(expiresHours) : null,
                maxDownloads: maxDownloads.trim() ? Number(maxDownloads) : null,
                password: password.trim() ? password : null,
            });
            setCreated(res);
            toast.success("Share link created");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to create share");
        } finally {
            setBusy(false);
        }
    }

    async function copy() {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Copied");
        } catch {
            toast.message("Copy not available");
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                onOpenChange(v);
                if (!v) {
                    setCreated(null);
                    setPassword("");
                    setMaxDownloads("");
                    setExpiresHours("24");
                }
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Share {node?.name ?? ""}</DialogTitle>
                </DialogHeader>

                {created && shareUrl ? (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Anyone with this link can download the file.</p>
                        <div className="flex gap-2">
                            <Input readOnly value={shareUrl}/>
                            <Button variant="outline" onClick={() => void copy()}>
                                <Copy className="h-4 w-4"/>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Expires: {created.expiresAt ? new Date(created.expiresAt).toLocaleString() : "never"} • Max downloads:{" "}
                            {created.maxDownloads ?? "unlimited"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Expires in (hours)</label>
                                <Input value={expiresHours} onChange={(e) => setExpiresHours(e.target.value)} placeholder="24"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Max downloads</label>
                                <Input value={maxDownloads} onChange={(e) => setMaxDownloads(e.target.value)} placeholder="(optional)"/>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Password (optional)</label>
                            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="(optional)"/>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    {!created && (
                        <Button onClick={() => void submit()} disabled={busy || !node}>
                            {busy ? "Creating…" : "Create link"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
