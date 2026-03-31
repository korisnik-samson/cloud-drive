import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: [
        "http://localhost:8080",
        "http://192.168.50.153:8080",
        "http://192.168.50.153",
        "https://192.168.3.116"
    ],
};

export default nextConfig;
