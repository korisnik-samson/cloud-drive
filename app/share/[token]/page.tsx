"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { resolveShare } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function formatBytes(bytes: number) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function SharePage() {
    const params = useParams<{ token: string }>();
    const token = useMemo(() => params?.token ?? "", [params]);

    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState("");
    const [name, setName] = useState<string | null>(null);
    const [sizeBytes, setSizeBytes] = useState<number | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    async function load(pw?: string | null) {
        setLoading(true);
        try {
            const res = await resolveShare(token, pw ?? null);
            setName(res.name);
            setSizeBytes(res.sizeBytes);
            setDownloadUrl(res.downloadUrl);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unable to resolve share";
            // backend likely returns 403 for password mismatch; message may be JSON
            toast.error("This share link is invalid or requires a password.");
            setDownloadUrl(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!token) return;
        void load(null);
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Shared file</CardTitle>
                    <CardDescription>
                        {loading ? "Loading…" : name ? `Download “${name}”` : "This link may require a password"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {name && sizeBytes != null && (
                        <div className="text-sm text-muted-foreground">Size: {formatBytes(sizeBytes)}</div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Password (if required)</label>
                        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="(optional)"/>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => void load(password)} disabled={loading}>
                            {loading ? "Checking…" : "Unlock"}
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => {
                                if (downloadUrl) window.location.href = downloadUrl;
                            }}
                            disabled={!downloadUrl}
                        >
                            Download
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Powered by CloudVault.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
