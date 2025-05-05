export default {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['fs', 'path'],
  },
  images: {
    domains: ['ui-avatars.com', 'https://localhost:7072/api/'], // add your actual domain
  },
};
