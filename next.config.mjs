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
    ];
  },
};

export default nextConfig;
