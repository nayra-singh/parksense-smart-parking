import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const lots = await prisma.parkingLot.findMany({
      where: { isActive: true },
      include: {
        zones: {
          where: { isActive: true },
          include: {
            slots: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    return apiSuccess({ lots });
  } catch (error) {
    return handleApiError(error);
  }
}
