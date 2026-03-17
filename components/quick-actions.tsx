"use client"

import { Plus, Upload, FileText, FolderPlus, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const actions = [
  { icon: FolderPlus, label: "New Folder", key: "new-folder" },
  { icon: Upload, label: "Upload", key: "upload" },
  { icon: FileText, label: "New Document", key: "new-doc" },
  { icon: Link2, label: "Share Link", key: "share-link" },
]

export function QuickActions({
  onAction,
}: {
  onAction?: (actionKey: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button className="gap-2" onClick={() => onAction?.("upload")}>
        <Plus className="h-4 w-4" />
        New
      </Button>
      <div className="hidden md:flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.key}
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => onAction?.(action.key)}
            disabled={action.key === "new-doc" || action.key === "share-link"}
            title={action.key === "new-doc" || action.key === "share-link" ? "Coming soon" : undefined}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
