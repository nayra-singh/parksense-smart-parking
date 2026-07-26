import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type Role = "ADMIN" | "OPERATOR" | "VIEWER";

const roleHierarchy: Record<Role, number> = {
  ADMIN: 3,
  OPERATOR: 2,
  VIEWER: 1,
};

export async function requireAuth(minRole: Role = "VIEWER") {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userRole = session.user.role as Role;
  const requiredLevel = roleHierarchy[minRole];
  const userLevel = roleHierarchy[userRole];

  if (userLevel < requiredLevel) {
    redirect("/dashboard");
  }

  return session;
}

export function checkRole(
  userRole: string | undefined,
  minRole: Role
): boolean {
  if (!userRole) return false;
  const requiredLevel = roleHierarchy[minRole];
  const userLevel = roleHierarchy[userRole as Role];
  return userLevel >= requiredLevel;
}
