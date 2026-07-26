import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError, apiError } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const slot = await prisma.parkingSlot.findUnique({
      where: { id },
      include: {
        zone: { include: { lot: true } },
        sensor: true,
        events: {
          orderBy: { timestamp: "desc" },
          take: 50,
        },
      },
    });

    if (!slot) {
      return apiError("Parking slot not found", 404);
    }

    return apiSuccess({ slot });
  } catch (error) {
    return handleApiError(error);
  }
}
