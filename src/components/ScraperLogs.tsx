import { useEffect, useState, useRef } from "react";
import { api, ScrapeLog, RawLogsResponse } from "../api";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(started: string, finished: string): string {
  const ms = new Date(finished).getTime() - new Date(started).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function classifyLine(line: string): "filtered" | "error" | "http" | "info" | "other" {
  if (line.includes("FILTERED")) return "filtered";
  if (line.includes("[ERROR]")) return "error";
  if (line.includes("HTTP Request:")) return "http";
  if (line.includes("[INFO]")) return "info";
  return "other";
}

function LineColorClass(type: ReturnType<typeof classifyLine>): string {
  switch (type) {
    case "filtered": return "log-line--filtered";
    case "error":    return "log-line--error";
    case "http":     return "log-line--http";
    case "info":     return "log-line--info";
    default:         return "log-line--other";
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatPill({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <span className={`stat-pill ${highlight ? "stat-pill--highlight" : ""}`}>
      <span className="stat-pill__value">{value}</span>
      <span className="stat-pill__label">{label}</span>
    </span>
  );
}

function RunRow({
  log,
  selected,
  onClick,
}: {
  log: ScrapeLog;
  selected: boolean;
  onClick: () => void;
}) {
  const addRatio = log.jobs_found > 0
    ? Math.round((log.jobs_added / log.jobs_found) * 100)
    : 0;

  return (
    <button
      className={`run-row ${selected ? "run-row--selected" : ""} ${log.status === "error" ? "run-row--error" : ""}`}
      onClick={onClick}
    >
      <div className="run-row__top">
        <span className="run-row__time">{formatTime(log.started_at)}</span>
        <span className={`run-row__badge run-row__badge--${log.status}`}>{log.status}</span>
      </div>
      <div className="run-row__stats">
        <StatPill label="found" value={log.jobs_found} />
        <StatPill label="added" value={log.jobs_added} highlight={log.jobs_added > 0} />
        <StatPill label="filtered" value={log.jobs_filtered} />
        {log.finished_at && (
          <span className="run-row__duration">
            {formatDuration(log.started_at, log.finished_at)}
          </span>
        )}
      </div>
      {log.error_message && (
        <div className="run-row__error-msg">{log.error_message}</div>
      )}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type RawFilter = "all" | "filtered" | "added" | "errors";

export default function ScraperLogs() {
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ScrapeLog | null>(null);
  const [rawData, setRawData] = useState<RawLogsResponse | null>(null);
  const [rawFilter, setRawFilter] = useState<RawFilter>("all");
  const [sourceFilter, setSourceFilter] = useState("");
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingRaw, setLoadingRaw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Load DB run history
  useEffect(() => {
    setLoadingLogs(true);
    api.scraper
      .logs(200)
      .then((data) => {
        setLogs(data);
        // Auto-select most recent
        if (data.length > 0) setSelectedLog(data[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingLogs(false));
  }, []);

  // Load raw log whenever filters change
  useEffect(() => {
    setLoadingRaw(true);
    setRawData(null);

    const params: Parameters<typeof api.scraper.rawLogs>[0] = { limit: 3000 };
    if (sourceFilter.trim()) params.source = sourceFilter.trim();
    // "filtered" and "errors" are server-side filters; "added" is client-side
    if (rawFilter === "filtered") params.filter_type = "filtered";
    if (rawFilter === "errors") params.level = "ERROR";

    api.scraper
      .rawLogs(params)
      .then(setRawData)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingRaw(false));
  }, [rawFilter, sourceFilter]);

  // Scroll to bottom when raw log loads
  useEffect(() => {
    if (rawData && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [rawData]);

  const filteredLines = rawFilter === "added"
    ? (rawData?.lines ?? []).filter(l => l.includes("] ADDED "))
    : rawData?.lines ?? [];

  return (
    <div className="scraper-logs">
      {/* ── Left panel: DB run history ── */}
      <div className="scraper-logs__left">
        <div className="panel-header">
          <h2 className="panel-title">Run History</h2>
          <span className="panel-subtitle">from database</span>
        </div>

        {loadingLogs && <div className="panel-loading">Loading…</div>}
        {error && <div className="panel-error">{error}</div>}

        <div className="run-list">
          {logs.map((log) => (
            <RunRow
              key={log.id}
              log={log}
              selected={selectedLog?.id === log.id}
              onClick={() => setSelectedLog(log)}
            />
          ))}
          {!loadingLogs && logs.length === 0 && (
            <div className="panel-empty">No runs recorded yet.</div>
          )}
        </div>
      </div>

      {/* ── Right panel: raw log viewer ── */}
      <div className="scraper-logs__right">
        <div className="panel-header panel-header--row">
          <div>
            <h2 className="panel-title">Raw Log</h2>
            <span className="panel-subtitle">most recent run only</span>
          </div>
          <div className="log-controls">
            <input
              className="log-search"
              type="text"
              placeholder="Filter by source…"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            />
            <div className="log-filter-tabs">
              {(["all", "filtered", "added", "errors"] as RawFilter[]).map((f) => (
                <button
                  key={f}
                  className={`filter-tab ${rawFilter === f ? "filter-tab--active" : ""}`}
                  onClick={() => setRawFilter(f)}
                >
                  {f === "filtered" ? "Filtered" : f === "added" ? "Added" : f === "errors" ? "Errors" : "All"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="log-viewer">
          {loadingRaw && <div className="panel-loading">Loading log…</div>}

          {!loadingRaw && rawData && (
            <>
              <div className="log-meta">
                {rawData.total} lines · {rawData.note}
              </div>
              <div className="log-lines">
                {filteredLines.length === 0 ? (
                  <div className="panel-empty">No matching lines.</div>
                ) : (
                  filteredLines.map((line, i) => {
                    const type = classifyLine(line);
                    return (
                      <div key={i} className={`log-line ${LineColorClass(type)}`}>
                        <span className="log-line__num">{i + 1}</span>
                        <span className="log-line__text">{line}</span>
                      </div>
                    );
                  })
                )}
                <div ref={logEndRef} />
              </div>
            </>
          )}

          {!loadingRaw && !rawData && !error && (
            <div className="panel-empty">No log data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}