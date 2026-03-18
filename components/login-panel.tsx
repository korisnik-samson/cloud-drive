"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LoginPanel({
                               onLogin,
                               isLoading,
                           }: {
    onLogin: (email: string, password: string) => Promise<void>;
    isLoading?: boolean;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function submit() {
        try {
            if (!email || !password) {
                toast.error("Please enter email and password");
                return;
            }
            await onLogin(email, password);
            toast.success("Signed in");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Login failed");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>CloudVault</CardTitle>
                    <CardDescription>Sign in to your personal cloud storage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button className="w-full" onClick={submit} disabled={isLoading}>
                        {isLoading ? "Signing in…" : "Sign in"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Tip: set <span className="font-mono">NEXT_PUBLIC_API_BASE_URL</span> to your Spring server (e.g.
                        <span className="font-mono"> http://localhost:8080</span>).
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
