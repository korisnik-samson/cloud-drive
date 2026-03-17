import type { JwtPayload } from "@/lib/types";

const ACCESS_KEY = "cloudstore.accessToken";
const REFRESH_KEY = "cloudstore.refreshToken";

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const encodedName = encodeURIComponent(name) + "=";
    const parts = document.cookie.split("; ");

    for (const part of parts)
        if (part.startsWith(encodedName))
            return decodeURIComponent(part.slice(encodedName.length));

    return null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
    if (typeof document === "undefined") return;

    document.cookie = [
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
        "Path=/",
        `Max-Age=${maxAgeSeconds}`,
        "SameSite=Lax",
    ].join("; ");
}

function clearCookie(name: string) {
    if (typeof document === "undefined") return;

    document.cookie = [
        `${encodeURIComponent(name)}=`,
        "Path=/",
        "Max-Age=0",
        "SameSite=Lax",
    ].join("; ");
}

export function getTokens(): { accessToken: string | null; refreshToken: string | null } {
    if (typeof window === "undefined") return { accessToken: null, refreshToken: null };

    return {
        accessToken: getCookie(ACCESS_KEY),
        refreshToken: getCookie(REFRESH_KEY),
    };
}

export function setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === "undefined") return;

    setCookie(ACCESS_KEY, accessToken, 60 * 15);
    setCookie(REFRESH_KEY, refreshToken, 60 * 60 * 24 * 7);
}

export function clearTokens() {
    if (typeof window === "undefined") return;

    clearCookie(ACCESS_KEY);
    clearCookie(REFRESH_KEY);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");

        if (parts.length !== 3) return null;

        const payload = parts[1];
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

        return JSON.parse(json) as JwtPayload;

    } catch {
        return null;
    }
}

export function isTokenExpired(token: string, skewSeconds = 30): boolean {
    const payload = decodeJwtPayload(token);

    if (!payload?.exp) return false;
    const now = Math.floor(Date.now() / 1000);

    return payload.exp <= now + skewSeconds;
}