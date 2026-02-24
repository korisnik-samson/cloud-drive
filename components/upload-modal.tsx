"use client"

import React, { useCallback, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, FileText, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadFile {
    id: string
    name: string
    size: string
    progress: number
    status: "uploading" | "complete" | "error"
}

interface UploadModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [files, setFiles] = useState<UploadFile[]>([
        { id: "1", name: "presentation.pptx", size: "4.2 MB", progress: 100, status: "complete" },
        { id: "2", name: "budget-2026.xlsx", size: "1.8 MB", progress: 67, status: "uploading" },
        { id: "3", name: "meeting-notes.pdf", size: "256 KB", progress: 0, status: "error" },
    ])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        // Handle file drop
    }, [])

    const removeFile = (fileId: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                            isDragging
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                        )}
                    >
                        <div className="rounded-full bg-primary/10 p-4 mb-4">
                            <Upload className="h-8 w-8 text-primary"/>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">
                            Drag and drop files here
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            or click to browse from your computer
                        </p>
                        <Button variant="outline" size="sm">
                            Browse Files
                        </Button>
                        <input
                            type="file"
                            multiple
                            className="absolute inset-0 cursor-pointer opacity-0"
                        />
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-foreground">Uploading {files.length} files</h4>
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                                >
                                    <div className="rounded-lg bg-muted p-2">
                                        <FileText className="h-5 w-5 text-muted-foreground"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </span>
                                            <div className="flex items-center gap-2">
                                                {file.status === "complete" && (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500"/>
                                                )}
                                                {file.status === "error" && (
                                                    <AlertCircle className="h-4 w-4 text-destructive"/>
                                                )}
                                                <button
                                                    onClick={() => removeFile(file.id)}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Progress
                                                value={file.progress}
                                                className={cn(
                                                    "h-1 flex-1",
                                                    file.status === "error" && "[&>div]:bg-destructive"
                                                )}
                                            />
                                            <span className="text-xs text-muted-foreground w-12 text-right">
                        {file.status === "error" ? "Failed" : `${file.progress}%`}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
