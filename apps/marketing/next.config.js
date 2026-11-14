/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/site", "@repo/ui"],
  async redirects() {
    const appUrl = (
      process.env.NEXT_PUBLIC_WEB_APP_URL ?? "https://dash.vaultcore.in"
    ).replace(/\/+$/, "");

    return [
      {
        source: "/pricing",
        destination: "/pricing/personal",
        permanent: true,
      },
      {
        source: "/login",
        destination: `${appUrl}/login`,
        permanent: true,
      },
      {
        source: "/signup",
        destination: `${appUrl}/signup/free`,
        permanent: true,
      },
      {
        source: "/signup/:path*",
        destination: `${appUrl}/signup/:path*`,
        permanent: true,
      },
      {
        source: "/app",
        destination: `${appUrl}/app`,
        permanent: false,
      },
      {
        source: "/verify",
        destination: `${appUrl}/verify`,
        permanent: false,
      },
      {
        source: "/lock",
        destination: `${appUrl}/lock`,
        permanent: false,
      },
      {
        source: "/accept-invitation/:path*",
        destination: `${appUrl}/accept-invitation/:path*`,
        permanent: false,
      },
      {
        source: "/organization/:path*",
        destination: `${appUrl}/organization/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
