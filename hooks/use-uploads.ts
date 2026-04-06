"use client";

import { useCallback, useState } from "react";
import { completeUpload, getDownloadUrl, initiateUpload } from "@/lib/api";
import type { InitiateUploadResponse } from "@/lib/types";

function shouldSendContentType(presignedUrl: string) {
    try {
        const u = new URL(presignedUrl);
        const signedHeaders = decodeURIComponent(
            u.searchParams.get("X-Amz-SignedHeaders") ?? ""
        );
        return signedHeaders.split(";").includes("content-type");
    } catch {
        return false;
    }
}

async function putWithProgress(
    url: string,
    file: File,
    onProgress?: (pct: number) => void
) {
    const includeContentType = shouldSendContentType(url);

    return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);

        if (includeContentType && file.type) {
            xhr.setRequestHeader("Content-Type", file.type);
        }

        xhr.upload.onprogress = (evt) => {
            if (!evt.lengthComputable || !onProgress) return;
            onProgress(Math.round((evt.loaded / evt.total) * 100));
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed (${xhr.status})`));
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
    });
}

export function useUploads() {
    const [busy, setBusy] = useState(false);

    const uploadOne = useCallback(
        async (
            file: File,
            parentId: string | null,
            onProgress?: (pct: number) => void
        ) => {
            const init: InitiateUploadResponse = await initiateUpload({
                parentId,
                fileName: file.name,
                mimeType: file.type || "application/octet-stream",
                sizeBytes: file.size,
            });

            await putWithProgress(init.uploadUrl, file, onProgress);

            await completeUpload({
                objectKey: init.objectKey,
                fileName: file.name,
                sizeBytes: file.size,
                mimeType: file.type || "application/octet-stream",
                parentId,
                checksumSha256: null,
            });

            return init;
        },
        []
    );

    const uploadMany = useCallback(
        async (
            files: File[],
            parentId: string | null,
            onOverallProgress?: (pct: number) => void
        ) => {
            if (!files.length) return;

            setBusy(true);
            try {
                const totalBytes = files.reduce((s, f) => s + f.size, 0) || 1;
                let uploadedBytes = 0;

                for (const file of files) {
                    let lastPct = 0;

                    await uploadOne(file, parentId, (pct) => {
                        const delta = pct - lastPct;
                        lastPct = pct;

                        uploadedBytes += Math.round((delta / 100) * file.size);

                        const overall = Math.min(
                            100,
                            Math.round((uploadedBytes / totalBytes) * 100)
                        );
                        onOverallProgress?.(overall);
                    });
                }

                onOverallProgress?.(100);
            } finally {
                setBusy(false);
            }
        },
        [uploadOne]
    );

    const downloadByNodeId = useCallback(async (nodeId: string) => {
        const res = await getDownloadUrl(nodeId); // { url, expiresInSeconds }
        window.open(res.url, "_blank", "noopener,noreferrer");
    }, []);

    return {
        busy,
        uploadOne,
        uploadMany,
        downloadByNodeId,
    };
}