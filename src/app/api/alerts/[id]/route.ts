import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth, apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { alertResolveSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = alertResolveSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid input", 422);
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        resolved: parsed.data.resolved,
        resolvedAt: parsed.data.resolved ? new Date() : null,
      },
    });

    return apiSuccess({ alert });
  } catch (err) {
    return handleApiError(err);
  }
}
