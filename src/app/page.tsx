import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              PS
            </div>
            <span className="text-xl font-bold text-gray-900">ParkSense</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              View Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-24">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              ParkSense
            </h1>
            <p className="mt-4 text-2xl font-semibold text-emerald-600">
              Smart Parking. Real-Time Availability.
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              An IoT-powered parking monitoring platform combining embedded
              systems, distance sensors and modern web technologies to provide
              real-time parking availability information.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-md bg-emerald-600 px-6 py-3 text-base font-medium text-white hover:bg-emerald-700"
              >
                View Dashboard
              </Link>
              <a
                href="#architecture"
                className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Project Architecture
              </a>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              How It Works
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Sensor Detection",
                  desc: "Distance sensors at each parking space continuously measure whether a vehicle is present.",
                },
                {
                  step: "02",
                  title: "ESP32 Processing",
                  desc: "The ESP32 reads sensor data, filters noise, and determines slot status using configurable thresholds.",
                },
                {
                  step: "03",
                  title: "Cloud Communication",
                  desc: "Parking status is transmitted over Wi-Fi via REST API to the backend server.",
                },
                {
                  step: "04",
                  title: "Real-Time Dashboard",
                  desc: "The Next.js dashboard displays live parking availability with historical analytics.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Features
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Real-Time Monitoring",
                  desc: "Live parking space status with automatic updates via polling.",
                },
                {
                  title: "Visual Parking Map",
                  desc: "Color-coded parking layout showing available and occupied spaces at a glance.",
                },
                {
                  title: "Occupancy Analytics",
                  desc: "Historical occupancy data, peak hour analysis, and parking duration tracking.",
                },
                {
                  title: "Device Management",
                  desc: "Register, monitor, and manage ESP32 devices with online/offline status.",
                },
                {
                  title: "Alert System",
                  desc: "Automatic alerts for device offline, sensor failures, and authentication issues.",
                },
                {
                  title: "Role-Based Access",
                  desc: "Admin, operator, and viewer roles with server-side authorization.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="architecture" className="py-20 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              System Architecture
            </h2>
            <div className="mt-12 flex justify-center">
              <div className="inline-block rounded-lg border bg-gray-50 p-8">
                <pre className="text-sm text-gray-700 font-mono leading-relaxed">
{`                    VEHICLE
                       |
                PARKING SPACE
                       |
               DISTANCE SENSOR
                       |
                     ESP32
                       |
                     Wi-Fi
                       |
                REST API / MQTT
                       |
                APPLICATION
                  /        \\
          PostgreSQL     Dashboard
                           |
                 Real-Time Status
                       +
                    Analytics`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Technology Stack
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-4">
              {[
                { cat: "Hardware", items: "ESP32, HC-SR04, LEDs" },
                { cat: "Firmware", items: "C/C++, Arduino Framework" },
                {
                  cat: "Frontend",
                  items: "Next.js, React, TypeScript, Tailwind CSS",
                },
                {
                  cat: "Backend",
                  items: "Next.js API, Prisma, PostgreSQL, Zod",
                },
                {
                  cat: "Auth",
                  items: "NextAuth.js, JWT, BCrypt",
                },
                {
                  cat: "DevOps",
                  items: "Docker, Docker Compose, GitHub Actions",
                },
                { cat: "Charts", items: "Recharts" },
                {
                  cat: "Testing",
                  items: "Jest, React Testing Library",
                },
              ].map((tech) => (
                <div
                  key={tech.cat}
                  className="rounded-lg border bg-white p-4 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">
                    {tech.cat}
                  </h3>
                  <p className="mt-1 text-sm text-gray-700">{tech.items}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Project Purpose
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              ParkSense was built as a portfolio project to demonstrate
              end-to-end IoT system development. It combines embedded systems
              programming (ESP32, sensors, C/C++) with modern full-stack web
              development (Next.js, TypeScript, PostgreSQL) to create a
              functional smart parking monitoring system.
            </p>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              The project showcases practical engineering concepts including
              sensor integration, real-time data processing, REST API design,
              database modeling, authentication, and deployment
              infrastructure.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
          <p>ParkSense — IoT Smart Parking & Real-Time Monitoring System</p>
          <p className="mt-1">
            Built with ESP32, Next.js, TypeScript, and PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}
