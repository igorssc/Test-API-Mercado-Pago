/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    config.resolve.fallback = {
      net: false,
      fs: false,
      assert: false,
      stream: false,
      util: false,
      buffer: false,
      process: false,
      crypto: false,
      querystring: false,
      http: false,
      tls: false,
      https: false,
      path: false,
      zlib: false,
      events: false,
    };

    return config;
  },
};

module.exports = nextConfig;
