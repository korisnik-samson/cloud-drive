"use client"

import { useEffect, useMemo, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SearchHeader } from "@/components/search-header"
import { type BreadcrumbItem, BreadcrumbNav } from "@/components/breadcrumb-nav"
import { QuickActions } from "@/components/quick-actions"
import { FileBrowser } from "@/components/file-browser"
import { UploadModal } from "@/components/upload-modal"
import { CreateFolderModal } from "@/components/modals/create-folder-modal"
import { RenameModal } from "@/components/modals/rename-modal"
import { MoveModal } from "@/components/modals/move-modal"
import { ShareModal } from "@/components/modals/share-modal"
import { VersionsModal } from "@/components/modals/versions-modal"
import { RecentActivityView } from "@/components/views/recent-activity"
import { SharesView } from "@/components/views/shares-view"
import { LoginPanel } from "@/components/login-panel"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

import type { StorageNodeDto } from "@/lib/types"
import { createFolder, getDownloadUrl, listNodes, listTrash, moveNode, purgeNode, renameNode, restoreNode, searchNodes, trashNode, } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { useDebounce } from "@/hooks/use-debounce"

export default function CloudStoragePage() {
    const auth = useAuth()
    const [activeNav, setActiveNav] = useState<string>("My Files")
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

    // Drive state
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
    const [crumbs, setCrumbs] = useState<BreadcrumbItem[]>([{ id: null, label: "My Files" }])

    const [items, setItems] = useState<StorageNodeDto[]>([])
    const [trashItems, setTrashItems] = useState<StorageNodeDto[]>([])
    const [loading, setLoading] = useState(false)

    // Search
    const [query, setQuery] = useState("")
    const debouncedQuery = useDebounce(query, 350)

    // Modals + selection
    const [uploadOpen, setUploadOpen] = useState(false)
    const [createFolderOpen, setCreateFolderOpen] = useState(false)
    const [renameOpen, setRenameOpen] = useState(false)
    const [moveOpen, setMoveOpen] = useState(false)
    const [shareOpen, setShareOpen] = useState(false)
    const [versionsOpen, setVersionsOpen] = useState(false)
    const [selected, setSelected] = useState<StorageNodeDto | null>(null)

    const userInitials = useMemo(() => {
        const u = auth.user?.username ?? "U"
        return u
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join("")
    }, [auth.user?.username])

    async function refreshFiles(folderId: string | null) {
        setLoading(true)
        try {
            const res = await listNodes(folderId)
            setItems(res.filter((n) => !n.trashed))
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to load files")
        } finally {
            setLoading(false)
        }
    }

    async function refreshTrash() {
        setLoading(true)
        try {
            const res = await listTrash()
            setTrashItems(res)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to load trash")
        } finally {
            setLoading(false)
        }
    }

    // Initial load once logged in
    useEffect(() => {
        if (auth.loading) return
        if (!auth.user) return
        void refreshFiles(null)
    }, [auth.loading, auth.user])

    // Nav change behavior
    useEffect(() => {
        if (!auth.user) return

        if (activeNav === "My Files" || activeNav === "Home") {
            void refreshFiles(currentFolderId)
        } else if (activeNav === "Trash") {
            void refreshTrash()
        }
        // Recent/Shared handled by their own components
    }, [activeNav])

    // Folder change behavior (only for My Files)
    useEffect(() => {
        if (!auth.user) return
        if (activeNav !== "My Files" && activeNav !== "Home") return

        // If user is searching, do not fetch folder list
        if (debouncedQuery.trim()) return

        void refreshFiles(currentFolderId)
    }, [currentFolderId])

    // Search behavior
    useEffect(() => {
        if (!auth.user) return
        if (activeNav !== "My Files" && activeNav !== "Home") return

        const q = debouncedQuery.trim()
        if (!q) return

        setLoading(true)
        searchNodes(q)
            .then((res) => setItems(res.filter((n) => !n.trashed)))
            .catch((e) => toast.error(e instanceof Error ? e.message : "Search failed"))
            .finally(() => setLoading(false))
    }, [debouncedQuery, activeNav, auth.user])

    function openFolder(folder: StorageNodeDto) {
        setQuery("")
        setActiveNav("My Files")
        setCurrentFolderId(folder.id)
        setCrumbs((prev) => [...prev, { id: folder.id, label: folder.name }])
    }

    function onBreadcrumbNavigate(id: string | null, index: number) {
        setQuery("")
        setActiveNav("My Files")
        setCurrentFolderId(id)
        setCrumbs((prev) => prev.slice(0, index + 1))
    }

    async function download(node: StorageNodeDto) {
        try {
            const res = await getDownloadUrl(node.id)
            window.location.href = res.url
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Download failed")
        }
    }

    async function doTrash(node: StorageNodeDto) {
        try {
            await trashNode(node.id)
            toast.success("Moved to trash")
            await refreshFiles(currentFolderId)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to trash")
        }
    }

    async function doRestore(node: StorageNodeDto) {
        try {
            await restoreNode(node.id)
            toast.success("Restored")
            await refreshTrash()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to restore")
        }
    }

    async function doPurge(node: StorageNodeDto) {
        try {
            await purgeNode(node.id)
            toast.success("Deleted forever")
            await refreshTrash()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to delete")
        }
    }

    async function doCreateFolder(name: string) {
        await createFolder(name, currentFolderId)
        await refreshFiles(currentFolderId)
    }

    async function doRename(name: string) {
        if (!selected) return
        await renameNode(selected.id, name)
        await refreshFiles(currentFolderId)
    }

    async function doMove(parentId: string | null) {
        if (!selected) return
        await moveNode(selected.id, parentId)
        await refreshFiles(currentFolderId)
    }

    function handleQuickAction(actionKey: string) {
        if (actionKey === "upload") setUploadOpen(true)
        if (actionKey === "new-folder") setCreateFolderOpen(true)
    }

    // Auth gate
    if (!auth.user) {
        return <LoginPanel onLogin={auth.signIn} isLoading={auth.loading}/>
    }

    const showBreadcrumbs = activeNav === "My Files" || activeNav === "Home"

    return (
        <div className="flex h-screen bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <AppSidebar
                    activeNav={activeNav}
                    onNavChange={(nav) => {
                        setActiveNav(nav)
                        if (nav === "My Files" || nav === "Home") {
                            setCurrentFolderId(null)
                            setCrumbs([{ id: null, label: "My Files" }])
                        }
                    }}
                    onUploadClick={() => setUploadOpen(true)}
                    user={{ username: auth.user.username, role: auth.user.role }}
                    onLogout={auth.signOut}
                />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-64">
                    <AppSidebar
                        activeNav={activeNav}
                        onNavChange={(nav) => {
                            setActiveNav(nav)
                            setMobileMenuOpen(false)
                            if (nav === "My Files" || nav === "Home") {
                                setCurrentFolderId(null)
                                setCrumbs([{ id: null, label: "My Files" }])
                            }
                        }}
                        onUploadClick={() => {
                            setUploadOpen(true)
                            setMobileMenuOpen(false)
                        }}
                        user={{ username: auth.user.username, role: auth.user.role }}
                        onLogout={() => {
                            auth.signOut()
                            setMobileMenuOpen(false)
                        }}
                    />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center gap-3 px-4 h-16 border-b border-border/50">
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-5 w-5"/>
                    </Button>
                    <span className="text-lg font-semibold">CloudVault</span>
                </div>

                <SearchHeader
                    query={query}
                    onQueryChange={(q) => setQuery(q)}
                    onUploadClick={() => setUploadOpen(true)}
                    userInitials={userInitials}
                />

                <main className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                        {showBreadcrumbs ? (
                            <BreadcrumbNav items={crumbs} onNavigate={onBreadcrumbNavigate}/>
                        ) : (
                            <div className="text-sm text-muted-foreground">{activeNav}</div>
                        )}
                        <QuickActions onAction={handleQuickAction}/>
                    </div>

                    {activeNav === "Recent" ? (
                        <RecentActivityView/>
                    ) : activeNav === "Shared" ? (
                        <SharesView/>
                    ) : activeNav === "Trash" ? (
                        <FileBrowser
                            title="Trash"
                            items={trashItems}
                            loading={loading}
                            onRestore={(n) => void doRestore(n)}
                            onPurge={(n) => void doPurge(n)}
                            onRename={(n) => {
                                setSelected(n)
                                setRenameOpen(true)
                            }}
                            onMove={(n) => {
                                setSelected(n)
                                setMoveOpen(true)
                            }}
                        />
                    ) : (
                        <FileBrowser
                            title={debouncedQuery.trim() ? `Search results for “${debouncedQuery.trim()}”` : "My Files"}
                            items={items}
                            loading={loading}
                            onOpenFolder={openFolder}
                            onDownload={(n) => void download(n)}
                            onShare={(n) => {
                                setSelected(n)
                                setShareOpen(true)
                            }}
                            onRename={(n) => {
                                setSelected(n)
                                setRenameOpen(true)
                            }}
                            onMove={(n) => {
                                setSelected(n)
                                setMoveOpen(true)
                            }}
                            onTrash={(n) => void doTrash(n)}
                            onVersions={(n) => {
                                setSelected(n)
                                setVersionsOpen(true)
                            }}
                        />
                    )}
                </main>

                <UploadModal
                    open={uploadOpen}
                    onOpenChange={setUploadOpen}
                    parentId={currentFolderId}
                    onUploaded={() => void refreshFiles(currentFolderId)}
                />

                <CreateFolderModal
                    open={createFolderOpen}
                    onOpenChange={setCreateFolderOpen}
                    onCreate={doCreateFolder}
                />

                <RenameModal
                    open={renameOpen}
                    onOpenChange={setRenameOpen}
                    initialName={selected?.name ?? ""}
                    onRename={doRename}
                />

                <MoveModal
                    open={moveOpen}
                    onOpenChange={setMoveOpen}
                    currentParentId={selected?.parentId ?? null}
                    onMove={doMove}
                />

                <ShareModal open={shareOpen} onOpenChange={setShareOpen} node={selected}/>

                <VersionsModal open={versionsOpen} onOpenChange={setVersionsOpen} node={selected}/>
            </div>
        </div>
    )
}
