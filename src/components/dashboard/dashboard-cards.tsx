interface Props {
  total: number;
  available: number;
  occupied: number;
  unknown: number;
  occupancyRate: number;
  lastUpdate: string;
  loading: boolean;
}

export default function DashboardCards({
  total,
  available,
  occupied,
  unknown,
  occupancyRate,
  lastUpdate,
  loading,
}: Props) {
  const cards = [
    {
      label: "TOTAL SPACES",
      value: total,
      color: "text-gray-900",
      bg: "bg-blue-50",
      icon: "P",
    },
    {
      label: "AVAILABLE",
      value: available,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: "A",
    },
    {
      label: "OCCUPIED",
      value: occupied,
      color: "text-red-600",
      bg: "bg-red-50",
      icon: "O",
    },
    {
      label: "OCCUPANCY",
      value: `${occupancyRate}%`,
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: "%",
    },
    {
      label: "UNKNOWN",
      value: unknown,
      color: "text-gray-500",
      bg: "bg-gray-100",
      icon: "?",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border bg-white p-4 shadow-sm animate-pulse"
          >
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border bg-white p-4 shadow-sm ${card.bg}`}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {card.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
      {lastUpdate && (
        <p className="mt-2 text-xs text-gray-400 text-right">
          Last updated: {lastUpdate}
        </p>
      )}
    </div>
  );
}
