"use client"

import { useMemo, useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { initiateUpload, completeUpload } from "@/lib/api"
import { toast } from "sonner"

function putWithProgress(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)

    // If your presigned URL was generated without signing Content-Type, this header is still usually OK.
    // If you ever get SignatureDoesNotMatch, remove this setRequestHeader.
    if (file.type) xhr.setRequestHeader("Content-Type", file.type)

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        onProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`))
    }

    xhr.onerror = () => reject(new Error("Network error during upload"))
    xhr.send(file)
  })
}

export function UploadModal({
  open,
  onOpenChange,
  parentId,
  onUploaded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId: string | null
  onUploaded?: () => void
}) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const totalSize = useMemo(() => files.reduce((s, f) => s + (f.size || 0), 0), [files])

  async function uploadAll() {
    if (files.length === 0) {
      toast.error("Choose a file first")
      return
    }

    setIsUploading(true)
    setProgress(0)

    try {
      // Upload sequentially for simplicity (and clearer progress)
      let uploadedBytes = 0

      for (const file of files) {
        const init = await initiateUpload({
          parentId,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        })

        let lastPct = 0
        await putWithProgress(init.uploadUrl, file, (pct) => {
          // translate per-file progress into total progress
          const fileBytes = (pct / 100) * file.size
          const totalPct = Math.round(((uploadedBytes + fileBytes) / Math.max(totalSize, 1)) * 100)
          if (totalPct !== lastPct) {
            lastPct = totalPct
            setProgress(totalPct)
          }
        })

        uploadedBytes += file.size

        await completeUpload({
          parentId,
          objectKey: init.objectKey,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          checksumSha256: null,
        })
      }

      toast.success("Upload complete")
      setFiles([])
      onOpenChange(false)
      onUploaded?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return
    setFiles(Array.from(fileList))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
            <input
              type="file"
              multiple
              className="hidden"
              id="file-upload"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Choose Files</span>
              </Button>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Selected ({files.length})</p>
                <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                  Clear
                </Button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                  Cancel
                </Button>
                <Button onClick={uploadAll} disabled={isUploading}>
                  {isUploading ? "Uploading…" : "Upload"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
