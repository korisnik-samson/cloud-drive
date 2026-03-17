"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listNodes } from "@/lib/api";
import type { StorageNodeDto } from "@/lib/types";
import { toast } from "sonner";
import { ChevronRight, Folder } from "lucide-react";

type Crumb = { id: string | null; label: string };

export function MoveModal({ open, onOpenChange, currentParentId, onMove }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentParentId: string | null;
    onMove: (parentId: string | null) => Promise<void>;
}) {
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [folderParentId, setFolderParentId] = useState<string | null>(null);
    const [crumbs, setCrumbs] = useState<Crumb[]>([{ id: null, label: "Root" }]);
    const [folders, setFolders] = useState<StorageNodeDto[]>([]);

    async function refresh(parentId: string | null) {
        setLoading(true);
        try {
            const nodes = await listNodes(parentId);
            setFolders(nodes.filter((n) => n.type === "FOLDER" && !n.trashed));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to load folders");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!open) return;

        // Reset each time
        setFolderParentId(null);
        setCrumbs([{ id: null, label: "Root" }]);
        setFilter("");

        void refresh(null);
    }, [open]);

    const filtered = useMemo(() => {
        if (!filter.trim()) return folders;
        const q = filter.toLowerCase();
        return folders.filter((f) => f.name.toLowerCase().includes(q));
    }, [folders, filter]);

    async function chooseFolder(folder: StorageNodeDto) {
        setFolderParentId(folder.id);
        setCrumbs((prev) => [...prev, { id: folder.id, label: folder.name }]);

        await refresh(folder.id);
    }

    async function goToCrumb(index: number) {
        const c = crumbs[index];

        setCrumbs((prev) => prev.slice(0, index + 1));
        setFolderParentId(c.id);

        await refresh(c.id);
    }

    async function submit() {
        setBusy(true);
        try {
            if (folderParentId === currentParentId) {
                toast.message("Already in that folder");
                return;
            }

            await onMove(folderParentId);

            toast.success("Moved");
            onOpenChange(false);

        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Move failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Move to…</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {crumbs.map((c, idx) => (
                            <div key={`${c.label}-${idx}`} className="flex items-center gap-1">
                                {idx > 0 && <ChevronRight className="h-4 w-4"/>}
                                <button
                                    type="button"
                                    className={idx === crumbs.length - 1 ? "text-foreground font-medium" : "hover:text-foreground"}
                                    onClick={() => void goToCrumb(idx)}
                                >
                                    {c.label}
                                </button>
                            </div>
                        ))}
                    </div>

                    <Input placeholder="Filter folders…" value={filter} onChange={(e) => setFilter(e.target.value)}/>

                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground">No folders here.</div>
                        ) : (
                            <div className="divide-y">
                                {filtered.map((f) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 text-left"
                                        onClick={() => void chooseFolder(f)}
                                    >
                                        <Folder className="h-4 w-4"/>
                                        <span className="truncate">{f.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Destination: <span className="font-medium text-foreground">{crumbs[crumbs.length - 1]?.label}</span>
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                        Cancel
                    </Button>
                    <Button onClick={() => void submit()} disabled={busy}>
                        {busy ? "Moving…" : "Move here"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
