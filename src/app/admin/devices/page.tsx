"use client";

import { useState, useEffect } from "react";

interface Device {
  id: string;
  deviceIdentifier: string;
  name: string | null;
  location: string | null;
  isActive: boolean;
  status: string;
  lastSeenAt: string | null;
  createdAt: string;
  sensors: { id: string; parkingSlot: { code: string } }[];
  lastHeartbeat: { timestamp: string } | null;
}

interface NewDevice {
  deviceIdentifier: string;
  name: string;
  location: string;
}

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [newDevice, setNewDevice] = useState<NewDevice>({
    deviceIdentifier: "",
    name: "",
    location: "",
  });
  const [registrationResult, setRegistrationResult] = useState<{
    credential: string;
  } | null>(null);
  const [error, setError] = useState("");

  async function fetchDevices() {
    try {
      const res = await fetch("/api/admin/devices");
      const data = await res.json();
      setDevices(data.devices || []);
    } catch {
      console.error("Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDevice),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setRegistrationResult(data);
      setShowRegister(false);
      setNewDevice({ deviceIdentifier: "", name: "", location: "" });
      fetchDevices();
    } catch {
      setError("Registration failed");
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/devices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      fetchDevices();
    } catch {
      console.error("Failed to update device");
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "ONLINE":
        return "bg-emerald-100 text-emerald-800";
      case "OFFLINE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  function getLastSeen(ts: string | null): string {
    if (!ts) return "Never";
    const diff = Date.now() - new Date(ts).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    return new Date(ts).toLocaleString();
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
              Admin — Devices
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Device Management
          </h1>
          <button
            onClick={() => setShowRegister(true)}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Register Device
          </button>
        </div>

        {registrationResult && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="font-medium text-amber-800">
              Device Registered Successfully
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Save this credential — it will not be shown again:
            </p>
            <pre className="mt-2 rounded bg-amber-100 p-3 text-sm font-mono text-amber-900 select-all">
              {registrationResult.credential}
            </pre>
            <button
              onClick={() => setRegistrationResult(null)}
              className="mt-2 text-sm font-medium text-amber-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {showRegister && (
          <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Register New Device
            </h2>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Device Identifier
                </label>
                <input
                  type="text"
                  required
                  value={newDevice.deviceIdentifier}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, deviceIdentifier: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="PARK-ESP32-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Main ESP32 Controller"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={newDevice.location}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, location: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Zone A - Parking Structure"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setError("");
                  }}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 rounded-lg border bg-white p-4 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && devices.length === 0 && (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-gray-500">No devices registered.</p>
          </div>
        )}

        <div className="space-y-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {device.deviceIdentifier}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(
                        device.status
                      )}`}
                    >
                      {device.status}
                    </span>
                    {!device.isActive && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                        DISABLED
                      </span>
                    )}
                  </div>
                  {device.name && (
                    <p className="mt-1 text-sm text-gray-600">{device.name}</p>
                  )}
                  {device.location && (
                    <p className="text-sm text-gray-500">{device.location}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {device.sensors.length} sensor(s) | Last seen:{" "}
                    {getLastSeen(device.lastSeenAt)}
                  </p>
                  {device.lastHeartbeat && (
                    <p className="text-xs text-gray-400">
                      Last heartbeat:{" "}
                      {new Date(
                        device.lastHeartbeat.timestamp
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleToggleActive(device.id, device.isActive)}
                  className={`rounded-md px-3 py-1 text-xs font-medium ${
                    device.isActive
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {device.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
