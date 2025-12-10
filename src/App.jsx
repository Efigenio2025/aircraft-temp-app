import React, { useState } from "react";
import { TemperatureLogForm } from "./components/TemperatureLogForm.jsx";
import { TemperatureDashboard } from "./components/TemperatureDashboard.jsx";
import { NightTailLog } from "./components/NightTailLog.jsx";

export default function App() {
  const [view, setView] = useState("log"); // "log" | "dashboard" | "night"

  // In-memory temp logs (cabin temps)
  const [logs, setLogs] = useState([]);

  // In-memory tonight's tail list
  const [nightTails, setNightTails] = useState([]);

  // Tail selected from Tonight's Aircraft for logging temp
  const [selectedTail, setSelectedTail] = useState("");

  // Add a new temperature log from the form
  function handleAddLog(newLog) {
    setLogs((prev) => [
      {
        id: Date.now(),
        ...newLog,
      },
      ...prev, // newest first
    ]);
  }

  // Add a tail to tonight's list
  function handleAddNightTail(entry) {
    setNightTails((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        purgedAt: entry.purgedAt ?? null, // ensure field exists
        ...entry,
      },
    ]);
  }

  // Mark an aircraft as arrived and stamp in-time (by id) – used on Tonight's page
  function handleMarkArrived(id) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setNightTails((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, inTime: timeStr, status: "Arrived" }
          : item
      )
    );
  }

  // Mark arrived based on tail – used from Log Temperature page
  function handleMarkArrivedForTail(tail) {
    if (!tail) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const tailUpper = tail.toUpperCase();

    setNightTails((prev) =>
      prev.map((item) =>
        (item.tail || "").toUpperCase() === tailUpper
          ? { ...item, inTime: timeStr, status: "Arrived" }
          : item
      )
    );
  }

  // NEW: Purge/Drain based on tail – used from Log Temperature page
  function handlePurgeForTail(tail) {
    if (!tail) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const tailUpper = tail.toUpperCase();

    setNightTails((prev) =>
      prev.map((item) => {
        if ((item.tail || "").toUpperCase() !== tailUpper) return item;
        // Only set once
        if (item.purgedDrained === "Yes" && item.purgedAt) return item;

        return {
          ...item,
          purgedDrained: "Yes",
          purgedAt: timeStr,
        };
      })
    );
  }

  // Update heat source based on tail – used from Log Temperature page
  function handleUpdateHeatSourceForTail(tail, newHeatSource) {
    if (!tail) return;
    const tailUpper = tail.toUpperCase();

    setNightTails((prev) =>
      prev.map((item) =>
        (item.tail || "").toUpperCase() === tailUpper
          ? { ...item, heatSource: newHeatSource }
          : item
      )
    );
  }

  // Clear tonight's list (for a fresh shift)
  function handleClearNight() {
    if (
      window.confirm(
        "Clear tonight's tail list? This only affects this browser session."
      )
    ) {
      setNightTails([]);
    }
  }

  // From Tonight's Aircraft, jump to Log Temperature for a specific tail
  function handleLogTempForTail(tail) {
    setSelectedTail(tail);
    setView("log");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Simple top nav */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight">
              OMA · Cabin Temps
            </span>
            <span className="text-[11px] text-slate-500">
              Temperature &amp; Tail Tracking
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setView("log")}
              className={`px-3 py-1.5 rounded-full border text-xs ${
                view === "log"
                  ? "bg-sky-500 text-slate-950 border-sky-500"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Log Temperature
            </button>
            <button
              onClick={() => setView("dashboard")}
              className={`px-3 py-1.5 rounded-full border text-xs ${
                view === "dashboard"
                  ? "bg-sky-500 text-slate-950 border-sky-500"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView("night")}
              className={`px-3 py-1.5 rounded-full border text-xs ${
                view === "night"
                  ? "bg-sky-500 text-slate-950 border-sky-500"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Tonight&apos;s Aircraft
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto">
        {view === "log" && (
          <TemperatureLogForm
            onAddLog={handleAddLog}
            selectedTail={selectedTail}
            preppedTails={nightTails}
            onMarkInNow={handleMarkArrivedForTail}
            onPurgeNow={handlePurgeForTail}
            onUpdateHeatSource={handleUpdateHeatSourceForTail}
          />
        )}

        {view === "dashboard" && (
  <TemperatureDashboard logs={logs} nightTails={nightTails} />
)}

        {view === "night" && (
          <NightTailLog
            nightTails={nightTails}
            onAddTail={handleAddNightTail}
            onMarkArrived={handleMarkArrived}
            onClearAll={handleClearNight}
            onLogTemp={handleLogTempForTail}
          />
        )}
      </main>
    </div>
  );
}