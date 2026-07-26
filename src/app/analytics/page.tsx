"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface OccupancyData {
  total: number;
  occupied: number;
  available: number;
  unknown: number;
  occupancyRate: number;
  averageDurationSec: number;
}

interface UtilizationItem {
  slotCode: string;
  zoneCode: string;
  status: string;
  totalEvents: number;
  occupancyEvents: number;
  lastDurationSec: number | null;
}

interface PeakHour {
  hour: number;
  count: number;
}

export default function AnalyticsPage() {
  const [occupancy, setOccupancy] = useState<OccupancyData | null>(null);
  const [utilization, setUtilization] = useState<UtilizationItem[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [occRes, utilRes] = await Promise.all([
          fetch("/api/analytics/occupancy"),
          fetch("/api/analytics/utilization"),
        ]);

        const occData = await occRes.json();
        const utilData = await utilRes.json();

        setOccupancy(occData);
        setUtilization(utilData.utilization || []);
        setPeakHours(utilData.peakHours || []);
      } catch {
        console.error("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const slotUtilData = utilization.map((u) => ({
    name: `${u.zoneCode}${u.slotCode}`,
    events: u.totalEvents,
    occupancy: u.occupancyEvents,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              PS
            </div>
            <span className="text-lg font-bold text-gray-900">Analytics</span>
          </div>
          <a
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

        {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 rounded-lg border bg-white animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && occupancy && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Occupancy Over Time
                </h2>
                <div className="flex items-center justify-around text-center">
                  <div>
                    <p className="text-3xl font-bold text-emerald-600">
                      {occupancy.available}
                    </p>
                    <p className="text-sm text-gray-500">Available</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-600">
                      {occupancy.occupied}
                    </p>
                    <p className="text-sm text-gray-500">Occupied</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-600">
                      {occupancy.occupancyRate}%
                    </p>
                    <p className="text-sm text-gray-500">Occupancy Rate</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-600">
                      {occupancy.total}
                    </p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                </div>
                {occupancy.averageDurationSec > 0 && (
                  <p className="mt-4 text-center text-sm text-gray-500">
                    Avg parking duration:{" "}
                    {Math.floor(occupancy.averageDurationSec / 60)}m{" "}
                    {occupancy.averageDurationSec % 60}s
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Peak Hours
                </h2>
                {peakHours.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={peakHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        tickFormatter={(h) => `${h}:00`}
                        fontSize={11}
                      />
                      <YAxis fontSize={11} />
                      <Tooltip
                        labelFormatter={(h: any) => `${h}:00`}
                        formatter={(value: any) => [String(value), "Events"]}
                      />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-500">
                    No peak hour data available yet.
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Slot Utilisation
                </h2>
                {slotUtilData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={slotUtilData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="events"
                        fill="#059669"
                        name="Total Events"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-500">
                    No utilisation data available yet.
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Parking Duration
                </h2>
                {utilization.filter((u) => u.lastDurationSec).length > 0 ? (
                  <div className="space-y-2">
                    {utilization
                      .filter((u) => u.lastDurationSec)
                      .slice(0, 8)
                      .map((u) => (
                        <div
                          key={u.slotCode}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-700">
                            {u.zoneCode}
                            {u.slotCode}
                          </span>
                          <span className="text-gray-500">
                            {u.lastDurationSec
                              ? `${Math.floor(u.lastDurationSec / 60)}m ${
                                  u.lastDurationSec % 60
                                }s`
                              : "—"}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No duration data available yet.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
