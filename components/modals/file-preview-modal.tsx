"use client";

import { useEffect, useMemo, useState } from "react";
import type { StorageNodeDto } from "@/lib/types";
import { getDownloadUrl } from "@/lib/api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

function normalizeMime(mime: string | null | undefined, name: string): string {
    if (mime && mime.trim()) return mime;
    const lower = name.toLowerCase();
    if (lower.endsWith(".pdf")) return "application/pdf";
    if (lower.endsWith(".mp4")) return "video/mp4";
    if (lower.endsWith(".webm")) return "video/webm";
    if (lower.endsWith(".mp3")) return "audio/mpeg";
    if (lower.endsWith(".wav")) return "audio/wav";
    if (lower.endsWith(".flac")) return "audio/flac";
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".gif")) return "image/gif";
    return "application/octet-stream";
}

export function FilePreviewModal({ open, onOpenChange, node, }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    node: StorageNodeDto | null;
}) {
    const [busy, setBusy] = useState(false);
    const [url, setUrl] = useState<string | null>(null);

    const mime = useMemo(() => {
        if (!node) return "";
        return normalizeMime(node.mimeType, node.name);
    }, [node]);

    useEffect(() => {
        if (!open || !node) {
            setUrl(null);
            setBusy(false);
            return;
        }

        let cancelled = false;
        setBusy(true);
        setUrl(null);
        getDownloadUrl(node.id)
            .then((res) => {
                if (cancelled) return;
                setUrl(res.url);
            })
            .catch((e) => {
                if (cancelled) return;
                toast.error(e instanceof Error ? e.message : "Failed to load preview");
            })
            .finally(() => {
                if (cancelled) return;
                setBusy(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, node?.id]);

    const canPreview = Boolean(url) && node?.type === "FILE";
    const isPdf = mime === "application/pdf";
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");
    const isAudio = mime.startsWith("audio/");

    return (
        <Dialog open={open} onOpenChange={(v) => {
                onOpenChange(v);
                if (!v) setUrl(null);
        }}>
            <DialogContent className="sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="truncate">{node?.name ?? "Preview"}</DialogTitle>
                </DialogHeader>

                <div className="min-h-[55vh]">
                    {busy && <div className="text-sm text-muted-foreground">Loading preview…</div>}

                    {!busy && !url && <div className="text-sm text-muted-foreground">No preview available.</div>}

                    {!busy && canPreview && (
                        <div className="w-full">
                            {isVideo && (
                                <video
                                    controls
                                    playsInline
                                    preload="metadata"
                                    src={url!}
                                    className="w-full max-h-[70vh] rounded-lg bg-black"
                                />
                            )}

                            {isAudio && (
                                <audio controls preload="metadata" src={url!} className="w-full"/>
                            )}

                            {isImage && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <Image src={url!} alt={node?.name ?? "image"} className="max-h-[70vh] mx-auto rounded-lg"/>
                            )}

                            {isPdf && (
                                <iframe
                                    title={node?.name ?? "pdf"}
                                    src={url!}
                                    className="w-full h-[70vh] rounded-lg bg-white"
                                />
                            )}

                            {!isVideo && !isAudio && !isImage && !isPdf && (
                                <div className="text-sm text-muted-foreground">
                                    This file type can’t be previewed yet. Use Download or Open in new tab.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>

                    <Button variant="secondary" disabled={!url}
                        onClick={() => {
                            if (!url) return;
                            window.open(url, "_blank", "noopener,noreferrer");
                    }}>
                        Open in new tab
                    </Button>

                    <Button disabled={!url}
                        onClick={() => {
                            if (!url) return;
                            // Browser download behavior depends on headers; this still works for most cases.
                            window.location.href = url;
                    }}>
                        Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
