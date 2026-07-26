"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import ParkingMap from "@/components/parking/parking-map";
import DashboardCards from "./dashboard-cards";
import AlertsPanel from "./alerts-panel";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface SlotData {
  id: string;
  code: string;
  status: string;
  zoneId: string;
  sensor: { thresholdCm: number } | null;
  events: { timestamp: string; durationSec: number | null }[];
  zone: { code: string; name: string; lot: { name: string } };
}

export default function DashboardClient({ user }: { user: User }) {
  const router = useRouter();
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch("/api/parking/slots");
      const data = await res.json();
      setSlots(data.slots || []);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch {
      console.error("Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 10000);
    return () => clearInterval(interval);
  }, [fetchSlots]);

  const totalSlots = slots.length;
  const occupied = slots.filter((s) => s.status === "OCCUPIED").length;
  const available = slots.filter((s) => s.status === "AVAILABLE").length;
  const unknown = slots.filter((s) => s.status === "UNKNOWN").length;
  const occupancyRate =
    totalSlots > 0 ? Math.round((occupied / totalSlots) * 1000) / 10 : 0;

  return (
    <div>
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              PS
            </div>
            <span className="text-lg font-bold text-gray-900">ParkSense</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user.name || user.email}
            </span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {user.role}
            </span>
            {["ADMIN", "OPERATOR"].includes(user.role) && (
              <button
                onClick={() => router.push("/admin/devices")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Admin
              </button>
            )}
            {user.role === "ADMIN" && (
              <button
                onClick={() => router.push("/admin/alerts")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Alerts
              </button>
            )}
            <button
              onClick={() => router.push("/analytics")}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Analytics
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <DashboardCards
          total={totalSlots}
          available={available}
          occupied={occupied}
          unknown={unknown}
          occupancyRate={occupancyRate}
          lastUpdate={lastUpdate}
          loading={loading}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ParkingMap slots={slots} loading={loading} />
          </div>
          <div>
            <AlertsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
