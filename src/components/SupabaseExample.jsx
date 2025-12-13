import React, { useEffect, useState } from "react";
import {
  fetchTonightNightTails,
  fetchTonightTempLogs,
  insertNightTail,
  insertTemperatureLog,
  updateMarkedInAt,
  updatePurgedAt,
} from "../api/nightOpsApi.js";

const initialTailForm = {
  tailNumber: "",
  location: "Gate B1",
  heatSource: "GPU",
  drained: false,
};

const initialTempForm = {
  tailNumber: "",
  tempF: "",
};

export function SupabaseExample() {
  const [tailForm, setTailForm] = useState(initialTailForm);
  const [tempForm, setTempForm] = useState(initialTempForm);
  const [nightTails, setNightTails] = useState([]);
  const [tempLogs, setTempLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    setIsLoading(true);
    setError("");
    try {
      const [tails, temps] = await Promise.all([
        fetchTonightNightTails(),
        fetchTonightTempLogs(),
      ]);
      setNightTails(tails);
      setTempLogs(temps);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddTail(event) {
    event.preventDefault();
    setError("");
    try {
      await insertNightTail(tailForm);
      setTailForm(initialTailForm);
      await refreshData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogTemp(event) {
    event.preventDefault();
    setError("");
    try {
      await insertTemperatureLog(tempForm);
      setTempForm(initialTempForm);
      await refreshData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMarkIn(id) {
    setError("");
    try {
      await updateMarkedInAt(id);
      await refreshData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePurged(id) {
    setError("");
    try {
      await updatePurgedAt(id);
      await refreshData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="p-4 border border-cyan-900/60 bg-slate-900/50 rounded-xl shadow-lg shadow-cyan-900/20 mt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-cyan-100">
            Supabase quick start (Phase 1)
          </p>
          <p className="text-xs text-cyan-200/80">
            Assumes station OMA and today&apos;s date; no auth yet.
          </p>
        </div>
        <button
          onClick={refreshData}
          className="text-xs px-3 py-1.5 rounded-full border border-cyan-800 bg-cyan-900/40 text-cyan-100 hover:bg-cyan-800/60"
        >
          Refresh data
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-300 mt-2">Error: {error}</p>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <form
          onSubmit={handleAddTail}
          className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80"
        >
          <p className="text-xs font-semibold text-cyan-100 mb-2">
            Insert night tail
          </p>
          <div className="flex flex-col gap-2 text-xs">
            <label className="flex flex-col gap-1 text-cyan-50/90">
              Tail number
              <input
                required
                value={tailForm.tailNumber}
                onChange={(e) =>
                  setTailForm((prev) => ({ ...prev, tailNumber: e.target.value }))
                }
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800"
              />
            </label>
            <label className="flex flex-col gap-1 text-cyan-50/90">
              Location
              <input
                value={tailForm.location}
                onChange={(e) =>
                  setTailForm((prev) => ({ ...prev, location: e.target.value }))
                }
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800"
              />
            </label>
            <label className="flex flex-col gap-1 text-cyan-50/90">
              Heat source
              <input
                value={tailForm.heatSource}
                onChange={(e) =>
                  setTailForm((prev) => ({ ...prev, heatSource: e.target.value }))
                }
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800"
              />
            </label>
            <label className="flex items-center gap-2 text-cyan-50/90">
              <input
                type="checkbox"
                checked={tailForm.drained}
                onChange={(e) =>
                  setTailForm((prev) => ({ ...prev, drained: e.target.checked }))
                }
              />
              Drained
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 rounded bg-cyan-400 text-slate-950 font-semibold border border-cyan-200 shadow shadow-cyan-500/30 disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Add to night_tails"}
            </button>
          </div>
        </form>

        <form
          onSubmit={handleLogTemp}
          className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80"
        >
          <p className="text-xs font-semibold text-cyan-100 mb-2">
            Insert temperature log
          </p>
          <div className="flex flex-col gap-2 text-xs">
            <label className="flex flex-col gap-1 text-cyan-50/90">
              Tail number
              <input
                required
                value={tempForm.tailNumber}
                onChange={(e) =>
                  setTempForm((prev) => ({ ...prev, tailNumber: e.target.value }))
                }
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800"
              />
            </label>
            <label className="flex flex-col gap-1 text-cyan-50/90">
              Temp (°F)
              <input
                required
                type="number"
                value={tempForm.tempF}
                onChange={(e) =>
                  setTempForm((prev) => ({ ...prev, tempF: e.target.value }))
                }
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 rounded bg-amber-300 text-slate-950 font-semibold border border-amber-200 shadow shadow-amber-500/30 disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Add to temp_logs"}
            </button>
          </div>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4 text-xs text-cyan-50/90">
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-cyan-100">Tonight&apos;s aircraft</p>
            {isLoading && <span className="text-[11px] text-cyan-200/80">Loading…</span>}
          </div>
          <div className="divide-y divide-slate-800 mt-2">
            {nightTails.map((tail) => (
              <div key={tail.id} className="py-2 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-sm text-cyan-50">
                    {tail.tail_number}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkIn(tail.id)}
                      className="px-2 py-1 rounded border border-cyan-700 text-[11px] text-cyan-100"
                    >
                      Marked in now
                    </button>
                    <button
                      onClick={() => handlePurged(tail.id)}
                      className="px-2 py-1 rounded border border-emerald-700 text-[11px] text-emerald-100"
                    >
                      Purged now
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-cyan-200/80">Location: {tail.location}</p>
                <p className="text-[11px] text-cyan-200/80">Heat: {tail.heat_source}</p>
                <p className="text-[11px] text-cyan-200/80">
                  In: {tail.marked_in_at ? new Date(tail.marked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                </p>
                <p className="text-[11px] text-cyan-200/80">
                  Purged: {tail.purged_at ? new Date(tail.purged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                </p>
              </div>
            ))}
            {nightTails.length === 0 && (
              <p className="text-[11px] text-cyan-200/70 py-2">No aircraft added for tonight yet.</p>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-cyan-100">Tonight&apos;s temps</p>
            {isLoading && <span className="text-[11px] text-cyan-200/80">Loading…</span>}
          </div>
          <div className="divide-y divide-slate-800 mt-2">
            {tempLogs.map((log) => (
              <div key={log.id} className="py-2 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-cyan-50">
                    {log.tail_number}
                  </p>
                  <span className="text-[11px] text-amber-200 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/50">
                    {log.temp_f}°F
                  </span>
                </div>
                <p className="text-[11px] text-cyan-200/80">
                  Recorded: {new Date(log.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
            {tempLogs.length === 0 && (
              <p className="text-[11px] text-cyan-200/70 py-2">No temperature logs yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
