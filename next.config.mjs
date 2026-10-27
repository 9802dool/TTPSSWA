/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
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
        // Legacy signup page. Done here (not only in the page) so the response has a
        // real Location header; a statically prerendered redirect() does not.
        source: "/membership-registration",
        destination: "/become-a-member",
        permanent: false,
      },
      {
        source: "/admin/dashboard",
        destination: "/admin/applications",
        permanent: false,
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
