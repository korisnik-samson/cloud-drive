"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    createFolder,
    listNodes,
    listTrash,
    moveNode,
    purgeNode,
    renameNode,
    restoreNode,
    searchNodes,
    trashNode,
} from "@/lib/api";
import type { StorageNodeDto } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export type NodesView = "FILES" | "TRASH";

export type BreadcrumbItem = {
    id: string | null;
    label: string;
};

export function useNodes() {
    const [view, setView] = useState<NodesView>("FILES");
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    // Breadcrumbs for FILES view only (Trash/Search are synthetic)
    const [crumbStack, setCrumbStack] = useState<BreadcrumbItem[]>([
        { id: null, label: "Home" },
    ]);

    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 250);

    const [folderItems, setFolderItems] = useState<StorageNodeDto[]>([]);
    const [trashItems, setTrashItems] = useState<StorageNodeDto[]>([]);
    const [searchItems, setSearchItems] = useState<StorageNodeDto[]>([]);
    const [loading, setLoading] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
        if (debouncedQuery.trim())
            return [{ id: null, label: "Home" }, { id: null, label: "Search" }];
        if (view === "TRASH")
            return [{ id: null, label: "Home" }, { id: null, label: "Trash" }];
        return crumbStack;
    }, [crumbStack, debouncedQuery, view]);

    const items: StorageNodeDto[] = useMemo(() => {
        if (debouncedQuery.trim()) return searchItems;
        return view === "TRASH" ? trashItems : folderItems;
    }, [debouncedQuery, folderItems, searchItems, trashItems, view]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const q = debouncedQuery.trim();

            if (q) {
                const res = await searchNodes(q);
                setSearchItems(res);
                return;
            }

            if (view === "TRASH") {
                const res = await listTrash();
                setTrashItems(res);
                return;
            }

            const res = await listNodes(currentFolderId);
            setFolderItems(res);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to load nodes");
        } finally {
            setLoading(false);
        }
    }, [currentFolderId, debouncedQuery, view]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const goHome = useCallback(() => {
        setView("FILES");
        setCurrentFolderId(null);
        setCrumbStack([{ id: null, label: "Home" }]);
    }, []);

    const openFolder = useCallback((folder: StorageNodeDto) => {
        setView("FILES");
        setCurrentFolderId(folder.id);
        setCrumbStack((prev) => {
            const idx = prev.findIndex((c) => c.id === folder.id);
            if (idx >= 0) return prev.slice(0, idx + 1);
            return [...prev, { id: folder.id, label: folder.name }];
        });
    }, []);

    const navigateBreadcrumb = useCallback(
        (crumb: BreadcrumbItem, index: number) => {
            if (crumb.label === "Trash") {
                setView("TRASH");
                return;
            }
            if (crumb.label === "Search") {
                setQuery("");
                return;
            }
            setView("FILES");
            setCurrentFolderId(crumb.id);
            setCrumbStack((prev) => prev.slice(0, index + 1));
        },
        []
    );

    const createNewFolder = useCallback(
        async (name: string) => {
            await createFolder(name, currentFolderId);
            await refresh();
        },
        [currentFolderId, refresh]
    );

    const rename = useCallback(
        async (nodeId: string, name: string) => {
            await renameNode(nodeId, name);
            await refresh();
        },
        [refresh]
    );

    const move = useCallback(
        async (nodeId: string, parentId: string | null) => {
            await moveNode(nodeId, parentId);
            await refresh();
        },
        [refresh]
    );

    const trash = useCallback(
        async (nodeId: string) => {
            await trashNode(nodeId);
            await refresh();
        },
        [refresh]
    );

    const restore = useCallback(
        async (nodeId: string) => {
            await restoreNode(nodeId);
            await refresh();
        },
        [refresh]
    );

    const purge = useCallback(
        async (nodeId: string) => {
            await purgeNode(nodeId);
            await refresh();
        },
        [refresh]
    );

    return {
        view,
        currentFolderId,
        breadcrumbs,
        query,
        debouncedQuery,
        items,
        loading,

        setView,
        setQuery,
        refresh,

        goHome,
        openFolder,
        navigateBreadcrumb,

        createNewFolder,
        rename,
        move,
        trash,
        restore,
        purge,
    };
}