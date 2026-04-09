"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { useShares } from "@/hooks/use-shares"

export function SharesView() {
    const shares = useShares()

    useEffect(() => {
        void shares.refreshList()
    }, [shares])

    const copy = async (text: string) => {
        await navigator.clipboard.writeText(text)
        toast.success("Copied link")
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Shared links</h2>
                <Button variant="outline" onClick={() => shares.refreshList()} disabled={shares.loading}>
                    Refresh
                </Button>
            </div>

            {shares.items.length === 0 ? (
                <div className="text-sm text-muted-foreground">No shares yet.</div>
            ) : (
                <div className="grid gap-3">
                    {shares.items.map((s) => (
                        <Card key={s.id}>
                            <CardContent className="py-4 flex flex-col gap-2">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-medium truncate">{s.token}</div>
                                        <div className="text-xs text-muted-foreground">
                                            downloads: {s.downloadCount} • active: {String(s.active)}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* TODO: Look at this token should be url*/}
                                        <Button variant="secondary" onClick={() => copy(s.token)}>
                                            Copy
                                        </Button>
                                        <Button variant="destructive" onClick={() => shares.revoke(s.id)}>
                                            Revoke
                                        </Button>
                                    </div>
                                </div>

                                {/* TODO: Look at this token should be url*/}
                                <div className="text-xs text-muted-foreground break-all">{s.token}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}