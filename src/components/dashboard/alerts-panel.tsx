"use client";

import { useState, useEffect } from "react";

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  createdAt: string;
  resolved: boolean;
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/alerts?resolved=false");
        const data = await res.json();
        setAlerts(data.alerts || []);
        setUnresolvedCount(data.unresolvedCount || 0);
      } catch {
        console.error("Failed to fetch alerts");
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  function getSeverityColor(severity: string): string {
    switch (severity) {
      case "CRITICAL":
        return "border-l-red-500 bg-red-50";
      case "WARNING":
        return "border-l-amber-500 bg-amber-50";
      case "INFO":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          System Alerts
        </h2>
        {unresolvedCount > 0 && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            {unresolvedCount}
          </span>
        )}
      </div>

      {loading && (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded border-l-4 bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && alerts.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">No active alerts.</p>
      )}

      <div className="mt-4 space-y-2">
        {alerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            className={`rounded border-l-4 p-3 text-sm ${getSeverityColor(
              alert.severity
            )}`}
          >
            <p className="font-medium text-gray-900">{alert.title}</p>
            <p className="mt-0.5 text-xs text-gray-600">{alert.message}</p>
            <p className="mt-1 text-xs text-gray-400">
              {new Date(alert.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
