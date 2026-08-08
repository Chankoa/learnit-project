import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { ProfileRole } from "@/lib/auth/server";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

type ProtectedRoute = {
  prefix: string;
  role?: ProfileRole;
};

const protectedRoutes = [
  { prefix: "/app/profile" },
  { prefix: "/app/learner", role: "learner" },
  { prefix: "/app/teacher", role: "teacher" },
  { prefix: "/app/admin", role: "admin" }
] satisfies ProtectedRoute[];

function getProtectedRoute(pathname: string) {
  return protectedRoutes.find((route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`));
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

function redirectToAccessDenied(
  request: NextRequest,
  {
    currentRole,
    reason,
    requiredRole
  }: {
    currentRole?: string;
    reason: "profile" | "role" | "status";
    requiredRole?: ProfileRole;
  }
) {
  const accessDeniedUrl = new URL("/access-denied", request.url);
  accessDeniedUrl.searchParams.set("reason", reason);
  accessDeniedUrl.searchParams.set("next", request.nextUrl.pathname);

  if (requiredRole) {
    accessDeniedUrl.searchParams.set("required", requiredRole);
  }

  if (currentRole) {
    accessDeniedUrl.searchParams.set("current", currentRole);
  }

  return NextResponse.redirect(accessDeniedUrl);
}

function canAccess(requiredRole: ProfileRole | undefined, currentRole: string | null | undefined) {
  if (!requiredRole) {
    return true;
  }

  return currentRole === requiredRole;
}

export async function proxy(request: NextRequest) {
  const protectedRoute = getProtectedRoute(request.nextUrl.pathname);

  if (!protectedRoute) {
    return NextResponse.next();
  }

  if (!isSupabaseConfigured()) {
    return redirectToLogin(request);
  }

  const { supabaseKey, supabaseUrl } = getSupabaseConfig();
  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    if (userError) {
      console.error("[auth] proxy user lookup failed", userError);
    }

    return redirectToLogin(request);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[auth] proxy profile lookup failed", profileError);
    return redirectToAccessDenied(request, { reason: "profile", requiredRole: protectedRoute.role });
  }

  if (!profile) {
    return redirectToAccessDenied(request, { reason: "profile", requiredRole: protectedRoute.role });
  }

  if (profile.status !== "active") {
    return redirectToAccessDenied(request, {
      currentRole: profile.role ?? undefined,
      reason: "status",
      requiredRole: protectedRoute.role
    });
  }

  if (!canAccess(protectedRoute.role, profile.role)) {
    return redirectToAccessDenied(request, {
      currentRole: profile.role ?? undefined,
      reason: "role",
      requiredRole: protectedRoute.role
    });
  }

  return response;
}

export const config = {
  matcher: ["/app/profile", "/app/learner/:path*", "/app/teacher/:path*", "/app/admin/:path*"]
};
