import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { parkingLotSchema } from "@/lib/validations";
import { requireApiAuth, apiSuccess, apiError, handleApiError } from "@/lib/api-utils";

export async function GET() {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  try {
    const lots = await prisma.parkingLot.findMany({
      include: {
        zones: { include: { slots: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess({ lots });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = parkingLotSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid input", 422);
    }

    const lot = await prisma.parkingLot.create({ data: parsed.data });
    return apiSuccess({ lot }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
