import React, { useState, useEffect } from "react";

// Temperature status bands:
//  • Cold: below 69.9°F
//  • Normal: 70.0°F – 80.9°F
//  • Above Target: 81.0°F – 89.9°F
//  • Critical Hot: 90.0°F and above
function getTempStatus(tempF) {
  const t = Number(tempF);
  if (isNaN(t)) return "Unknown";

  if (t >= 90) {
    return "Critical Hot";
  } else if (t >= 81) {
    return "Above Target";
  } else if (t >= 70) {
    return "Normal";
  } else {
    return "Cold";
  }
}

const HEAT_SOURCES = [
  "AC0066",
  "AC0146",
  "AC0119",
  "AC0079",
  "HG014",
  "HG015",
  "HG016",
  "APU",
];

export function TemperatureLogForm({
  onAddLog,
  selectedTail,    // tail number string coming from App (Tonight's Aircraft)
  preppedTails = [], // array from App (nightTails)
  onMarkInNow,     // function(tail)
  onPurgeNow,      // function(tail)
  onUpdateHeatSource, // function(tail, newHeatSource)
}) {
  // Local "active tail" so we can:
  //  - use the prep screen's selectedTail
  //  - and let the user change it in this form
  const [activeTail, setActiveTail] = useState(selectedTail || "");
  const [temperature, setTemperature] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Keep local activeTail in sync when App changes selectedTail (e.g. from Tonight's Aircraft)
  useEffect(() => {
    setActiveTail(selectedTail || "");
  }, [selectedTail]);

  // Find the selected aircraft object from the prep list by tail number
  const selectedAircraft =
    preppedTails.find(
      (t) =>
        (t.tail || "").toUpperCase() === (activeTail || "").toUpperCase()
    ) || null;

  const nowTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  function handleSelectTail(e) {
    setActiveTail(e.target.value);
    setError("");
  }

  function handleMarkInClick() {
    if (!selectedAircraft || !onMarkInNow) return;
    onMarkInNow(selectedAircraft.tail);
  }

  function handlePurgeClick() {
    if (!selectedAircraft || !onPurgeNow) return;
    onPurgeNow(selectedAircraft.tail);
  }

  function handleHeatSourceChange(e) {
    if (!selectedAircraft || !onUpdateHeatSource) return;
    const newHS = e.target.value;
    onUpdateHeatSource(selectedAircraft.tail, newHS);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!selectedAircraft) {
      setError("Select an aircraft from tonight's list.");
      return;
    }

    const tempNum = Number(temperature);
    if (isNaN(tempNum)) {
      setError("Enter a valid temperature.");
      return;
    }

    const status = getTempStatus(tempNum);
    const logTime = nowTime();

    const newLog = {
      tail: selectedAircraft.tail?.toUpperCase() || "",
      temp: tempNum,
      status,
      location: selectedAircraft.gate || "",
      heatSource: selectedAircraft.heatSource || "",
      notes: notes.trim() || "",
      time: logTime,
    };

    setSubmitting(true);
    try {
      onAddLog && onAddLog(newLog);
      setTemperature("");
      setNotes("");
    } finally {
      setSubmitting(false);
    }
  }

  const markInLabel = selectedAircraft?.inTime
    ? `Marked In · ${selectedAircraft.inTime}`
    : "Mark In Now";

  const purgeLabel =
    selectedAircraft?.purgedDrained === "Yes"
      ? selectedAircraft.purgedAt
        ? `Purged · ${selectedAircraft.purgedAt}`
        : "Purged"
      : "Purge / Drain";

  return (
    <div className="px-4 py-6">
      <div className="max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-4">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Log Temperature
            </h2>
            <p className="text-xs text-slate-400">
              Auto-populated from Tonight&apos;s Aircraft. Adjust tail or heat source if needed.
            </p>
          </div>
          {selectedAircraft && (
            <div className="text-right text-[11px] text-slate-400">
              <div className="font-semibold text-slate-100">
                {selectedAircraft.tail}
              </div>
              <div>
                {selectedAircraft.gate || "No gate"} ·{" "}
                {selectedAircraft.heatSource || "No heat source"}
              </div>
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Aircraft selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Tonight&apos;s Aircraft
            </label>
            <select
              value={activeTail || ""}
              onChange={handleSelectTail}
              className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
            >
              <option value="">Select tail...</option>
              {preppedTails.map((t) => (
                <option key={t.id} value={t.tail}>
                  {t.tail} — {t.gate || "No gate"} · {t.heatSource || "No heat"}
                </option>
              ))}
            </select>
          </div>

          {/* Auto info row from prep screen */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
              <div className="text-slate-400">Gate / Parking</div>
              <div className="font-semibold text-slate-100">
                {selectedAircraft?.gate || "—"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
              <div className="text-slate-400">Heat Source</div>
              <div className="font-semibold text-slate-100">
                {selectedAircraft?.heatSource || "—"}
              </div>
            </div>
          </div>

          {/* Heat Source override */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Change Heat Source (optional)
            </label>
            <select
              value={selectedAircraft?.heatSource || ""}
              onChange={handleHeatSourceChange}
              disabled={!selectedAircraft}
              className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/70 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select heat source...</option>
              {HEAT_SOURCES.map((hs) => (
                <option key={hs} value={hs}>
                  {hs}
                </option>
              ))}
            </select>
          </div>

          {/* Mark In + Purge controls */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <button
              type="button"
              onClick={handleMarkInClick}
              disabled={!selectedAircraft}
              className={`w-full rounded-xl border px-3 py-2 font-medium transition 
                ${
                  selectedAircraft?.inTime
                    ? "bg-emerald-500/20 border-emerald-500/70 text-emerald-100"
                    : "bg-amber-500/20 border-amber-500/70 text-amber-100 hover:bg-amber-500/30"
                }
                ${!selectedAircraft ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {markInLabel}
            </button>

            <button
              type="button"
              onClick={handlePurgeClick}
              disabled={!selectedAircraft}
              className={`w-full rounded-xl border px-3 py-2 font-medium transition 
                ${
                  selectedAircraft?.purgedDrained === "Yes"
                    ? "bg-sky-500/20 border-sky-500/70 text-sky-100"
                    : "bg-slate-800/60 border-slate-600 text-slate-100 hover:bg-slate-700/80"
                }
                ${!selectedAircraft ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {purgeLabel}
            </button>
          </div>

          {/* Temperature input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Temperature (°F)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
              placeholder="Enter temp, e.g. 74.5"
            />
            {temperature && (
              <p className="text-[11px] text-slate-400">
                Status:{" "}
                <span className="font-semibold text-slate-100">
                  {getTempStatus(temperature)}
                </span>
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
              placeholder="Example: cabin warm on arrival, doors closed 15 mins, etc."
            />
          </div>

          {error && (
            <p className="text-[11px] text-rose-400 bg-rose-950/50 border border-rose-800 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Temperature Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}