"use client";

import React from "react";
import { RegisterPanel } from "@/components/register-panel";
import { useAuth } from "@/hooks/use-auth";

const Page = () => {
    const auth = useAuth();

    return <RegisterPanel onSignUp={auth.signUp} isLoading={auth.loading} />;
};

export default Page;