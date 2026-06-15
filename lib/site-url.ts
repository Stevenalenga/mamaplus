const DEFAULT_SITE_URL = 'https://mamaplus.co.ke'

function normalizeSiteUrl(url: string) {
  return url.replace(/\/$/, '')
}

export function getSiteUrl(request?: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (envUrl) {
    return normalizeSiteUrl(envUrl)
  }

  if (request) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const host = forwardedHost?.split(',')[0]?.trim() || request.headers.get('host')

    if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
      const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
      const protocol = forwardedProto || (host.includes('localhost') ? 'http' : 'https')
      return normalizeSiteUrl(`${protocol}://${host}`)
    }
  }

  return DEFAULT_SITE_URL
}

export function getAbsoluteUrl(pathname: string, request?: Request) {
  const baseUrl = getSiteUrl(request)
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${baseUrl}${normalizedPath}`
}
