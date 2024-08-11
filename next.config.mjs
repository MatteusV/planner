/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['virttxwzrakzgnfqqbdf.supabase.co'],
  },
  experimental: {
    serverComponentsExternalPackages: ['websocket'],
  },
}

export default nextConfig
