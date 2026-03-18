"use client"

import { useStorageUsage } from "@/hooks/use-storage-usage"
import { formatBytes, pct } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

const CATS = [
    { key: "images", label: "Images" },
    { key: "videos", label: "Videos" },
    { key: "documents", label: "Documents" },
    { key: "audio", label: "Audio" },
    { key: "archives", label: "Archives" },
]

export function StorageStats() {
    const { data, isLoading, error } = useStorageUsage()

    const used = data?.usedBytes ?? 0
    const quota = data?.quotaBytes ?? 0
    const byCat = data?.byCategoryBytes ?? {}

    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="text-sm font-semibold">Storage</div>

            <div className="mt-3 flex items-end justify-between text-xs text-muted-foreground">
                <div>{isLoading ? "…" : `${formatBytes(used)} used`}</div>
                <div>{quota ? formatBytes(quota) : "—"}</div>
            </div>

            <div className="mt-2">
                <Progress value={pct(used, quota)} />
            </div>

            {error && (
                <div className="mt-2 text-xs text-destructive">
                    Failed to load usage
                </div>
            )}

            <div className="mt-4 space-y-3">
                {CATS.map((c) => {
                    const b = byCat[c.key] ?? 0

                    return (
                        <div key={c.key} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-foreground">{c.label}</span>
                                <span className="text-muted-foreground">{formatBytes(b)}</span>
                            </div>
                            <Progress value={pct(b, used)} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}