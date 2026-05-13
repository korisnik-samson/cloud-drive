"use client"

import useSWR from "swr"
import { getUsage } from "@/lib/api";

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
    return useSWR("usage", getUsage, {
        refreshInterval: 30_000,
        revalidateOnFocus: true,
    });
}