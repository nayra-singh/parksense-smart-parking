import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { checkRole, Role } from "@/lib/auth-config";

export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function handleZodError(error: ZodError) {
  const zodError = error as unknown as { issues?: Array<{ path: (string | number)[]; message: string }>; errors?: Array<{ path: (string | number)[]; message: string }> };
  const issues = zodError.issues || zodError.errors || [];
  return NextResponse.json(
    {
      error: "Validation error",
      details: issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    },
    { status: 422 }
  );
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  if (error instanceof ZodError) {
    return handleZodError(error);
  }
  return apiError("Internal server error", 500);
}

export async function requireApiAuth(minRole: Role = "VIEWER") {
  const session = await auth();

  if (!session?.user) {
    return { error: apiError("Unauthorized", 401), session: null };
  }

  if (!checkRole(session.user.role, minRole)) {
    return { error: apiError("Forbidden", 403), session: null };
  }

  return { error: null, session };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
