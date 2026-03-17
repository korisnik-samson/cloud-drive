"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RenameModal({ open, onOpenChange, initialName, onRename, }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialName: string;
    onRename: (name: string) => Promise<void>;
}) {
    const [name, setName] = useState(initialName);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setName(initialName);
    }, [initialName, open]);

    async function submit() {
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }
        setBusy(true);
        try {
            await onRename(name.trim());
            toast.success("Renamed");
            onOpenChange(false);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Rename failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename</DialogTitle>
                </DialogHeader>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") void submit();
                    }}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                        Cancel
                    </Button>
                    <Button onClick={submit} disabled={busy}>
                        {busy ? "Saving…" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
