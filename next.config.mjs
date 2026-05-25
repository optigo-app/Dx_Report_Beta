/** @type {import('next').NextConfig} */

const nextConfig = {
  basePath: "/R50B3",
  assetPrefix: "/R50B3",
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  sassOptions: {
    additionalData: `@use "@/Sass/Variable.scss" as *;`,
  },

  webpack: (config, { isServer }) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;