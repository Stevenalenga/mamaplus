import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGIN_PATTERNS = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/10\.0\.2\.2:\d+$/,
]

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))
}

export function corsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get('origin')
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }

  if (origin && isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Vary'] = 'Origin'
  }

  return headers
}

export function withCors(request: NextRequest, response: NextResponse): NextResponse {
  const headers = corsHeaders(request)
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export function jsonWithCors(
  request: NextRequest,
  body: unknown,
  init?: ResponseInit
): NextResponse {
  return withCors(request, NextResponse.json(body, init))
}

export function handleCorsPreflight(request: NextRequest): NextResponse | null {
  if (request.method !== 'OPTIONS') return null

  const origin = request.headers.get('origin')
  if (!origin || !isAllowedOrigin(origin)) {
    return new NextResponse(null, { status: 204 })
  }

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  })
}
