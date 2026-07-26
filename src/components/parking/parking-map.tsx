interface Slot {
  id: string;
  code: string;
  status: string;
  zoneId: string;
  zone: { code: string; name: string; lot: { name: string } };
  sensor: { thresholdCm: number } | null;
  events: { timestamp: string; durationSec: number | null }[];
}

interface Props {
  slots: Slot[];
  loading: boolean;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "OCCUPIED":
      return "OCCUPIED";
    case "AVAILABLE":
      return "AVAILABLE";
    case "UNKNOWN":
      return "UNKNOWN";
    case "OUT_OF_SERVICE":
      return "OUT OF SERVICE";
    default:
      return status;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "OCCUPIED":
      return "bg-red-100 border-red-300 text-red-800";
    case "AVAILABLE":
      return "bg-emerald-100 border-emerald-300 text-emerald-800";
    case "UNKNOWN":
      return "bg-amber-100 border-amber-300 text-amber-800";
    case "OUT_OF_SERVICE":
      return "bg-gray-200 border-gray-400 text-gray-600";
    default:
      return "bg-gray-100 border-gray-300 text-gray-600";
  }
}

function getStatusIndicator(status: string): string {
  switch (status) {
    case "OCCUPIED":
      return "■ OCCUPIED";
    case "AVAILABLE":
      return "□ AVAILABLE";
    case "UNKNOWN":
      return "? UNKNOWN";
    case "OUT_OF_SERVICE":
      return "— OUT OF SERVICE";
    default:
      return status;
  }
}

function formatTimestamp(ts: string | undefined): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleTimeString();
}

export default function ParkingMap({ slots, loading }: Props) {
  const zones = groupByZone(slots);

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Parking Area Map
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg border bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Parking Area Map
      </h2>
      <p className="mt-1 text-xs text-gray-500">
        Status indicators: {getStatusIndicator("OCCUPIED")} |{" "}
        {getStatusIndicator("AVAILABLE")} | {getStatusIndicator("UNKNOWN")}
      </p>

      {zones.length === 0 && (
        <p className="mt-6 text-center text-sm text-gray-500">
          No parking slots configured.
        </p>
      )}

      {zones.map((zone) => (
        <div key={zone.code} className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
            {zone.lotName} — Zone {zone.code}
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {zone.slots.map((slot) => (
              <div
                key={slot.id}
                className={`rounded-lg border-2 p-4 ${getStatusColor(
                  slot.status
                )}`}
                role="region"
                aria-label={`Parking slot ${slot.code} is ${slot.status.toLowerCase()}`}
              >
                <p className="text-lg font-bold">{slot.code}</p>
                <p className="text-sm font-semibold">
                  {getStatusLabel(slot.status)}
                </p>
                <p className="mt-1 text-xs opacity-75">
                  {formatTimestamp(slot.events?.[0]?.timestamp)}
                </p>
                {slot.sensor && (
                  <p className="text-xs opacity-75">
                    Threshold: {slot.sensor.thresholdCm} cm
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByZone(slots: Slot[]) {
  const map = new Map<
    string,
    {
      code: string;
      name: string;
      lotName: string;
      slots: Slot[];
    }
  >();

  for (const slot of slots) {
    const key = slot.zoneId;
    if (!map.has(key)) {
      map.set(key, {
        code: slot.zone.code,
        name: slot.zone.name,
        lotName: slot.zone.lot.name,
        slots: [],
      });
    }
    map.get(key)!.slots.push(slot);
  }

  return Array.from(map.values());
}
