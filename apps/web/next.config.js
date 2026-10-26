import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

await jiti.import("./env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/api", "@repo/auth", "@repo/db", "@repo/ui"],
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/pricing/personal",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/signup/free",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
