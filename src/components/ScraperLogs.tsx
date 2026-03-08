import { useEffect, useState, useRef } from "react";
import { api, ScrapeLog, RawLogsResponse } from "../api";

import { formatDateTime, formatDuration } from "../utils/dateUtils";

// ── Log line parser ───────────────────────────────────────────────────────────

type Segment = { text: string; cls: string };

// Matches: "2026-03-07 22:00:24,358 [INFO] [SoFi] FILTERED location=...: 'Title'"
const LOG_RE =
  /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d+)\s+(\[\w+\])\s+(\[\w[\w\s\-&.]*\])\s*(.*)?$/;

function parseLine(line: string): Segment[] {
  const m = line.match(LOG_RE);
  if (!m) return [{ text: line, cls: "ll-other" }];

  const [, timestamp, level, source, rest = ""] = m;

  const levelCls =
    level === "[ERROR]"
      ? "ll-level-error"
      : level === "[WARNING]"
      ? "ll-level-warn"
      : "ll-level-info";

  // Classify the message keyword
  let msgCls = "ll-msg";
  if (rest.startsWith("FILTERED")) msgCls = "ll-filtered";
  else if (rest.startsWith("ADDED")) msgCls = "ll-added";
  else if (rest.startsWith("SKIPPED")) msgCls = "ll-skipped";
  else if (rest.startsWith("Found ")) msgCls = "ll-found";
  else if (rest.startsWith("HTTP Request:")) msgCls = "ll-http";
  else if (rest.startsWith("Using ")) msgCls = "ll-meta";

  return [
    { text: timestamp, cls: "ll-timestamp" },
    { text: " ", cls: "" },
    { text: level, cls: levelCls },
    { text: " ", cls: "" },
    { text: source, cls: "ll-source" },
    { text: " ", cls: "" },
    { text: rest, cls: msgCls },
  ];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <span className={`stat-pill ${highlight ? "stat-pill--highlight" : ""}`}>
      <span className="stat-pill__value">{value}</span>
      <span className="stat-pill__label">{label}</span>
    </span>
  );
}

function RunRow({
  log,
  company,
  selected,
  onClick,
}: {
  log: ScrapeLog;
  company?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`run-row ${selected ? "run-row--selected" : ""} ${
        log.status === "error" ? "run-row--error" : ""
      }`}
      onClick={onClick}
    >
      <div className="run-row__top">
        <span className="run-row__time">{formatDateTime(log.started_at)}</span>
        <span className={`run-row__badge run-row__badge--${log.status}`}>
          {log.status}
        </span>
      </div>
      {company && <div className="run-row__company">{company}</div>}
      <div className="run-row__stats">
        <StatPill label="found" value={log.jobs_found} />
        <StatPill
          label="added"
          value={log.jobs_added}
          highlight={log.jobs_added > 0}
        />
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
  const [sourceMap, setSourceMap] = useState<Record<number, string>>({});
  const [rawData, setRawData] = useState<RawLogsResponse | null>(null);
  const [rawFilter, setRawFilter] = useState<RawFilter>("all");
  const [sourceFilter, setSourceFilter] = useState("");
  const [runFilter, setRunFilter] = useState("");
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingRaw, setLoadingRaw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Load DB run history + sources map
  useEffect(() => {
    setLoadingLogs(true);
    Promise.all([api.scraper.logs(200), api.sources.list()])
      .then(([logData, sourcesData]) => {
        setLogs(logData);
        const map: Record<number, string> = {};
        sourcesData.forEach((s) => {
          map[s.id] = s.company;
        });
        setSourceMap(map);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingLogs(false));
  }, []);

  // Load raw log whenever filters change
  useEffect(() => {
    setLoadingRaw(true);
    setRawData(null);

    const params: Parameters<typeof api.scraper.rawLogs>[0] = { limit: 5000 };
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

  const filteredLines =
    rawFilter === "added"
      ? (rawData?.lines ?? []).filter((l) => l.includes("] ADDED "))
      : rawData?.lines ?? [];

  const visibleLogs = runFilter.trim()
    ? logs.filter((l) =>
        sourceMap[l.source_id]
          ?.toLowerCase()
          .includes(runFilter.trim().toLowerCase())
      )
    : logs;

  function handleRowClick(log: ScrapeLog) {
    setSelectedLog(log);
    const company = sourceMap[log.source_id];
    if (company) setSourceFilter(company);
  }

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

        <div className="filter-search">
          <svg
            className="filter-search-icon"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="filter-search-input"
            type="text"
            placeholder="Filter by source…"
            value={runFilter}
            onChange={(e) => setRunFilter(e.target.value)}
          />
          {runFilter && (
            <button
              className="filter-search-clear"
              onClick={() => setRunFilter("")}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="run-list">
          {visibleLogs.map((log) => (
            <RunRow
              key={log.id}
              log={log}
              company={sourceMap[log.source_id]}
              selected={selectedLog?.id === log.id}
              onClick={() => handleRowClick(log)}
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
            <div className="log-search-wrap">
              <input
                className="log-search"
                type="text"
                placeholder="Filter by source…"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              />
              {sourceFilter && (
                <button
                  className="log-search-clear"
                  onClick={() => setSourceFilter("")}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <div className="log-filter-tabs">
              {(["all", "filtered", "added", "errors"] as RawFilter[]).map(
                (f) => (
                  <button
                    key={f}
                    className={`filter-tab ${
                      rawFilter === f ? "filter-tab--active" : ""
                    }`}
                    onClick={() => setRawFilter(f)}
                  >
                    {f === "filtered"
                      ? "Filtered"
                      : f === "added"
                      ? "Added"
                      : f === "errors"
                      ? "Errors"
                      : "All"}
                  </button>
                )
              )}
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
                    const segments = parseLine(line);
                    return (
                      <div key={i} className="log-line">
                        <span className="log-line__num">{i + 1}</span>
                        <span className="log-line__text">
                          {segments.map((seg, j) =>
                            seg.cls ? (
                              <span key={j} className={seg.cls}>
                                {seg.text}
                              </span>
                            ) : (
                              seg.text
                            )
                          )}
                        </span>
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
