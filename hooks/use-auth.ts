"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clearTokens, decodeJwtPayload, getTokens, isTokenExpired } from "@/lib/auth";
import { getMe, login as apiLogin, refresh as apiRefresh } from "@/lib/api";

export type AuthUser = {
    id: string;
    username: string;
    email?: string;
    role?: string;
};

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const load = useCallback(async() => {
        setLoading(true);

        try {
            const { accessToken, refreshToken } = getTokens();

            if (!accessToken) {
                // NEW: try silent refresh if refreshToken exists
                if (refreshToken) {
                    const refreshed = await apiRefresh(refreshToken);

                    if (!refreshed) {
                        setUser(null);
                        return;
                    }

                } else {
                    setUser(null);
                    return;
                }
            }

            if (isTokenExpired(accessToken!) && refreshToken) {
                const refreshed = await apiRefresh(refreshToken);

                if (!refreshed) {
                    setUser(null);
                    return;
                }
            }

            const me = await getMe();
            setUser({ id: me.id, username: me.username, email: me.email, role: me.role });

        } catch {
            const { accessToken } = getTokens();
            const payload = accessToken ? decodeJwtPayload(accessToken) : null;

            if (payload?.sub && payload.username)
                setUser({ id: payload.sub, username: payload.username, role: payload.role });
            else setUser(null);

        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const signIn = useCallback(async(email: string, password: string) => {
        await apiLogin(email, password);
        await load();
    }, [load]);

    const signOut = useCallback(() => {
        clearTokens();
        setUser(null);
    }, []);

    return useMemo(
        () => ({ user, loading, reload: load, signIn, signOut }),
        [user, loading, load, signIn, signOut]
    );
}