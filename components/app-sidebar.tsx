"use client"

import { useState } from "react"
import { StorageStats } from "@/components/storage-stats"
import { UploadModal } from "@/components/upload-modal"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { ChevronDown, Clock, Cloud, FolderOpen, HelpCircle, Home, LogOut, Plus, Settings, Share2, Star, Trash2, } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: FolderOpen, label: "My Files", href: "/files" },
    { icon: Clock, label: "Recent", href: "/recent" },
    { icon: Star, label: "Starred", href: "/starred" },
    { icon: Share2, label: "Shared", href: "/shared" },
    { icon: Trash2, label: "Trash", href: "/trash" },
]

interface AppSidebarProps {
    activeNav?: string
    onNavChange?: (nav: string) => void
}

export function AppSidebar({ activeNav = "My Files", onNavChange }: AppSidebarProps) {
    const [uploadOpen, setUploadOpen] = useState(false)

    return (
        <>
            <aside className="flex flex-col w-64 h-full border-r border-border/50 bg-sidebar">
                {/* Logo */}
                <div className="flex items-center gap-2 px-4 h-16 border-b border-border/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                        <Cloud className="h-5 w-5 text-primary-foreground"/>
                    </div>
                    <span className="text-lg font-semibold text-sidebar-foreground">CloudVault</span>
                </div>

                {/* Upload Button */}
                <div className="p-4">
                    <Button
                        onClick={() => setUploadOpen(true)}
                        className="w-full gap-2"
                    >
                        <Plus className="h-4 w-4"/>
                        Upload
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => onNavChange?.(item.label)}
                            className={cn(
                                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeNav === item.label
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                        >
                            <item.icon className="h-5 w-5"/>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Storage Stats */}
                <div className="p-4 border-t border-border/50">
                    <StorageStats/>
                </div>

                {/* User Menu */}
                <div className="p-4 border-t border-border/50">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder-avatar.jpg"/>
                                    <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-sidebar-foreground">John Doe</p>
                                    <p className="text-xs text-muted-foreground">Pro Plan</p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2"/> Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <HelpCircle className="h-4 w-4 mr-2"/> Help & Support
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <LogOut className="h-4 w-4 mr-2"/> Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            <UploadModal open={uploadOpen} onOpenChange={setUploadOpen}/>
        </>
    )
}
