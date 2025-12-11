import React, { useState } from "react";

export function NightTailLog({
  nightTails,
  onAddTail,
  onMarkArrived,
  onClearAll,
  onLogTemp,
}) {
  const [tailNumber, setTailNumber] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [gate, setGate] = useState("");
  const [eta, setEta] = useState("");
  const [heatSource, setHeatSource] = useState("");
  const [purgedDrained, setPurgedDrained] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!tailNumber) {
      alert("Please enter at least a Tail Number.");
      return;
    }

    onAddTail?.({
      tail: tailNumber.toUpperCase(),
      flight: flightNumber.toUpperCase(),
      gate: gate || null,
      eta,
      heatSource: heatSource || null,
      purgedDrained: purgedDrained || "N/A",
      purgedAt: null, // purge time will be set from the Log Temp page
      notes,
      inTime: null,
      status: "Waiting",
    });

    setTailNumber("");
    setFlightNumber("");
    setGate("");
    setEta("");
    setHeatSource("");
    setPurgedDrained("");
    setNotes("");
  }

  return (
    <div className="min-h-[500px] px-4 py-6 space-y-4">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-cyan-50">
            Tonight&apos;s Aircraft
          </h1>
          <p className="text-xs text-cyan-100/70">
            Build the overnight plan: tails, gates, heat sources, purge/ drain
            status.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="rounded-full border border-cyan-900/60 bg-slate-950/60 px-3 py-1 text-cyan-100/80">
            Tails logged: {nightTails.length}
          </span>
          {nightTails.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-lg border border-rose-500/70 px-3 py-1.5 text-rose-100 text-xs hover:bg-rose-500/10"
            >
              Clear tonight&apos;s list
            </button>
          )}
        </div>
      </header>

      {/* Entry form */}
      <form
        onSubmit={handleSubmit}
        className="glacier-panel p-4 space-y-3"
      >
        {/* Row 1: Tail / Flight / Gate / ETA */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Tail */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-cyan-100/90">
              Tail Number *
            </label>
            <input
              type="text"
              placeholder="N123AB"
              value={tailNumber}
              onChange={(e) => setTailNumber(e.target.value)}
              className="glacier-input"
            />
          </div>

          {/* Flight */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-cyan-100/90">
              Flight #
            </label>
            <input
              type="text"
              placeholder="AA1234"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="glacier-input"
            />
          </div>

          {/* Gate / Parking */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-cyan-100/90">
              Gate / Parking
            </label>
            <select
              value={gate}
              onChange={(e) => setGate(e.target.value)}
              className="glacier-input"
            >
              <option value="">Select location…</option>
              <option value="A6">A6</option>
              <option value="A7">A7</option>
              <option value="A8">A8</option>
              <option value="A9">A9</option>
              <option value="A10">A10</option>
              <option value="SR3">SR3</option>
              <option value="SR4">SR4</option>
              <option value="SR5">SR5</option>
            </select>
          </div>

          {/* Planned time / ETA */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-cyan-100/90">
              Planned Time (ETA)
            </label>
            <input
              type="text"
              placeholder="21:35 / 9:35 PM"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="glacier-input"
            />
          </div>
        </div>

        {/* Row 2: Heat Source / Purged & Drained */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Heat Source (equipment IDs) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-cyan-100/90">
              Heat Source
            </label>
            <select
              value={heatSource}
              onChange={(e) => setHeatSource(e.target.value)}
              className="glacier-input"
            >
              <option value="">Select…</option>
              <option value="AC0066">AC0066</option>
              <option value="AC0146">AC0146</option>
              <option value="AC0119">AC0119</option>
              <option value="AC0079">AC0079</option>
              <option value="HG014">HG014</option>
              <option value="HG015">HG015</option>
              <option value="HG016">HG016</option>
              <option value="APU">APU</option>
            </select>
          </div>

          {/* Purged & Drained */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-cyan-100/90">
              Purged &amp; Drained
            </label>
            <select
              value={purgedDrained}
              onChange={(e) => setPurgedDrained(e.target.value)}
              className="glacier-input"
            >
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="N/A">N/A</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-cyan-100/90">Notes</label>
          <textarea
            rows={2}
            placeholder="Crew notes, long turn, MEL, special handling…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="glacier-input"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-cyan-300 px-4 py-2.5 text-xs md:text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 hover:bg-cyan-200 active:scale-[0.99] transition"
          >
            Add Tail to Tonight&apos;s List
          </button>
        </div>
      </form>

      {/* Table of tonight's tails */}
      <section className="glacier-panel p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-cyan-50">Tonight&apos;s Tail List</h2>
          <span className="text-[11px] text-cyan-100/70">
            Mark in-time and jump to temp logging per aircraft.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px] text-left">
            <thead className="border-b border-cyan-900/60 text-cyan-100/70">
              <tr>
                <th className="py-2 pr-3">Tail</th>
                <th className="py-2 pr-3 hidden md:table-cell">Flight</th>
                <th className="py-2 pr-3 hidden md:table-cell">Gate</th>
                <th className="py-2 pr-3 hidden lg:table-cell">Heat</th>
                <th className="py-2 pr-3 hidden lg:table-cell">Purged</th>
                <th className="py-2 pr-3">Planned</th>
                <th className="py-2 pr-3">In Time</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-cyan-900/60">
              {nightTails.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-4 text-center text-[11px] text-cyan-100/70"
                  >
                    No tails logged for tonight yet.
                  </td>
                </tr>
              ) : (
                nightTails.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50">
                    <td className="py-2 pr-3 text-cyan-50">{item.tail}</td>
                    <td className="py-2 pr-3 hidden md:table-cell">
                      {item.flight || "—"}
                    </td>
                    <td className="py-2 pr-3 hidden md:table-cell">
                      {item.gate || "—"}
                    </td>
                    <td className="py-2 pr-3 hidden lg:table-cell">
                      {item.heatSource || "—"}
                    </td>
                    <td className="py-2 pr-3 hidden lg:table-cell">
                      {item.purgedDrained === "Yes"
                        ? item.purgedAt
                          ? `Yes · ${item.purgedAt}`
                          : "Yes"
                        : item.purgedDrained || "—"}
                    </td>
                    <td className="py-2 pr-3">{item.eta || "—"}</td>
                    <td className="py-2 pr-3 text-cyan-100/80">
                      {item.inTime || "Waiting"}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 border text-[11px] ${
                          item.status === "Arrived"
                            ? "border-emerald-500/70 text-emerald-200 bg-emerald-500/10"
                            : "border-amber-500/70 text-amber-200 bg-amber-500/10"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-col gap-1">
                        {item.inTime ? (
                          <span className="text-[11px] text-cyan-100/70">
                            In-time logged
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onMarkArrived?.(item.id)}
                            className="rounded-full bg-emerald-400 px-3 py-1 text-[11px] font-medium text-slate-950 hover:bg-emerald-300"
                          >
                            Mark In (Now)
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onLogTemp?.(item.tail)}
                          className="rounded-full bg-cyan-300 px-3 py-1 text-[11px] font-medium text-slate-950 hover:bg-cyan-200"
                        >
                          Log Temp
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}