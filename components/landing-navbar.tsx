import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingNavBar() {
    return (
        <nav className="relative z-10 flex justify-between items-center lg:max-w-2xl xl:max-w-5xl sm:w-1/2 mx-auto mt-8 px-3 py-3
            bg-white/10 backdrop-blur-3xl rounded-2xl shadow-xl border border-white/30 transition">
            <Link href=''>
                <span className="font-bold text-lg text-white drop-shadow mx-3">
                    CloudGate.
                </span>
            </Link>

            <div className="flex gap-6 items-center">
                <Link href="" className="text-white font-medium transition">Features</Link>
                <Link href="" className="text-white font-medium transition">About</Link>

                <Link href="/auth/sign-in">
                    <Button className="ml-2 px-4 py-2 border rounded-lg border-white/40 bg- text-gray-200 font-semibold shadow hover:bg-white hover:text-black transition">
                        Sign in
                    </Button>
                </Link>
            </div>
        </nav>
    );
}
