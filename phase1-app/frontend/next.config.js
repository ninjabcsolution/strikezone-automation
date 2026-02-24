/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // API_URL will be constructed dynamically in the frontend using window.location.hostname
    // This allows the same build to work for localhost AND external IP access
    NEXT_PUBLIC_API_PORT: '5002',
  },
}

module.exports = nextConfig
