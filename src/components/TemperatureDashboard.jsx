import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function TemperatureDashboard({ logs = [], nightTails = [] }) {
  // Multi-select filters controlled by snapshot pills
  const [activeTempFilters, setActiveTempFilters] = useState([]); // e.g. ["Cold", "Critical Hot"]
  const [activePurgeFilters, setActivePurgeFilters] = useState([]); // e.g. ["Purged", "Not Purged"]
  const [expandedTailId, setExpandedTailId] = useState(null); // which historical card is expanded

  // ===== Helpers =====
  function getPurgeInfoForTail(tail) {
    if (!tail) return null;
    const match = nightTails.find(
      (t) => (t.tail || "").toUpperCase() === (tail || "").toUpperCase()
    );
    if (!match) return null;
    return {
      purgedDrained: match.purgedDrained || "N/A",
      purgedAt: match.purgedAt || null,
    };
  }

  function mapTailToPurgeCategory(t) {
    if (!t) return "Unknown";
    if (t.purgedDrained === "Yes") return "Purged";
    if (t.purgedDrained === "No") return "Not Purged";
    return "Unknown";
  }

  function mapPurgeInfoToCategory(purgeInfo) {
    if (!purgeInfo) return "Unknown";
    if (purgeInfo.purgedDrained === "Yes") return "Purged";
    if (purgeInfo.purgedDrained === "No") return "Not Purged";
    return "Unknown";
  }

  function getLatestTempForTail(tail) {
    if (!tail) return null;
    const match = logs.find(
      (log) => (log.tail || "").toUpperCase() === (tail || "").toUpperCase()
    ); // logs newest-first in App
    if (!match) return null;
    return {
      temp: match.temp,
      status: match.status,
      time: match.time,
    };
  }

  // chart data should IGNORE filters → use all logs
  function getChartDataForTail(tail) {
    if (!tail) return [];
    const tailLogs = logs
      .filter(
        (log) =>
          (log.tail || "").toUpperCase() === (tail || "").toUpperCase()
      )
      .slice() // copy
      .reverse(); // oldest -> newest

    return tailLogs.map((log, index) => ({
      time: log.time || `#${index + 1}`,
      temp: typeof log.temp === "number" ? log.temp : Number(log.temp) || null,
      status: log.status,
    }));
  }

  // Toggle helpers for pills
  function toggleTempFilter(status) {
    setActiveTempFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }

  function togglePurgeFilter(category) {
    setActivePurgeFilters((prev) =>
      prev.includes(category)
        ? prev.filter((s) => s !== category)
        : [...prev, category]
    );
  }

  function clearAllFilters() {
    setActiveTempFilters([]);
    setActivePurgeFilters([]);
  }

  // ===== Filtering (for tables & snapshot only) =====

  // Filtered tails (based on purge pill filters)
  const filteredNightTails = nightTails.filter((t) => {
    if (activePurgeFilters.length === 0) return true;
    const cat = mapTailToPurgeCategory(t);
    return activePurgeFilters.includes(cat);
  });

  // Filtered logs (based on temp + purge pills)
  const filteredLogs = logs.filter((log) => {
    // Temp filter (if any temp pills are active)
    if (activeTempFilters.length > 0) {
      if (!activeTempFilters.includes(log.status)) return false;
    }

    // Purge filter (if any purge pills are active)
    if (activePurgeFilters.length > 0) {
      const purgeInfo = getPurgeInfoForTail(log.tail);
      const cat = mapPurgeInfoToCategory(purgeInfo);
      if (!activePurgeFilters.includes(cat)) return false;
    }

    return true;
  });

  const latestLogs = filteredLogs.slice(0, 12);

  // ===== Stats (based on filtered sets) =====
  const totalLogsFiltered = filteredLogs.length;
  const totalTailsFiltered = filteredNightTails.length;

  const criticalHotCount = filteredLogs.filter(
    (log) => log.status === "Critical Hot"
  ).length;
  const aboveTargetCount = filteredLogs.filter(
    (log) => log.status === "Above Target"
  ).length;
  const coldCount = filteredLogs.filter((log) => log.status === "Cold").length;
  const normalCount = filteredLogs.filter(
    (log) => log.status === "Normal"
  ).length;

  const purgedCount = filteredNightTails.filter(
    (t) => t.purgedDrained === "Yes"
  ).length;
  const notPurgedCount = filteredNightTails.filter(
    (t) => t.purgedDrained === "No"
  ).length;
  const naPurgedCount = filteredNightTails.filter(
    (t) => t.purgedDrained !== "Yes" && t.purgedDrained !== "No"
  ).length;

  const filtersActive =
    activeTempFilters.length > 0 || activePurgeFilters.length > 0;

  return (
    <div className="min-h-[500px] px-4 py-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-cyan-50">
            Station Dashboard
          </h1>
          <p className="text-xs text-cyan-100/70">
            Tonight&apos;s tails, temps, purge status, and historical trends.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full border border-cyan-900/60 bg-slate-950/60 px-3 py-1 text-cyan-100/80">
            Total logs: {logs.length}
          </span>
          <span className="rounded-full border border-cyan-900/60 bg-slate-950/60 px-3 py-1 text-cyan-100/80">
            Tails prepped: {nightTails.length}
          </span>
        </div>
      </header>

      {/* Main layout */}
      <div className="grid lg:grid-cols-[260px,1fr] gap-4">
        {/* LEFT COLUMN – Snapshot pills control filters */}
        <div className="space-y-4">
          {/* Filter explanation + clear button */}
          <section className="glacier-panel p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-cyan-50">
                Snapshot Filters
              </h2>
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] text-cyan-200 hover:text-cyan-100"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[10px] text-cyan-100/70">
              Tap any colored chip to filter tables and counts. Historical
              graphs always show all logs for tonight&apos;s aircraft.
            </p>
          </section>

          {/* Snapshot chips – they ARE the filters */}
          <section className="glacier-panel p-3 space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] text-cyan-100/80">Temperature health</p>
              <div className="flex flex-wrap gap-1.5">
                <PillStat
                  label="Logs"
                  value={totalLogsFiltered}
                  tone="slate"
                />
                <PillStat
                  label="Cold"
                  value={coldCount}
                  tone="sky"
                  clickable
                  active={activeTempFilters.includes("Cold")}
                  onClick={() => toggleTempFilter("Cold")}
                />
                <PillStat
                  label="Normal"
                  value={normalCount}
                  tone="emerald"
                  clickable
                  active={activeTempFilters.includes("Normal")}
                  onClick={() => toggleTempFilter("Normal")}
                />
                <PillStat
                  label="Above Target"
                  value={aboveTargetCount}
                  tone="amber"
                  clickable
                  active={activeTempFilters.includes("Above Target")}
                  onClick={() => toggleTempFilter("Above Target")}
                />
                <PillStat
                  label="Critical"
                  value={criticalHotCount}
                  tone="rose"
                  clickable
                  active={activeTempFilters.includes("Critical Hot")}
                  onClick={() => toggleTempFilter("Critical Hot")}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-cyan-900/60">
              <p className="text-[11px] text-cyan-100/80">Purge / drain</p>
              <div className="flex flex-wrap gap-1.5">
                <PillStat
                  label="Tails"
                  value={totalTailsFiltered}
                  tone="slate"
                />
                <PillStat
                  label="Purged"
                  value={purgedCount}
                  tone="sky"
                  clickable
                  active={activePurgeFilters.includes("Purged")}
                  onClick={() => togglePurgeFilter("Purged")}
                />
                <PillStat
                  label="Not Purged"
                  value={notPurgedCount}
                  tone="amber"
                  clickable
                  active={activePurgeFilters.includes("Not Purged")}
                  onClick={() => togglePurgeFilter("Not Purged")}
                />
                <PillStat
                  label="N/A / Unknown"
                  value={naPurgedCount}
                  tone="purple"
                  clickable
                  active={activePurgeFilters.includes("Unknown")}
                  onClick={() => togglePurgeFilter("Unknown")}
                />
              </div>
            </div>

            {filtersActive && (
              <p className="text-[10px] text-sky-300">
                Filters active:{" "}
                {[
                  ...activeTempFilters.map((s) => `Temp: ${s}`),
                  ...activePurgeFilters.map((s) => `Purge: ${s}`),
                ].join(" · ")}
              </p>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN – Historical on top + tables */}
        <div className="space-y-4">
          {/* Historical graphs for tonight's aircraft (IGNORES FILTERS) */}
          <section className="glacier-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-cyan-50">
                Historical Temps – Tonight&apos;s Aircraft
              </h2>
              <span className="text-[11px] text-cyan-100/70">
                Uses all temp logs for tonight&apos;s tails. Filters do not
                apply here.
              </span>
            </div>

            {nightTails.length === 0 ? (
              <p className="text-[11px] text-cyan-100/70">
                No tails have been added to Tonight&apos;s Aircraft.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
                {nightTails.map((t) => {
                  const data = getChartDataForTail(t.tail);
                  const hasData =
                    Array.isArray(data) && data.some((d) => d.temp != null);

                  // Use latest temp/status (all logs, ignores filters)
                  const latest = getLatestTempForTail(t.tail);
                  const latestStatus = latest?.status || null;
                  const hasLatest = !!latest;
                  let latestDisplayTemp = null;
                  if (hasLatest) {
                    const v =
                      typeof latest.temp === "number"
                        ? latest.temp
                        : Number(latest.temp);
                    latestDisplayTemp = isNaN(v)
                      ? String(latest.temp)
                      : `${v.toFixed(0)}°F`;
                  }

                  const isExpanded = expandedTailId === t.id;

                  // Base classes for the card – compact "box" style
                  let cardClass =
                    "rounded-lg border p-2 md:p-2.5 flex flex-col gap-1 min-h-[110px] cursor-pointer transition-all duration-150 ";

                  // Status-based color + pulse behavior when NOT expanded
                  if (!isExpanded) {
                    if (latestStatus === "Cold") {
                      cardClass +=
                        "border-rose-500/80 bg-rose-950/40 animate-pulse-fast";
                    } else if (latestStatus === "Normal") {
                      cardClass +=
                        "border-emerald-500/70 bg-emerald-950/40";
                    } else if (latestStatus === "Above Target") {
                      cardClass +=
                        "border-amber-500/80 bg-amber-950/40 animate-pulse-fast";
                    } else if (latestStatus === "Critical Hot") {
                      cardClass +=
                        "border-rose-500/90 bg-rose-950/50 animate-pulse-fast";
                    } else {
                      cardClass +=
                        "border-cyan-900/60 bg-slate-950/70";
                    }
                  } else {
                    // Expanded: larger, non-glowing, easier to read
                    if (latestStatus === "Cold") {
                      cardClass +=
                        "border-rose-500/80 bg-rose-950/70 shadow-lg";
                    } else if (latestStatus === "Normal") {
                      cardClass +=
                        "border-emerald-500/70 bg-emerald-950/70 shadow-lg";
                    } else if (latestStatus === "Above Target") {
                      cardClass +=
                        "border-amber-500/80 bg-amber-950/70 shadow-lg";
                    } else if (latestStatus === "Critical Hot") {
                      cardClass +=
                        "border-rose-500/90 bg-rose-950/80 shadow-lg";
                    } else {
                      cardClass +=
                        "border-cyan-900/60 bg-slate-950/80 shadow-lg";
                    }
                    cardClass += " md:min-h-[200px]";
                  }

                  return (
                    <div
                      key={t.id}
                      className={isExpanded ? "sm:col-span-2 xl:col-span-3" : ""}
                    >
                      <div
                        className={cardClass}
                        onClick={() =>
                          setExpandedTailId(isExpanded ? null : t.id)
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-cyan-50">
                              {t.tail}
                            </div>
                            <div className="text-[10px] text-cyan-100/70">
                              {t.gate || "No gate"} ·{" "}
                              {t.heatSource || "No heat source"}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 text-right">
                            {hasLatest ? (
                              <>
                                <div className="text-sm font-semibold text-cyan-50 leading-tight">
                                  {latestDisplayTemp}
                                </div>
                                <StatusBadge status={latestStatus} />
                                <span className="text-[10px] text-cyan-100/70">
                                  {latest?.time || "—"}
                                </span>
                              </>
                            ) : (
                              <span className="text-[10px] text-cyan-100/70">
                                No temps yet
                              </span>
                            )}
                            <span className="text-[9px] text-cyan-100/70">
                              {hasData ? `${data.length} checks` : "No data"}
                            </span>
                            <span className="text-[9px] text-cyan-100/60">
                              {isExpanded ? "Tap to collapse" : "Tap to expand"}
                            </span>
                          </div>
                        </div>

                        {hasData ? (
                          isExpanded ? (
                            <div className="h-40 mt-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={data}
                                  margin={{
                                    top: 5,
                                    right: 10,
                                    left: 0,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#1f2933"
                                  />
                                  <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 9, fill: "#9ca3af" }}
                                    interval="preserveStartEnd"
                                  />
                                  <YAxis
                                    tick={{ fontSize: 9, fill: "#9ca3af" }}
                                    width={28}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "#020617",
                                      borderColor: "#1f2937",
                                      borderRadius: 8,
                                      fontSize: 11,
                                    }}
                                    labelStyle={{ color: "#e5e7eb" }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="temp"
                                    stroke="#38bdf8"
                                    strokeWidth={2}
                                    dot={{ r: 2 }}
                                    activeDot={{ r: 3 }}
                                    connectNulls
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="mt-1.5 text-[10px] text-cyan-100/70">
                              Historical graph hidden. Tap to view trend.
                            </div>
                          )
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <p className="text-[11px] text-cyan-100/70">
                              No temperature history for this tail yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Tonight's Aircraft overview (filtered) */}
          <section className="glacier-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-cyan-50">
                Tonight&apos;s Aircraft (Filtered)
              </h2>
              <span className="text-[11px] text-cyan-100/70">
                {filteredNightTails.length} tails
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-[11px] text-left">
                <thead className="border-b border-cyan-900/60 text-cyan-100/70">
                  <tr>
                    <th className="py-2 pr-3">Tail</th>
                    <th className="py-2 pr-3 hidden md:table-cell">Gate</th>
                    <th className="py-2 pr-3 hidden lg:table-cell">Heat</th>
                    <th className="py-2 pr-3">Purge</th>
                    <th className="py-2 pr-3 hidden md:table-cell">In-Time</th>
                    <th className="py-2 pr-3">Latest Temp / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-900/60">
                  {filteredNightTails.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-4 text-center text-[11px] text-cyan-100/70"
                      >
                        No tails match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredNightTails.map((t) => {
                      const purgeLabel =
                        t.purgedDrained === "Yes"
                          ? t.purgedAt
                            ? `Yes · ${t.purgedAt}`
                            : "Yes"
                          : t.purgedDrained || "N/A";

                      const latestTemp = getLatestTempForTail(t.tail);

                      return (
                    <tr key={t.id} className="hover:bg-slate-900/50">
                          <td className="py-2 pr-3 text-cyan-50">
                            {t.tail}
                          </td>
                          <td className="py-2 pr-3 hidden md:table-cell">
                            {t.gate || "—"}
                          </td>
                          <td className="py-2 pr-3 hidden lg:table-cell">
                            {t.heatSource || "—"}
                          </td>
                          <td className="py-2 pr-3">
                            <span className="text-[11px] text-cyan-100">
                              {purgeLabel}
                            </span>
                          </td>
                          <td className="py-2 pr-3 hidden md:table-cell">
                            {t.inTime || "Waiting"}
                          </td>
                          <td className="py-2 pr-3">
                            {latestTemp ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-cyan-50">
                                  {typeof latestTemp.temp === "number"
                                    ? `${latestTemp.temp.toFixed(0)}°F`
                                    : latestTemp.temp}
                                </span>
                                <StatusMini
                                  status={latestTemp.status}
                                  time={latestTemp.time}
                                />
                              </div>
                            ) : (
                              <span className="text-cyan-100/70 text-[11px]">
                                No temp logged
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent logs list (filtered) */}
          <section className="glacier-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-cyan-50">
                Recent Temperature Logs (Filtered)
              </h2>
              <span className="text-[11px] text-cyan-100/70">
                Showing {latestLogs.length} of {filteredLogs.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-[11px] text-left">
                <thead className="border-b border-cyan-900/60 text-cyan-100/70">
                  <tr>
                    <th className="py-2 pr-3">Tail</th>
                    <th className="py-2 pr-3">Temp (°F)</th>
                    <th className="py-2 pr-3 hidden sm:table-cell">Status</th>
                    <th className="py-2 pr-3 hidden md:table-cell">Location</th>
                    <th className="py-2 pr-3 hidden md:table-cell">Heat</th>
                    <th className="py-2 pr-3">Time</th>
                    <th className="py-2 pr-3 hidden lg:table-cell">Purge</th>
                    <th className="py-2 pr-3 hidden lg:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-900/60">
                  {latestLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-4 text-center text-[11px] text-cyan-100/70"
                      >
                        No logs match the current filters.
                      </td>
                    </tr>
                  ) : (
                    latestLogs.map((log) => {
                      const purgeInfo = getPurgeInfoForTail(log.tail);
                      const purgeLabel = purgeInfo
                        ? purgeInfo.purgedDrained === "Yes"
                          ? purgeInfo.purgedAt
                            ? `Yes · ${purgeInfo.purgedAt}`
                            : "Yes"
                          : purgeInfo.purgedDrained || "N/A"
                        : "N/A";

                      let rowClass = "hover:bg-slate-900/50 border-l-2 ";
                      if (log.status === "Critical Hot") {
                        rowClass += "border-l-rose-500/80";
                      } else if (log.status === "Above Target") {
                        rowClass += "border-l-amber-500/80";
                      } else if (log.status === "Cold") {
                        rowClass += "border-l-sky-500/70";
                      } else if (log.status === "Normal") {
                        rowClass += "border-l-emerald-500/70";
                      } else {
                        rowClass += "border-l-cyan-900/70";
                      }

                      return (
                        <tr key={log.id} className={rowClass}>
                          <td className="py-2 pr-3 text-cyan-50">
                            {log.tail || "—"}
                          </td>
                          <td className="py-2 pr-3">
                            {typeof log.temp === "number"
                              ? log.temp.toFixed(0)
                              : log.temp}
                          </td>
                          <td className="py-2 pr-3 hidden sm:table-cell">
                            <StatusBadge status={log.status} />
                          </td>
                          <td className="py-2 pr-3 hidden md:table-cell">
                            {log.location || "—"}
                          </td>
                          <td className="py-2 pr-3 hidden md:table-cell">
                            {log.heatSource || "—"}
                          </td>
                          <td className="py-2 pr-3">{log.time || "—"}</td>
                          <td className="py-2 pr-3 hidden lg:table-cell">
                            {purgeLabel}
                          </td>
                          <td className="py-2 pr-3 hidden lg:table-cell max-w-[220px]">
                            <span className="line-clamp-2 text-cyan-100/80">
                              {log.notes || "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* Snapshot pill component – interactive */

function PillStat({ label, value, tone, clickable, active, onClick }) {
  let base =
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition cursor-default";
  let colors =
    "bg-slate-950/60 border-cyan-900/60 text-cyan-100 hover:bg-slate-900/70";

  if (tone === "sky") {
    colors =
      "bg-cyan-400/15 border-cyan-200/70 text-slate-950 hover:bg-cyan-300/30";
  } else if (tone === "amber") {
    colors =
      "bg-amber-500/10 border-amber-400/70 text-amber-50 hover:bg-amber-500/20";
  } else if (tone === "rose") {
    colors =
      "bg-rose-500/10 border-rose-500/70 text-rose-100 hover:bg-rose-500/20";
  } else if (tone === "purple") {
    colors =
      "bg-indigo-400/15 border-indigo-300/70 text-indigo-50 hover:bg-indigo-400/25";
  } else if (tone === "emerald") {
    colors =
      "bg-emerald-500/10 border-emerald-400/70 text-emerald-50 hover:bg-emerald-500/20";
  }

  if (clickable) {
    base += " cursor-pointer select-none";
    if (active) {
      colors += " ring-1 ring-offset-0 ring-cyan-200/70";
    }
  }

  const Tag = clickable ? "button" : "span";

  return (
    <Tag className={`${base} ${colors}`} onClick={clickable ? onClick : undefined}>
      <span className="text-[10px] uppercase tracking-wide opacity-80">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </Tag>
  );
}

function StatusBadge({ status }) {
  if (!status) return <span className="text-cyan-100/60">—</span>;

  let cls =
    "inline-flex rounded-full px-2 py-0.5 border text-[11px] bg-slate-900/60 text-cyan-100 border-cyan-900/60";
  if (status === "Critical Hot") {
    cls =
      "inline-flex rounded-full px-2 py-0.5 border text-[11px] bg-rose-500/10 text-rose-300 border-rose-500/70";
  } else if (status === "Above Target") {
    cls =
      "inline-flex rounded-full px-2 py-0.5 border text-[11px] bg-amber-500/10 text-amber-300 border-amber-500/70";
  } else if (status === "Cold") {
    cls =
      "inline-flex rounded-full px-2 py-0.5 border text-[11px] bg-sky-500/10 text-sky-300 border-sky-500/70";
  } else if (status === "Normal") {
    cls =
      "inline-flex rounded-full px-2 py-0.5 border text-[11px] bg-emerald-500/10 text-emerald-300 border-emerald-500/70";
  }

  return <span className={cls}>{status}</span>;
}

function StatusMini({ status, time }) {
  if (!status) {
    return <span className="text-[10px] text-cyan-100/70">—</span>;
  }

  let dotClass = "h-1.5 w-1.5 rounded-full ";
  if (status === "Critical Hot") {
    dotClass += "bg-rose-400";
  } else if (status === "Above Target") {
    dotClass += "bg-amber-400";
  } else if (status === "Cold") {
    dotClass += "bg-sky-400";
  } else if (status === "Normal") {
    dotClass += "bg-emerald-400";
  } else {
    dotClass += "bg-slate-500";
  }

  return (
    <div className="flex items-center gap-1 text-[10px] text-cyan-100">
      <span className={dotClass} />
      <span>{status}</span>
      {time && <span className="text-cyan-100/70">· {time}</span>}
    </div>
  );
}