"use client"

import useSWR from "swr"

type Usage = {
    usedBytes: number
    quotaBytes: number
    byCategoryBytes: Record<string, number>
}

const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
    })

export function useStorageUsage() {
    return useSWR<Usage>("/api/v1/usage", fetcher, {
        refreshInterval: 30_000, // refresh every 30s
        revalidateOnFocus: true,
    })
}