/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Handle libsql/Turso packages for serverless deployment
  experimental: {
    serverComponentsExternalPackages: ['@libsql/client', '@prisma/adapter-libsql'],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize libsql packages on server side
      config.externals = config.externals || [];
      config.externals.push({
        '@libsql/client': 'commonjs @libsql/client',
        '@prisma/adapter-libsql': 'commonjs @prisma/adapter-libsql',
      });
    }

    // Ignore README.md files in node_modules
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });

    return config;
  },
}

module.exports = nextConfig
