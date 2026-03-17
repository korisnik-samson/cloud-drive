"use client"

import React from "react";
import { useMemo, useState } from "react"
import { Download, Flame, FolderInput, Grid3X3, History, List, MoreHorizontal, Pencil, RotateCcw, Share2, Trash2, } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { FileIcon } from "@/components/file-icon"
import type { StorageNodeDto } from "@/lib/types"

function formatBytes(bytes?: number | null) {
    if (!bytes && bytes !== 0) return "—"
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    let i = 0
    let n = bytes
    while (n >= 1024 && i < sizes.length - 1) {
        n /= 1024
        i++
    }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}

function formatDate(iso?: string | null) {
    if (!iso) return "—"
    const d = new Date(iso)
    return d.toLocaleString()
}

function iconType(node: StorageNodeDto) {
    if (node.type === "FOLDER") return "folder" as const
    const mt = node.mimeType ?? ""

    if (mt.startsWith("image/"))
        return "image" as const

    if (mt.startsWith("video/"))
        return "video" as const

    if (mt.startsWith("audio/"))
        return "audio" as const

    if (mt.includes("pdf"))
        return "document" as const

    if (mt.includes("zip") || mt.includes("rar") || mt.includes("7z") || mt.includes("tar"))
        return "archive" as const

    if (mt.includes("spreadsheet") || mt.includes("excel") || mt.includes("csv"))
        return "spreadsheet" as const

    if (mt.includes("presentation") || mt.includes("powerpoint"))
        return "presentation" as const

    if (mt.includes("json") || mt.includes("xml") || mt.includes("javascript") || mt.includes("text"))
        return "code" as const

    return "document" as const
}

export function FileBrowser({ items, loading, onOpenFolder, onDownload,
        onShare, onRename, onMove, onTrash, onRestore,
        onPurge, onVersions, title, }: {
    items: StorageNodeDto[]
    loading?: boolean
    title?: string
    onOpenFolder?: (folder: StorageNodeDto) => void
    onDownload?: (file: StorageNodeDto) => void
    onShare?: (file: StorageNodeDto) => void
    onRename?: (node: StorageNodeDto) => void
    onMove?: (node: StorageNodeDto) => void
    onTrash?: (node: StorageNodeDto) => void
    onRestore?: (node: StorageNodeDto) => void
    onPurge?: (node: StorageNodeDto) => void
    onVersions?: (file: StorageNodeDto) => void
}) {
    const [viewMode, setViewMode] = useState<"list" | "grid">("list")
    const [filter, setFilter] = useState("")

    const filtered = useMemo(() => {
        if (!filter.trim()) return items
        const q = filter.toLowerCase()
        return items.filter((n) => n.name.toLowerCase().includes(q))
    }, [items, filter])

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">{title ?? "Files"}</h1>
                    <p className="text-sm text-muted-foreground">
                        {loading ? "Loading…" : `${filtered.length} item${filtered.length === 1 ? "" : "s"}`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Input
                            placeholder="Filter in this view…"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-64"
                        />
                    </div>
                    <div className="flex items-center border border-border rounded-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("rounded-r-none", viewMode === "list" && "bg-muted")}
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("rounded-l-none", viewMode === "grid" && "bg-muted")}
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid3X3 className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {viewMode === "list" ? (
                    <div className="space-y-1">
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border/50">
                            <div className="col-span-6">Name</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-2">Size</div>
                            <div className="col-span-2">Modified</div>
                        </div>

                        {filtered.map((node) => {
                            const isFolder = node.type === "FOLDER"
                            const isFile = node.type === "FILE"
                            return (
                                <div
                                    key={node.id}
                                    className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="col-span-6 flex items-center gap-3 min-w-0">
                                        <FileIcon type={iconType(node)} className="h-5 w-5"/>
                                        <button
                                            className={cn(
                                                "text-sm font-medium truncate text-left",
                                                isFolder && "hover:underline"
                                            )}
                                            onClick={() => (isFolder ? onOpenFolder?.(node) : undefined)}
                                            type="button"
                                            title={node.name}
                                        >
                                            {node.name}
                                        </button>
                                    </div>

                                    <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                                        {isFolder ? "Folder" : "File"}
                                    </div>
                                    <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                                        {isFile ? formatBytes(node.sizeBytes) : "—"}
                                    </div>
                                    <div className="col-span-2 flex items-center justify-between text-sm text-muted-foreground">
                                        <span>{formatDate(node.updatedAt)}</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {isFile && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => onDownload?.(node)}>
                                                            <Download className="h-4 w-4 mr-2"/> Download
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onVersions?.(node)}>
                                                            <History className="h-4 w-4 mr-2"/> Versions
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onShare?.(node)}>
                                                            <Share2 className="h-4 w-4 mr-2"/> Share
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator/>
                                                    </>
                                                )}
                                                <DropdownMenuItem onClick={() => onRename?.(node)}>
                                                    <Pencil className="h-4 w-4 mr-2"/> Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onMove?.(node)}>
                                                    <FolderInput className="h-4 w-4 mr-2"/> Move
                                                </DropdownMenuItem>
                                                {onTrash && (
                                                    <DropdownMenuItem className="text-destructive" onClick={() => onTrash(node)}>
                                                        <Trash2 className="h-4 w-4 mr-2"/> Move to trash
                                                    </DropdownMenuItem>
                                                )}
                                                {onRestore && (
                                                    <DropdownMenuItem onClick={() => onRestore(node)}>
                                                        <RotateCcw className="h-4 w-4 mr-2"/> Restore
                                                    </DropdownMenuItem>
                                                )}
                                                {onPurge && (
                                                    <DropdownMenuItem className="text-destructive" onClick={() => onPurge(node)}>
                                                        <Flame className="h-4 w-4 mr-2"/> Delete forever
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            )
                        })}

                        {!loading && filtered.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-12">
                                Nothing here yet.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filtered.map((node) => {
                            const isFolder = node.type === "FOLDER"
                            const isFile = node.type === "FILE"

                            return (
                                <div key={node.id} className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileIcon type={iconType(node)} className="h-5 w-5"/>
                                            <button className={cn("text-sm font-medium truncate text-left",
                                                    isFolder && "hover:underline"
                                                )}
                                                onClick={() => (isFolder ? onOpenFolder?.(node) : undefined)}
                                                type="button"
                                                title={node.name}>

                                                {node.name}
                                            </button>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                {isFile && (
                                                    <React.Fragment>
                                                        <DropdownMenuItem onClick={() => onDownload?.(node)}>
                                                            <Download className="h-4 w-4 mr-2"/> Download
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onShare?.(node)}>
                                                            <Share2 className="h-4 w-4 mr-2"/> Share
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator/>
                                                    </React.Fragment>
                                                )}
                                                <DropdownMenuItem onClick={() => onRename?.(node)}>
                                                    <Pencil className="h-4 w-4 mr-2"/> Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onMove?.(node)}>
                                                    <FolderInput className="h-4 w-4 mr-2"/> Move
                                                </DropdownMenuItem>
                                                {onTrash && (
                                                    <DropdownMenuItem className="text-destructive" onClick={() => onTrash(node)}>
                                                        <Trash2 className="h-4 w-4 mr-2"/> Move to trash
                                                    </DropdownMenuItem>
                                                )}
                                                {onRestore && (
                                                    <DropdownMenuItem onClick={() => onRestore(node)}>
                                                        <RotateCcw className="h-4 w-4 mr-2"/> Restore
                                                    </DropdownMenuItem>
                                                )}
                                                {onPurge && (
                                                    <DropdownMenuItem className="text-destructive" onClick={() => onPurge(node)}>
                                                        <Flame className="h-4 w-4 mr-2"/> Delete forever
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="mt-3 text-xs text-muted-foreground space-y-1">
                                        <div>{isFolder ? "Folder" : node.mimeType || "File"}</div>
                                        <div>{isFile ? formatBytes(node.sizeBytes) : "—"}</div>
                                    </div>
                                </div>
                            )
                        })}
                        {!loading && filtered.length === 0 && (
                            <div className="col-span-full text-center text-sm text-muted-foreground py-12">Nothing here yet.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
