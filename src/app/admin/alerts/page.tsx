"use client";

import { useState, useEffect } from "react";

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  resolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("false");

  async function fetchAlerts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/alerts?resolved=${filter}`);
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch {
      console.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  async function handleResolve(id: string, resolved: boolean) {
    try {
      await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved }),
      });
      fetchAlerts();
    } catch {
      console.error("Failed to update alert");
    }
  }

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

  function getSeverityBadge(severity: string): string {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      case "WARNING":
        return "bg-amber-100 text-amber-800";
      case "INFO":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              PS
            </div>
            <span className="text-lg font-bold text-gray-900">
              Admin — Alerts
            </span>
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            System Alerts
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("false")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                filter === "false"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("true")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                filter === "true"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setFilter("")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                filter === ""
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
            >
              All
            </button>
          </div>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg border bg-white animate-pulse" />
            ))}
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-gray-500">No alerts found.</p>
          </div>
        )}

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border-l-4 bg-white p-4 shadow-sm ${getSeverityColor(
                alert.severity
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getSeverityBadge(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {alert.type}
                    </span>
                    {alert.resolved && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500">
                        RESOLVED
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-medium text-gray-900">
                    {alert.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(alert.createdAt).toLocaleString()}
                    {alert.resolvedAt &&
                      ` | Resolved: ${new Date(
                        alert.resolvedAt
                      ).toLocaleString()}`}
                  </p>
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => handleResolve(alert.id, true)}
                    className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
