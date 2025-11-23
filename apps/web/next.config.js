import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

await jiti.import("./env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/api", "@repo/auth", "@repo/db", "@repo/ui"],
};

export default nextConfig;
