"use client"

import useSWR from "swr"
import { request } from "@/lib/api"

type Usage = {
    usedBytes: number
    quotaBytes: number
    byCategoryBytes: Record<string, number>
}

export function useStorageUsage() {
    const fetcher = async () => request<Usage>("/api/v1/usage", { method: "GET" })
    
    return useSWR<Usage>("/api/v1/usage", fetcher, {
        refreshInterval: 30_000,
        revalidateOnFocus: true,
    })
}
