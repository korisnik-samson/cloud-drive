import { type AuditEventDto, type DownloadUrlResponse, type FileVersion, type InitiateUploadResponse, type ShareCreateResponse,
    type ShareListItem, type ShareResolveResponse, type StorageNodeDto } from "@/lib/types";
import { clearTokens, getTokens, setTokens } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type Json = Record<string, unknown>;

type LoginResponseDto = {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
};

async function request<T>(path: string, init: RequestInit & { auth?: boolean } = { auth: true }): Promise<T> {
    const auth = init.auth !== false;
    const headers = new Headers(init.headers ?? {});

    headers.set("Accept", "application/json");

    const tokens = getTokens();

    if (auth && tokens.accessToken)
        headers.set("Authorization", `Bearer ${tokens.accessToken}`);

    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        credentials: init.credentials ?? "include",
        headers,
    });

    // Auto-refresh once on 401
    if (auth && res.status === 401 && tokens.refreshToken && path !== "/auth/refresh") {
        const refreshed = await refresh(tokens.refreshToken);

        if (refreshed) {
            const tokens2 = getTokens();
            const headers2 = new Headers(init.headers ?? {});

            headers2.set("Accept", "application/json");

            if (tokens2.accessToken) headers2.set("Authorization", `Bearer ${tokens2.accessToken}`);

            const res2 = await fetch(`${API_BASE}${path}`, {
                ...init,
                credentials: init.credentials ?? "include",
                headers: headers2,
            });

            if (!res2.ok) {
                const text = await res2.text().catch(() => "");
                throw new Error(text || `Request failed: ${res2.status}`);
            }

            return (await res2.json()) as T;
        }
    }

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed: ${res.status}`);
    }

    const ct = res.headers.get("content-type") ?? "";

    if (!ct.includes("application/json")) {
        return undefined as unknown as T;
    }

    return (await res.json()) as T;
}

export async function login(email: string, password: string) {
    const body = JSON.stringify({ email, password });

    const res = await request<LoginResponseDto>("/auth/login", {
        method: "POST",
        auth: false,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body,
    });

    const accessToken = res.accessToken ?? res.access_token ?? null;
    const refreshToken = res.refreshToken ?? res.refresh_token ?? null;
    const tokenType = res.tokenType ?? res.token_type ?? "Bearer";

    if (!accessToken || !refreshToken) {
        throw new Error("Login response did not contain valid tokens.");
    }

    setTokens(accessToken, refreshToken);

    return { accessToken, refreshToken, tokenType };
}

export async function refresh(refreshToken: string): Promise<boolean> {
    try {
        const body = JSON.stringify({ refreshToken });
        const res = await request<{
            accessToken?: string;
            refreshToken?: string;
            access_token?: string;
            refresh_token?: string;
        }>("/auth/refresh", {
            method: "POST",
            auth: false,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body,
        });

        const nextAccessToken = res.accessToken ?? res.access_token ?? null;
        const nextRefreshToken = res.refreshToken ?? res.refresh_token ?? refreshToken;

        if (!nextAccessToken) {
            throw new Error("Refresh response did not contain a valid access token.");
        }

        setTokens(nextAccessToken, nextRefreshToken);

        return true;

    } catch {
        clearTokens();
        return false;
    }
}

export async function getMe() {
    return request<{ id: string; username: string; email: string; role: string }>("/api/v1/users/me", { method: "GET" });
}

export async function listNodes(parentId?: string | null): Promise<StorageNodeDto[]> {
    const q = parentId ? `?parentId=${encodeURIComponent(parentId)}` : "";
    return request<StorageNodeDto[]>(`/api/v1/nodes${q}`, { method: "GET" });
}

export async function searchNodes(q: string): Promise<StorageNodeDto[]> {
    return request<StorageNodeDto[]>(`/api/v1/nodes/search?q=${encodeURIComponent(q)}`, { method: "GET" });
}

export async function listTrash(): Promise<StorageNodeDto[]> {
    return request<StorageNodeDto[]>(`/api/v1/nodes/trash`, { method: "GET" });
}

export async function createFolder(name: string, parentId?: string | null): Promise<StorageNodeDto> {
    const body = JSON.stringify({ name, parentId: parentId ?? null });
    return request<StorageNodeDto>(`/api/v1/nodes/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });
}

export async function renameNode(id: string, name: string): Promise<StorageNodeDto> {
    const body = JSON.stringify({ name });
    return request<StorageNodeDto>(`/api/v1/nodes/${id}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
    });
}

export async function moveNode(id: string, parentId: string | null): Promise<StorageNodeDto> {
    const body = JSON.stringify({ parentId });
    return request<StorageNodeDto>(`/api/v1/nodes/${id}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
    });
}

// Soft-delete to trash
export async function trashNode(id: string) {
    return request<void>(`/api/v1/nodes/${id}`, { method: "DELETE" });
}

export async function restoreNode(id: string) {
    return request<void>(`/api/v1/nodes/${id}/restore`, { method: "POST" });
}

// Permanent delete
export async function purgeNode(id: string) {
    return request<void>(`/api/v1/nodes/${id}/purge`, { method: "DELETE" });
}

export async function getDownloadUrl(id: string): Promise<DownloadUrlResponse> {
    return request<DownloadUrlResponse>(`/api/v1/nodes/${id}/download-url`, { method: "GET" });
}

export async function listVersions(id: string): Promise<FileVersion[]> {
    return request<FileVersion[]>(`/api/v1/nodes/${id}/versions`, { method: "GET" });
}

export async function initiateUpload(args: {
    parentId?: string | null;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
}): Promise<InitiateUploadResponse> {

    const body = JSON.stringify({
        parentId: args.parentId ?? null,
        fileName: args.fileName,
        mimeType: args.mimeType,
        sizeBytes: args.sizeBytes,
    });

    return request<InitiateUploadResponse>(`/api/v1/uploads/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });
}

export async function completeUpload(args: { parentId?: string | null; objectKey: string; fileName: string;
    mimeType: string; sizeBytes: number; checksumSha256?: string | null;
}): Promise<StorageNodeDto> {

    const body = JSON.stringify({
        parentId: args.parentId ?? null,
        objectKey: args.objectKey,
        fileName: args.fileName,
        mimeType: args.mimeType,
        sizeBytes: args.sizeBytes,
        checksumSha256: args.checksumSha256 ?? null,
    });

    return request<StorageNodeDto>(`/api/v1/uploads/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });
}

export async function listActivity(): Promise<AuditEventDto[]> {
    return request<AuditEventDto[]>(`/api/v1/activity`, { method: "GET" });
}

export async function createShare(args: { nodeId: string; expiresInHours?: number | null;
    maxDownloads?: number | null; password?: string | null; }): Promise<ShareCreateResponse> {

    const body: Json = {
        nodeId: args.nodeId,
        expiresInHours: args.expiresInHours ?? null,
        maxDownloads: args.maxDownloads ?? null,
        password: args.password ?? null,
    };

    return request<ShareCreateResponse>(`/api/v1/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

export async function listShares(): Promise<ShareListItem[]> {
    return request<ShareListItem[]>(`/api/v1/shares`, { method: "GET" });
}

export async function revokeShare(id: string) {
    return request<void>(`/api/v1/shares/${id}`, { method: "DELETE" });
}

export async function resolveShare(token: string, password?: string | null): Promise<ShareResolveResponse> {
    const body = JSON.stringify({ password: password ?? null });

    return request<ShareResolveResponse>(`/api/v1/shares/resolve/${encodeURIComponent(token)}`, {
        method: "POST",
        auth: false,
        headers: { "Content-Type": "application/json" },
        body,
    });
}