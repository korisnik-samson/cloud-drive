import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://backend:8081/api/:path*'
            },
            {
                source: '/auth/:path*',
                destination: 'http://backend:8081/auth/:path*'
            }
        ]
    },
    allowedDevOrigins: [
        "http://localhost:8081",
        "http://backend:8081",
    ],
};

export default nextConfig;
