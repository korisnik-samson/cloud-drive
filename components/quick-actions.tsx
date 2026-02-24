"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, FolderPlus, Link, Upload, } from "lucide-react"

const actions = [
    { icon: FolderPlus, label: "New Folder", color: "text-primary" },
    { icon: Upload, label: "Upload", color: "text-emerald-500" },
    { icon: FileText, label: "New Doc", color: "text-blue-500" },
    { icon: Link, label: "Add Link", color: "text-amber-500" },
]

interface QuickActionsProps {
    onAction?: (action: string) => void
}

export function QuickActions({ onAction }: QuickActionsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {actions.map((action) => (
                <Card
                    key={action.label}
                    onClick={() => onAction?.(action.label)}
                    className="cursor-pointer border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all"
                >
                    <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
                        <action.icon className={`h-6 w-6 ${action.color}`}/>
                        <span className="text-sm font-medium text-foreground">{action.label}</span>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
