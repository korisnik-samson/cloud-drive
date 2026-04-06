"use client";

import { useCallback, useEffect, useState } from "react";
import { createShare, listShares, revokeShare } from "@/lib/api";
import type { CreateShareRequest, ShareLinkDto, StorageNodeDto } from "@/lib/types";
import { toast } from "sonner";

export function useShares(opts?: { autoLoad?: boolean }) {
    const [shareOpen, setShareOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<StorageNodeDto | null>(null);

    const [items, setItems] = useState<ShareLinkDto[]>([]);
    const [loading, setLoading] = useState(false);

    const refreshList = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listShares();
            setItems(res);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to load shares");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (opts?.autoLoad) void refreshList();
    }, [opts?.autoLoad, refreshList]);

    const openShare = useCallback((node: StorageNodeDto) => {
        setSelectedNode(node);
        setShareOpen(true);
    }, []);

    const closeShare = useCallback(() => {
        setShareOpen(false);
        setSelectedNode(null);
    }, []);

    const create = useCallback(
        async (req: CreateShareRequest) => {
            const created = await createShare(req);
            await refreshList();
            return created;
        },
        [refreshList]
    );

    const revoke = useCallback(
        async (id: string) => {
            await revokeShare(id);
            await refreshList();
        },
        [refreshList]
    );

    return {
        // modal state
        shareOpen,
        selectedNode,
        openShare,
        closeShare,
        setShareOpen,
        setSelectedNode,

        // list state
        items,
        loading,
        refreshList,
        create,
        revoke,
    };
}