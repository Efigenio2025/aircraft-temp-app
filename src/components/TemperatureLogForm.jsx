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
      <div className="max-w-xl mx-auto glacier-panel p-4 space-y-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-cyan-50">
              Log Temperature
            </h2>
            <p className="text-xs text-cyan-100/70">
              Auto-populated from Tonight&apos;s Aircraft. Adjust tail or heat source if needed.
            </p>
          </div>
          {selectedAircraft && (
            <div className="text-left sm:text-right text-[11px] text-cyan-100/70 sm:pt-1">
              <div className="font-semibold text-cyan-50">
                {selectedAircraft.tail}
              </div>
              <div className="flex flex-wrap gap-1 sm:justify-end">
                <span>{selectedAircraft.gate || "No gate"}</span>
                <span>·</span>
                <span>{selectedAircraft.heatSource || "No heat source"}</span>
              </div>
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Aircraft selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-cyan-100/90">
              Tonight&apos;s Aircraft
            </label>
            <select
              value={activeTail || ""}
              onChange={handleSelectTail}
              className="glacier-input"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="glacier-card px-3 py-2">
              <div className="text-cyan-100/70">Gate / Parking</div>
              <div className="font-semibold text-cyan-50">
                {selectedAircraft?.gate || "—"}
              </div>
            </div>
            <div className="glacier-card px-3 py-2">
              <div className="text-cyan-100/70">Heat Source</div>
              <div className="font-semibold text-cyan-50">
                {selectedAircraft?.heatSource || "—"}
              </div>
            </div>
          </div>

          {/* Heat Source override */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-cyan-100/90">
              Change Heat Source (optional)
            </label>
            <select
              value={selectedAircraft?.heatSource || ""}
              onChange={handleHeatSourceChange}
              disabled={!selectedAircraft}
              className="glacier-input disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <button
              type="button"
              onClick={handleMarkInClick}
              disabled={!selectedAircraft}
              className={`w-full rounded-xl border px-3 py-2 font-medium transition
                ${
                  selectedAircraft?.inTime
                    ? "bg-emerald-500/20 border-emerald-400/70 text-emerald-50"
                    : "bg-cyan-500/20 border-cyan-400/70 text-cyan-50 hover:bg-cyan-400/25"
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
                    ? "bg-cyan-500/15 border-cyan-400/70 text-cyan-50"
                    : "bg-slate-900/60 border-cyan-900/60 text-cyan-100 hover:bg-slate-800/80"
                }
                ${!selectedAircraft ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {purgeLabel}
            </button>
          </div>

          {/* Temperature input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-cyan-100/90">
              Temperature (°F)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="glacier-input"
              placeholder="Enter temp, e.g. 74.5"
            />
            {temperature && (
              <p className="text-[11px] text-cyan-100/70">
                Status:{" "}
                <span className="font-semibold text-cyan-50">
                  {getTempStatus(temperature)}
                </span>
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-cyan-100/90">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="glacier-input"
              placeholder="Example: cabin warm on arrival, doors closed 15 mins, etc."
            />
          </div>

          {error && (
            <p className="text-[11px] text-rose-100 bg-rose-900/60 border border-rose-700/70 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 hover:bg-cyan-200 px-4 py-2 text-xs font-medium text-slate-950 shadow-lg shadow-cyan-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Temperature Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
