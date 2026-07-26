import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { parkingZoneSchema } from "@/lib/validations";
import { requireApiAuth, apiSuccess, apiError, handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = parkingZoneSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid input", 422);
    }

    const existing = await prisma.parkingZone.findUnique({
      where: { lotId_code: { lotId: parsed.data.lotId, code: parsed.data.code } },
    });

    if (existing) {
      return apiError("Zone code already exists in this lot", 409);
    }

    const zone = await prisma.parkingZone.create({ data: parsed.data });
    return apiSuccess({ zone }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
