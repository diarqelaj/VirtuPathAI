export default {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['fs', 'path'], // Updated key
  images: {
    domains: ['ui-avatars.com', 'virtupathapi-54vt.onrender.com'], // fix your domain format here
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
