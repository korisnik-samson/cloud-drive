"use client"

import { useEffect, useMemo, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SearchHeader } from "@/components/search-header"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { QuickActions } from "@/components/quick-actions"
import { FileBrowser } from "@/components/file-browser"
import { UploadModal } from "@/components/upload-modal"
import { CreateFolderModal } from "@/components/modals/create-folder-modal"
import { RenameModal } from "@/components/modals/rename-modal"
import { MoveModal } from "@/components/modals/move-modal"
import { ShareModal } from "@/components/modals/share-modal"
import { VersionsModal } from "@/components/modals/versions-modal"
import { FilePreviewModal } from "@/components/modals/file-preview-modal"
import { RecentActivityView } from "@/components/views/recent-activity"
import { SharesView } from "@/components/views/shares-view"
import { LoginPanel } from "@/components/login-panel"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

import type { StorageNodeDto } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"

// ✅ NEW HOOKS
import { useNodes } from "@/hooks/use-nodes"
import { useUploads } from "@/hooks/use-uploads"
import { useShares } from "@/hooks/use-shares"

export default function CloudStoragePage() {
    const auth = useAuth()

    // UI nav state
    const [activeNav, setActiveNav] = useState<string>("My Files")
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

    // Modals
    const [uploadOpen, setUploadOpen] = useState(false)
    const [createFolderOpen, setCreateFolderOpen] = useState(false)
    const [renameOpen, setRenameOpen] = useState(false)
    const [moveOpen, setMoveOpen] = useState(false)
    const [versionsOpen, setVersionsOpen] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false)

    // Selection (kept local because several modals use it)
    const [selected, setSelected] = useState<StorageNodeDto | null>(null)

    // ✅ Hook instances
    const nodes = useNodes()
    const uploads = useUploads()
    const shares = useShares()

    const userInitials = useMemo(() => {
        const u = auth.user?.username ?? "U"
        return u
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join("")
    }, [auth.user?.username])

    // When user logs in, load files
    useEffect(() => {
        if (auth.loading) return
        if (!auth.user) return
        nodes.goHome()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.loading, auth.user])

    function handleNavChange(nav: string) {
        setActiveNav(nav)

        // Tie sidebar nav to nodes view
        if (nav === "Trash") {
            nodes.setView("TRASH")
        } else if (nav === "My Files" || nav === "Home") {
            nodes.goHome()
        }

        // close mobile sheet after navigation
        setMobileMenuOpen(false)
    }

    function handleQuickAction(actionKey: string) {
        // always keep upload/folder actions in FILES view
        if (nodes.view !== "FILES") nodes.setView("FILES")

        if (actionKey === "upload") setUploadOpen(true)
        if (actionKey === "new-folder") setCreateFolderOpen(true)
    }

    async function doCreateFolder(name: string) {
        await nodes.createNewFolder(name)
    }

    async function doRename(name: string) {
        if (!selected) return
        await nodes.rename(selected.id, name)
    }

    async function doMove(parentId: string | null) {
        if (!selected) return
        await nodes.move(selected.id, parentId)
    }

    // Auth gate
    if (!auth.user) {
        return <LoginPanel onLogin={auth.signIn} isLoading={auth.loading} />
    }

    const showBreadcrumbs = activeNav === "My Files" || activeNav === "Home"

    const isTrash = nodes.view === "TRASH"

    // @ts-ignore
    return (
        <div className="flex h-screen bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <AppSidebar activeNav={activeNav} onNavChange={handleNavChange} onUploadClick={() => setUploadOpen(true)}
                    user={{ username: auth.user.username, role: auth.user.role }} onLogout={auth.signOut} />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-64">
                    <AppSidebar
                        activeNav={activeNav}
                        onNavChange={handleNavChange}
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
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="text-lg font-semibold">CloudVault</span>
                </div>

                {/* ✅ Search now comes from useNodes */}
                <SearchHeader query={nodes.query} onQueryChange={nodes.setQuery}
                    onUploadClick={() => setUploadOpen(true)} userInitials={userInitials} />

                <main className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                        {showBreadcrumbs ? (
                                // @ts-ignore
                            <BreadcrumbNav items={nodes.breadcrumbs} onNavigate={nodes.navigateBreadcrumb} />
                        ) : (
                            <div className="text-sm text-muted-foreground">{activeNav}</div>
                        )}
                        <QuickActions onAction={handleQuickAction} />
                    </div>

                    {/* Existing views remain */}
                    {activeNav === "Recent" ? (
                        <RecentActivityView />
                    ) : activeNav === "Shared" ? (
                        <SharesView />
                    ) : isTrash ? (
                        <FileBrowser
                            title="Trash"
                            items={nodes.items}
                            loading={nodes.loading}
                            onRestore={(n) => void nodes.restore(n.id)}
                            onPurge={(n) => void nodes.purge(n.id)}
                            onPreview={(n) => {
                                setSelected(n)
                                setPreviewOpen(true)
                            }}
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
                            title={
                                nodes.debouncedQuery.trim()
                                    ? `Search results for “${nodes.debouncedQuery.trim()}”`
                                    : "My Files"
                            }
                            items={nodes.items}
                            loading={nodes.loading}
                            onOpenFolder={nodes.openFolder}
                            onPreview={(n) => {
                                setSelected(n)
                                setPreviewOpen(true)
                            }}
                            onDownload={(n) => void uploads.downloadByNodeId(n.id)}
                            onShare={(n) => shares.openShare(n)}
                            onRename={(n) => {
                                setSelected(n)
                                setRenameOpen(true)
                            }}
                            onMove={(n) => {
                                setSelected(n)
                                setMoveOpen(true)
                            }}
                            onTrash={(n) => void nodes.trash(n.id)}
                            onVersions={(n) => {
                                setSelected(n)
                                setVersionsOpen(true)
                            }}
                        />
                    )}
                </main>

                {/* Upload */}
                <UploadModal
                    open={uploadOpen}
                    onOpenChange={setUploadOpen}
                    parentId={nodes.currentFolderId}
                    onUploaded={() => void nodes.refresh()}
                />

                {/* Create folder */}
                <CreateFolderModal
                    open={createFolderOpen}
                    onOpenChange={setCreateFolderOpen}
                    onCreate={doCreateFolder}
                />

                {/* Rename */}
                <RenameModal
                    open={renameOpen}
                    onOpenChange={setRenameOpen}
                    initialName={selected?.name ?? ""}
                    onRename={doRename}
                />

                {/* Move */}
                <MoveModal
                    open={moveOpen}
                    onOpenChange={setMoveOpen}
                    currentParentId={selected?.parentId ?? null}
                    onMove={doMove}
                />

                {/* Share */}
                <ShareModal
                    open={shares.shareOpen}
                    onOpenChange={(open) => {
                        if (!open) shares.closeShare()
                        else shares.setShareOpen(true)
                    }}
                    node={shares.selectedNode}
                />

                {/* Versions */}
                <VersionsModal
                    open={versionsOpen}
                    onOpenChange={setVersionsOpen}
                    node={selected}
                />

                {/* Preview */}
                <FilePreviewModal
                    open={previewOpen}
                    onOpenChange={setPreviewOpen}
                    node={selected}
                />
            </div>
        </div>
    )
}