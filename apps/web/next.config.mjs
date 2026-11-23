const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || ''
if (!configuredApiUrl || /localhost|127\.0\.0\.1/.test(configuredApiUrl)) {
  process.env.NEXT_PUBLIC_API_URL = ''
}

const apiOrigin = (process.env.API_INTERNAL_URL || 'http://127.0.0.1:4000').replace(/\/$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${apiOrigin}/api/:path*`,
        },
      ],
    }
  },
  async headers() {
    return [
      {
        source: '/apk/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/vnd.android.package-archive' },
          { key: 'Content-Disposition', value: 'attachment; filename="MamaPlus.apk"' },
        ],
      },
    ]
  },
}

export default nextConfig

