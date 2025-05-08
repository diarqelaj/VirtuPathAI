export default {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['fs', 'path'],
  },
  images: {
    domains: ['ui-avatars.com', 'localhost'], // fix your domain format here
  },
  async headers() {
    return [
      {
        source: "/(.*)", // apply CSP to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://www.google.com https://www.gstatic.com;",
          },
        ],
      },
    ];
  },
};
