import React from 'react'

import { LoginPanel } from "@/components/login-panel";
import { useAuth } from "@/hooks/use-auth";

const Page = async() => {
    const auth = useAuth();

    return <LoginPanel onLogin={auth.signIn} isLoading={auth.loading} />
}

export default Page;