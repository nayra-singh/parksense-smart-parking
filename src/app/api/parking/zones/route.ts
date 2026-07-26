import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lotId = searchParams.get("lotId");

    const where = lotId ? { lotId, isActive: true } : { isActive: true };

    const zones = await prisma.parkingZone.findMany({
      where,
      include: {
        lot: true,
        slots: {
          where: { isActive: true },
        },
      },
    });

    return apiSuccess({ zones });
  } catch (error) {
    return handleApiError(error);
  }
}
