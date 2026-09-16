/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/subsidaries",
        destination: "/subsidiaries",
        permanent: true,
      },
      {
        source: "/beetham-np-service-station/:slug",
        destination: "/committees/:slug",
        permanent: true,
      },
      {
        source: "/dashboard/apply-membership",
        destination: "/services/membership-application",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
