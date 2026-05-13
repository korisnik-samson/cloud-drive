"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useUploads } from "@/hooks/use-uploads"

interface UploadModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    parentId: string | null
    onUploaded?: () => void
}

export function UploadModal({ open, onOpenChange, parentId, onUploaded }: UploadModalProps) {
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const uploads = useUploads()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? [])
        setFiles(selected)
    }

    const handleUpload = async () => {
        if (!files.length) return

        setUploading(true)
        setProgress(0)

        try {
            await uploads.uploadMany(files, parentId, setProgress)
            toast.success("Upload complete")
            setFiles([])
            onOpenChange(false)
            onUploaded?.()
        } catch (e: any) {
            toast.error(e?.message || "Upload failed")
        } finally {
            setUploading(false)
            setProgress(0)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload files</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="w-full text-sm"
                    />

                    {(uploading || uploads.busy) && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <div className="text-xs text-muted-foreground">{progress}%</div>
                        </div>
                    )}

                    <Button
                        onClick={handleUpload}
                        disabled={uploading || uploads.busy || files.length === 0}
                        className="w-full"
                    >
                        {uploading ? "Uploading…" : "Upload"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}