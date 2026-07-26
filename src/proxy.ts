import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!session?.user;

  const publicPaths = ["/", "/auth/login", "/api/auth"];
  const isPublic = publicPaths.some(
    (p: string) => pathname === p || pathname.startsWith(p + "/")
  );
  const isApi = pathname.startsWith("/api/");

  if (!isLoggedIn && !isPublic && !isApi) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isLoggedIn && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
