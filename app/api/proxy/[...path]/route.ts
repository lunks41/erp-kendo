import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL
const AUTH_TOKEN_COOKIE = "auth-token"
const DEFAULT_REG_ID = process.env.NEXT_PUBLIC_DEFAULT_REGISTRATION_ID ?? ""

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const exp = payload?.exp
    if (!exp) return true
    return Date.now() >= exp * 1000
  } catch {
    return true
  }
}

function extractUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload?.userId ?? null
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "GET")
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "POST")
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "PUT")
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "PATCH")
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "DELETE")
}

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  if (!BACKEND_API_URL) {
    return NextResponse.json(
      { message: "API URL not configured" },
      { status: 500 }
    )
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value

  if (!token || isTokenExpired(token)) {
    return NextResponse.json(
      { message: "Unauthorized", result: 0 },
      { status: 401 }
    )
  }

  const { path } = await params
  const pathSegments = path ?? []
  const pathString = pathSegments.length > 0 ? pathSegments.join("/") : ""
  const searchParams = request.nextUrl.searchParams.toString()
  const queryString = searchParams ? `?${searchParams}` : ""
  const targetUrl = `${BACKEND_API_URL}/${pathString}${queryString}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }

  const xCompanyId = request.headers.get("X-Company-Id")
  if (xCompanyId) {
    headers["X-Company-Id"] = xCompanyId
  }

  if (DEFAULT_REG_ID) {
    headers["X-Reg-Id"] = DEFAULT_REG_ID
  }

  const xUserId = request.headers.get("X-User-Id") ?? extractUserIdFromToken(token)
  if (xUserId) {
    headers["X-User-Id"] = xUserId
  }

  try {
    let body: string | undefined
    const contentType = request.headers.get("content-type") ?? ""

    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData()
        const xUserIdForm =
          request.headers.get("X-User-Id") ?? extractUserIdFromToken(token)
        const formHeaders: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          ...(xCompanyId && { "X-Company-Id": xCompanyId }),
          ...(DEFAULT_REG_ID && { "X-Reg-Id": DEFAULT_REG_ID }),
          ...(xUserIdForm && { "X-User-Id": xUserIdForm }),
        }
        const backendResponse = await fetch(targetUrl, {
          method,
          headers: formHeaders,
          body: formData,
        })
        const responseContentType = backendResponse.headers.get("content-type")
        if (responseContentType?.includes("application/json")) {
          const data = await backendResponse.json().catch(() => ({}))
          return NextResponse.json(data, { status: backendResponse.status })
        }
        const text = await backendResponse.text()
        try {
          return NextResponse.json(JSON.parse(text), {
            status: backendResponse.status,
          })
        } catch {
          return new NextResponse(text, {
            status: backendResponse.status,
            headers: { "Content-Type": responseContentType ?? "text/plain" },
          })
        }
      }
      body = await request.text()
    }

    const backendResponse = await fetch(targetUrl, {
      method,
      headers,
      body,
    })

    const data = await backendResponse.json().catch(() => ({}))
    return NextResponse.json(data, {
      status: backendResponse.status,
    })
  } catch (error) {
    console.error("[Proxy] Backend request failed:", error)
    return NextResponse.json(
      { message: "Backend request failed", result: 0 },
      { status: 502 }
    )
  }
}
