"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SearchHeader } from "@/components/search-header"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { QuickActions } from "@/components/quick-actions"
import { FileBrowser } from "@/components/file-browser"
import { UploadModal } from "@/components/upload-modal"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function CloudStoragePage() {
    const [activeNav, setActiveNav] = useState<string>("My Files")
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [uploadOpen, setUploadOpen] = useState(false)

    const handleQuickAction = (action: string) => {
        if (action === "Upload") {
            setUploadOpen(true)
        }
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <AppSidebar activeNav={activeNav} onNavChange={setActiveNav} />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-64">
                    <AppSidebar activeNav={activeNav} onNavChange={(nav) => {
                        setActiveNav(nav)
                        setMobileMenuOpen(false)
                    }} />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <SearchHeader onMenuClick={() => setMobileMenuOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Breadcrumb */}
                        <BreadcrumbNav path={["My Files"]} />

                        {/* Page Header */}
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">{activeNav}</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage and organize your files and folders
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <QuickActions onAction={handleQuickAction} />

                        {/* File Browser */}
                        <div>
                            <h2 className="text-lg font-medium text-foreground mb-4">All Files</h2>
                            <FileBrowser />
                        </div>
                    </div>
                </main>
            </div>

            <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
        </div>
    )
}
