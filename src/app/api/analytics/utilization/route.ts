import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get("zoneId");

    const slotWhere: any = { isActive: true };
    if (zoneId) slotWhere.zoneId = zoneId;

    const slots = await prisma.parkingSlot.findMany({
      where: slotWhere,
      include: {
        zone: true,
        events: {
          orderBy: { timestamp: "desc" },
          take: 100,
        },
      },
    });

    const utilization = slots.map((slot) => {
      const occupancyEvents = slot.events.filter(
        (e) => e.newStatus === "OCCUPIED"
      ).length;
      const totalEvents = slot.events.length;
      const lastEvent = slot.events[0] || null;

      return {
        slotCode: slot.code,
        zoneCode: slot.zone.code,
        status: slot.status,
        totalEvents,
        occupancyEvents,
        lastUpdated: lastEvent?.timestamp || null,
        lastDurationSec: lastEvent?.durationSec || null,
      };
    });

    const peakHours = await getPeakHours(zoneId || undefined);

    return apiSuccess({
      utilization,
      peakHours,
      totalSlots: slots.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function getPeakHours(zoneId?: string) {
  const where: any = {
    newStatus: "OCCUPIED",
  };
  if (zoneId) {
    where.parkingSlot = { zoneId };
  }

  const events = await prisma.parkingEvent.findMany({
    where,
    select: { timestamp: true },
    take: 5000,
  });

  const hourCounts: Record<number, number> = {};
  for (const event of events) {
    const hour = event.timestamp.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  }

  return Object.entries(hourCounts)
    .map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
    }))
    .sort((a, b) => a.hour - b.hour);
}
