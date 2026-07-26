import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth, apiSuccess, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { error } = await requireApiAuth("OPERATOR");
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get("resolved");
    const type = searchParams.get("type");

    const where: any = {};
    if (resolved === "false") where.resolved = false;
    if (resolved === "true") where.resolved = true;
    if (type) where.type = type;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const unresolvedCount = await prisma.alert.count({
      where: { resolved: false },
    });

    return apiSuccess({ alerts, unresolvedCount });
  } catch (err) {
    return handleApiError(err);
  }
}
