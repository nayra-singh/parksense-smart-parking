import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { parkingSlotSchema } from "@/lib/validations";
import { requireApiAuth, apiSuccess, apiError, handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = parkingSlotSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid input", 422);
    }

    const existing = await prisma.parkingSlot.findUnique({
      where: { zoneId_code: { zoneId: parsed.data.zoneId, code: parsed.data.code } },
    });

    if (existing) {
      return apiError("Slot code already exists in this zone", 409);
    }

    const slot = await prisma.parkingSlot.create({ data: parsed.data });
    return apiSuccess({ slot }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
