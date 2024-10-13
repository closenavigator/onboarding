/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@whop-apps/sdk', '@whop/frosted-ui'],
}

module.exports = nextConfig
