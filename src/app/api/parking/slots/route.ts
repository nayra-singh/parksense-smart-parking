import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get("zoneId");
    const status = searchParams.get("status");

    const where: any = { isActive: true };
    if (zoneId) where.zoneId = zoneId;
    if (status) where.status = status;

    const slots = await prisma.parkingSlot.findMany({
      where,
      include: {
        zone: { include: { lot: true } },
        sensor: true,
        events: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { code: "asc" },
    });

    return apiSuccess({ slots });
  } catch (error) {
    return handleApiError(error);
  }
}
