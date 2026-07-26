import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth, apiSuccess, apiError, handleApiError } from "@/lib/api-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, location, isActive } = body;

    const device = await prisma.device.findUnique({ where: { id } });
    if (!device) {
      return apiError("Device not found", 404);
    }

    const updated = await prisma.device.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(location !== undefined && { location }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return apiSuccess({
      device: {
        id: updated.id,
        deviceIdentifier: updated.deviceIdentifier,
        name: updated.name,
        location: updated.location,
        isActive: updated.isActive,
        status: updated.status,
        lastSeenAt: updated.lastSeenAt,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  try {
    const { id } = await params;
    const device = await prisma.device.findUnique({ where: { id } });
    if (!device) {
      return apiError("Device not found", 404);
    }

    await prisma.device.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
