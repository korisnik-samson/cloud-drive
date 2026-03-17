export type NodeType = "FILE" | "FOLDER";

export interface StorageNodeDto {
    id: string;
    ownerId: string;
    parentId: string | null;
    name: string;
    path: string;
    type: NodeType;
    mimeType: string | null;
    sizeBytes: number | null;
    trashed: boolean;
    trashedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface InitiateUploadResponse {
    objectKey: string;
    uploadUrl: string;
    expiresInSeconds: number;
}

export interface DownloadUrlResponse {
    url: string;
    expiresInSeconds: number;
}

export interface ShareCreateResponse {
    id: string;
    token: string;
    active: boolean;
    expiresAt: string | null;
    maxDownloads: number | null;
}

export interface ShareListItem {
    id: string;
    token: string;
    active: boolean;
    expiresAt: string | null;
    maxDownloads: number | null;
    downloadCount: number;
    node: {
        id: string;
        name: string;
        type: NodeType;
    };
}

export interface ShareResolveResponse {
    name: string;
    type: NodeType;
    sizeBytes: number;
    downloadUrl: string;
}

export interface FileVersion {
    id: string;
    nodeId: string;
    versionNo: number;
    objectKey: string;
    sizeBytes: number;
    mimeType: string | null;
    checksumSha256: string | null;
    createdAt: string;
}

export interface AuditEventDto {
    id: string;
    action: string;
    nodeId: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
}

export interface JwtPayload {
    sub?: string;
    iss?: string;
    exp?: number;
    iat?: number;
    username?: string;
    role?: string;
}
