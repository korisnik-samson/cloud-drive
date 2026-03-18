import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number) {
    const tb = bytes / (1024 ** 4)
    if (tb >= 1) return `${tb.toFixed(1)} TB`

    const gb = bytes / (1024 ** 3)
    if (gb >= 1) return `${gb.toFixed(1)} GB`

    const mb = bytes / (1024 ** 2)
    if (mb >= 1) return `${mb.toFixed(1)} MB`

    const kb = bytes / 1024
    if (kb >= 1) return `${kb.toFixed(1)} KB`

    return `${bytes} B`
}

export function pct(part: number, total: number) {
    if (!total) return 0
    return Math.min(100, Math.max(0, (part / total) * 100))
}