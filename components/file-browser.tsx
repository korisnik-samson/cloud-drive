"use client"

import { useState } from "react"
import { FileIcon } from "@/components/file-icon"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Copy, Download, Edit3, Grid3X3, List, MoreHorizontal, Move, Share2, Star, Trash2, } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileItem {
    id: string
    name: string
    type: string
    size: string
    modified: string
    starred: boolean
    shared: boolean
}

const files: FileItem[] = [
    { id: "1", name: "Project Assets", type: "folder", size: "—", modified: "Jan 24, 2026", starred: true, shared: true },
    { id: "2", name: "Design System", type: "folder", size: "—", modified: "Jan 23, 2026", starred: false, shared: false },
    { id: "3", name: "Q4 Report.pdf", type: "document", size: "2.4 MB", modified: "Jan 22, 2026", starred: true, shared: true },
    { id: "4", name: "Dashboard Mockup.fig", type: "image", size: "8.7 MB", modified: "Jan 21, 2026", starred: false, shared: false },
    { id: "5", name: "Product Demo.mp4", type: "video", size: "156 MB", modified: "Jan 20, 2026", starred: false, shared: true },
    { id: "6", name: "Brand Guidelines.pdf", type: "document", size: "4.2 MB", modified: "Jan 19, 2026", starred: true, shared: false },
    { id: "7", name: "Meeting Notes.docx", type: "document", size: "156 KB", modified: "Jan 18, 2026", starred: false, shared: false },
    { id: "8", name: "source-code.zip", type: "archive", size: "24.8 MB", modified: "Jan 17, 2026", starred: false, shared: false },
    { id: "9", name: "Analytics Data.xlsx", type: "spreadsheet", size: "1.8 MB", modified: "Jan 16, 2026", starred: false, shared: true },
    { id: "10", name: "Team Photo.jpg", type: "image", size: "3.2 MB", modified: "Jan 15, 2026", starred: true, shared: false },
]

export function FileBrowser() {
    const [viewMode, setViewMode] = useState<"list" | "grid">("list")
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])

    const toggleFileSelection = (fileId: string) => {
        setSelectedFiles((prev) =>
            prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
        )
    }

    const toggleAllFiles = () => {
        if (selectedFiles.length === files.length) {
            setSelectedFiles([])
        } else {
            setSelectedFiles(files.map((f) => f.id))
        }
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {selectedFiles.length > 0 && (
                        <>
              <span className="text-sm text-muted-foreground">
                {selectedFiles.length} selected
              </span>
                            <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-2"/>
                                Download
                            </Button>
                            <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4 mr-2"/>
                                Share
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2"/>
                                Delete
                            </Button>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                    >
                        <List className="h-4 w-4"/>
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                    >
                        <Grid3X3 className="h-4 w-4"/>
                    </Button>
                </div>
            </div>

            {viewMode === "list" ? (
                <div className="rounded-lg border border-border/50 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedFiles.length === files.length}
                                        onCheckedChange={toggleAllFiles}
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden sm:table-cell">Size</TableHead>
                                <TableHead className="hidden md:table-cell">Modified</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.map((file) => (
                                <TableRow
                                    key={file.id}
                                    className={cn(
                                        "cursor-pointer transition-colors",
                                        selectedFiles.includes(file.id) && "bg-accent"
                                    )}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedFiles.includes(file.id)}
                                            onCheckedChange={() => toggleFileSelection(file.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <FileIcon type={file.type}/>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground">{file.name}</span>
                                                {file.starred && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400"/>}
                                                {file.shared && <Share2 className="h-3.5 w-3.5 text-muted-foreground"/>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                                        {file.size}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                        {file.modified}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem>
                                                    <Download className="h-4 w-4 mr-2"/> Download
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Share2 className="h-4 w-4 mr-2"/> Share
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Star className="h-4 w-4 mr-2"/> {file.starred ? "Unstar" : "Star"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem>
                                                    <Edit3 className="h-4 w-4 mr-2"/> Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Copy className="h-4 w-4 mr-2"/> Make a copy
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Move className="h-4 w-4 mr-2"/> Move to
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                    <Trash2 className="h-4 w-4 mr-2"/> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            onClick={() => toggleFileSelection(file.id)}
                            className={cn(
                                "group relative flex flex-col items-center p-4 rounded-lg border border-border/50 cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/50",
                                selectedFiles.includes(file.id) && "border-primary bg-accent"
                            )}
                        >
                            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Checkbox
                                    checked={selectedFiles.includes(file.id)}
                                    onCheckedChange={() => toggleFileSelection(file.id)}
                                />
                            </div>
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                                {file.starred && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400"/>}
                            </div>
                            <FileIcon type={file.type} className="h-12 w-12 mb-3"/>
                            <span className="text-sm font-medium text-foreground text-center truncate w-full">
                {file.name}
              </span>
                            <span className="text-xs text-muted-foreground">{file.size}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
