export default {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['fs', 'path'], // Updated key
  images: {
    domains: ['ui-avatars.com', 'https://localhost:7072/api/'], // add your actual domain
  },
};
