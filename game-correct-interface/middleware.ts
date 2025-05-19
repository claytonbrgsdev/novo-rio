import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = ["/", "/auth", "/auth/callback", "/auth/reset-password"]

// Define routes that require authentication but not character creation
const authRoutes = ["/character", "/profile", "/settings"]

// Define routes that require both authentication and character creation
const gameRoutes = ["/game", "/transition"]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Get the current path
  const path = request.nextUrl.pathname

  // Check if the path is a public asset (like images, css, etc.)
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/static") ||
    path.includes(".") // Files with extensions are typically static assets
  ) {
    return response
  }

  // Debug route - always allow access
  if (path === "/debug" || path.startsWith("/debug/")) {
    return response
  }

  // Simple game route - always allow access for testing
  if (path === "/simple-game") {
    return response
  }

  try {
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const isAuthenticated = !!session

    // Public routes - redirect to character page if authenticated
    if (publicRoutes.includes(path)) {
      if (isAuthenticated && path === "/auth") {
        // If user is on auth page but already authenticated, redirect to character page
        return NextResponse.redirect(new URL("/character", request.url))
      }
      return response
    }

    // Protected routes - redirect to auth if not authenticated
    if (!isAuthenticated) {
      // Store the original URL to redirect back after authentication
      const redirectUrl = new URL("/auth", request.url)
      redirectUrl.searchParams.set("redirected", "true")
      redirectUrl.searchParams.set("from", path)
      return NextResponse.redirect(redirectUrl)
    }

    // For all other authenticated routes
    return response
  } catch (error) {
    console.error("Middleware error:", error)

    // In case of error, allow access to public routes
    if (publicRoutes.includes(path)) {
      return response
    }

    // For other routes, redirect to the homepage with an error parameter
    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("error", "auth_error")
    return NextResponse.redirect(redirectUrl)
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
