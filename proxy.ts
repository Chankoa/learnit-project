import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { ProfileRole } from "@/lib/auth/server";

type ProtectedRoute = {
  prefix: string;
  role: ProfileRole;
};

const protectedRoutes = [
  { prefix: "/app/learner", role: "learner" },
  { prefix: "/app/teacher", role: "teacher" },
  { prefix: "/app/admin", role: "admin" }
] satisfies ProtectedRoute[];

function getRequiredRole(pathname: string) {
  return protectedRoutes.find((route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`))?.role;
}

function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

function redirectToAccessDenied(request: NextRequest, requiredRole: ProfileRole, currentRole?: string) {
  const accessDeniedUrl = new URL("/access-denied", request.url);
  accessDeniedUrl.searchParams.set("required", requiredRole);
  accessDeniedUrl.searchParams.set("next", request.nextUrl.pathname);

  if (currentRole) {
    accessDeniedUrl.searchParams.set("current", currentRole);
  }

  return NextResponse.redirect(accessDeniedUrl);
}

function canAccess(requiredRole: ProfileRole, currentRole: string | null | undefined) {
  if (currentRole === "admin") {
    return true;
  }

  return currentRole === requiredRole;
}

export async function proxy(request: NextRequest) {
  const requiredRole = getRequiredRole(request.nextUrl.pathname);

  if (!requiredRole) {
    return NextResponse.next();
  }

  if (!isSupabaseConfigured()) {
    return redirectToLogin(request);
  }

  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return redirectToLogin(request);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.status !== "active") {
    return redirectToAccessDenied(request, requiredRole);
  }

  if (!canAccess(requiredRole, profile.role)) {
    return redirectToAccessDenied(request, requiredRole, profile.role ?? undefined);
  }

  return response;
}

export const config = {
  matcher: ["/app/learner/:path*", "/app/teacher/:path*", "/app/admin/:path*"]
};
