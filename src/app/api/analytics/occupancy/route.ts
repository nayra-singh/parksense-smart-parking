import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get("zoneId");
    const period = searchParams.get("period") || "daily";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const slotWhere: any = { isActive: true };
    if (zoneId) slotWhere.zoneId = zoneId;

    const totalSlots = await prisma.parkingSlot.count({ where: slotWhere });
    const occupiedSlots = await prisma.parkingSlot.count({
      where: { ...slotWhere, status: "OCCUPIED" },
    });
    const availableSlots = await prisma.parkingSlot.count({
      where: { ...slotWhere, status: "AVAILABLE" },
    });
    const unknownSlots = await prisma.parkingSlot.count({
      where: { ...slotWhere, status: "UNKNOWN" },
    });

    const eventWhere: any = {};
    if (zoneId) {
      eventWhere.parkingSlot = { zoneId };
    }
    if (startDate) {
      eventWhere.timestamp = { gte: new Date(startDate) };
    }
    if (endDate) {
      eventWhere.timestamp = { ...eventWhere.timestamp, lte: new Date(endDate) };
    }

    const recentEvents = await prisma.parkingEvent.findMany({
      where: eventWhere,
      orderBy: { timestamp: "desc" },
      take: 1000,
    });

    const occupancyRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

    const avgDuration = await prisma.parkingEvent.aggregate({
      _avg: { durationSec: true },
      where: {
        ...eventWhere,
        durationSec: { not: null },
      },
    });

    return apiSuccess({
      total: totalSlots,
      occupied: occupiedSlots,
      available: availableSlots,
      unknown: unknownSlots,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      averageDurationSec: Math.round(avgDuration._avg.durationSec || 0),
      recentEvents: recentEvents.length,
      period,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
