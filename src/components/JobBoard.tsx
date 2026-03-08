import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Job,
  JobRole,
  JobStatus,
  JOB_ROLE_COLORS,
  JOB_ROLE_SHORT,
} from "../types";
import { api } from "../api";

import { formatDate } from "../utils/dateUtils";

const STATUS_LABELS: Record<JobStatus, string> = {
  new: "New",
  saved: "Saved",
  applied: "Applied",
  archived: "Archived",
};

const STATUS_COLORS: Record<JobStatus, string> = {
  new: "#3b9eff",
  saved: "#a78bfa",
  applied: "#10b981",
  archived: "#4a5268",
};

type DetailMode = "description" | "tailoring";

// ── Lightweight markdown renderer ─────────────────────────────────────────────
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/((?:^[*\-] .+$\n?)+)/gm, (block) => {
      const items = block
        .trim()
        .split("\n")
        .map((l) => `<li>${l.replace(/^[*\-] /, "")}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    })
    .replace(/((?:^\d+\. .+$\n?)+)/gm, (block) => {
      const items = block
        .trim()
        .split("\n")
        .map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`)
        .join("");
      return `<ol>${items}</ol>`;
    })
    .replace(/(?<!\>)\n\n(?!\<)/g, "</p><p>")
    .replace(/(?<!\>)\n(?!\<)/g, "<br/>");
}

function MarkdownBody({ content }: { content: string }) {
  return (
    <div
      className="detail-description markdown-body"
      dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(content)}</p>` }}
    />
  );
}

// ── Apply modal ───────────────────────────────────────────────────────────────
function ApplyModal({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onNo();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNo]);

  return (
    <div className="modal-backdrop" onClick={onNo}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            width={22}
            height={22}
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="modal-title">Did you apply?</h2>
        <p className="modal-body">
          Mark this job as <strong>Applied</strong> to track it in your
          pipeline.
        </p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-yes" onClick={onYes}>
            Yes, mark as Applied
          </button>
          <button className="modal-btn modal-btn-no" onClick={onNo}>
            Not yet
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function MatchBar({ score }: { score: number }) {
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="match-bar-wrap" title={`${score}% match`}>
      <div className="match-bar-bg">
        <div
          className="match-bar-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="match-score" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

function RolePill({ role }: { role: JobRole }) {
  const color = JOB_ROLE_COLORS[role];
  return (
    <span
      className="role-pill"
      style={{ color, borderColor: color + "44", background: color + "18" }}
    >
      {JOB_ROLE_SHORT[role]}
    </span>
  );
}

function JobCard({
  job,
  selected,
  onClick,
}: {
  job: Job;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`job-card ${selected ? "selected" : ""} ${
        job.status === "archived" ? "archived" : ""
      }`}
      onClick={onClick}
    >
      <div className="job-card-header">
        <div className="job-card-titles">
          <span className="job-title">{job.title}</span>
          <span className="job-company">{job.company ?? "—"}</span>
        </div>
        <div className="job-card-badges">
          {job.role && <RolePill role={job.role} />}
          <span
            className="status-badge"
            style={{
              color: STATUS_COLORS[job.status],
              borderColor: STATUS_COLORS[job.status] + "44",
              background: STATUS_COLORS[job.status] + "18",
            }}
          >
            {STATUS_LABELS[job.status]}
          </span>
        </div>
      </div>
      <div className="job-card-meta">
        <span className="meta-tag">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            width={11}
            height={11}
          >
            <rect x="1" y="2" width="14" height="12" rx="2" />
            <path d="M1 6h14" />
            <path d="M5 1v2M11 1v2" />
          </svg>
          {formatDate(job.found_at)}
        </span>
      </div>
      {job.match_score != null && <MatchBar score={job.match_score} />}
    </button>
  );
}

function JobDetail({ job }: { job: Job }) {
  const [mode, setMode] = useState<DetailMode>("description");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (status: JobStatus) => api.jobs.updateStatus(job.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const handleLinkClick = useCallback(() => {
    setTimeout(() => setShowApplyModal(true), 300);
  }, []);

  const handleApplyYes = () => {
    statusMutation.mutate("applied");
    setShowApplyModal(false);
  };

  return (
    <div
      className={`job-detail ${
        job.status === "archived" ? "detail-archived" : ""
      }`}
    >
      {showApplyModal && (
        <ApplyModal
          onYes={handleApplyYes}
          onNo={() => setShowApplyModal(false)}
        />
      )}

      <div className="detail-header">
        <div className="detail-title-block">
          <div className="detail-title-row">
            <h1 className="detail-job-title">{job.title}</h1>
            {job.role && <RolePill role={job.role} />}
          </div>
          <div className="detail-meta-row">
            <span className="detail-company">{job.company ?? "—"}</span>
            {job.location && (
              <>
                <span className="detail-dot">·</span>
                <span className="detail-location">{job.location}</span>
              </>
            )}
            {job.job_type && (
              <>
                <span className="detail-dot">·</span>
                <span className="detail-type">{job.job_type}</span>
              </>
            )}
            {job.salary && (
              <>
                <span className="detail-dot">·</span>
                <span className="detail-salary">{job.salary}</span>
              </>
            )}
          </div>
          <div className="detail-source">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              width={12}
              height={12}
            >
              <path d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3" />
              <path d="M10 1h5v5" />
              <path d="M15 1L7 9" />
            </svg>
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-source-link"
              onClick={handleLinkClick}
            >
              {job.job_url}
            </a>
          </div>
        </div>

        <div className="detail-actions">
          {job.status !== "saved" && job.status !== "archived" && (
            <button
              className="btn-action btn-save"
              onClick={() => statusMutation.mutate("saved")}
              disabled={statusMutation.isPending}
              title="Save this job"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                width={12}
                height={12}
              >
                <path d="M3 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1z" />
              </svg>
              Save
            </button>
          )}
          {job.status !== "archived" && (
            <button
              className="btn-action btn-archive"
              onClick={() => statusMutation.mutate("archived")}
              disabled={statusMutation.isPending}
              title="Archive this job"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                width={12}
                height={12}
              >
                <rect x="1" y="3" width="14" height="3" rx="1" />
                <path d="M2 6v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6" />
                <path d="M6 9h4" />
              </svg>
              Archive
            </button>
          )}
          <select
            className="status-select"
            value={job.status}
            onChange={(e) => statusMutation.mutate(e.target.value as JobStatus)}
            disabled={statusMutation.isPending}
          >
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          {job.status !== "archived" && (
            <button className="btn-tailor" disabled>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                width={13}
                height={13}
              >
                <path d="M13 2L3 8l3 1.5L7.5 13 13 2z" />
              </svg>
              Tailor Resume
            </button>
          )}
        </div>
      </div>

      {job.status === "archived" && (
        <div className="archived-banner">
          This job has been archived. It will remain in the database but won't
          appear as new again.
        </div>
      )}

      {mode === "description" && (
        <div className="detail-body">
          {job.scrape_status === "pending" && (
            <div className="base-resume-indicator">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                width={12}
                height={12}
              >
                <circle cx="8" cy="8" r="7" />
                <path d="M8 5v3l2 2" />
              </svg>
              Full job details are being scraped and will appear shortly.
            </div>
          )}
          {job.description && (
            <section className="detail-section">
              <h3 className="section-label">About the Role</h3>
              <MarkdownBody content={job.description} />
            </section>
          )}
          {job.requirements && job.requirements.length > 0 && (
            <section className="detail-section">
              <h3 className="section-label">Requirements</h3>
              <ul className="requirements-list">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </section>
          )}
          {job.match_score != null && (
            <section className="detail-section">
              <h3 className="section-label">Match Analysis</h3>
              <div className="match-analysis">
                <div
                  className="match-score-big"
                  style={{
                    color:
                      job.match_score >= 85
                        ? "#10b981"
                        : job.match_score >= 70
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                >
                  {job.match_score}%
                </div>
                <p className="match-note">
                  Claude's analysis of how well your base resume matches this
                  job description.
                </p>
              </div>
            </section>
          )}
          {!job.description && job.scrape_status !== "pending" && (
            <div className="detail-empty" style={{ height: "120px" }}>
              No details available for this job.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function JobBoard() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [roleFilter, setRoleFilter] = useState<JobRole | "all">("all");
  const [companyFilter, setCompanyFilter] = useState("");
  const queryClient = useQueryClient();

  const {
    data: rawJobs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["jobs", statusFilter, roleFilter],
    queryFn: () =>
      api.jobs.list({
        status: statusFilter,
        role: roleFilter !== "all" ? roleFilter : undefined,
      }),
  });

  const jobs = companyFilter.trim()
    ? rawJobs.filter((j) =>
        j.company?.toLowerCase().includes(companyFilter.trim().toLowerCase())
      )
    : rawJobs;

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const jobCountRef = useRef<number>(0);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => stopPolling, []);

  useEffect(() => {
    if (isScraping && rawJobs.length > jobCountRef.current) {
      setIsScraping(false);
    }
  }, [rawJobs, isScraping]);

  const scrapeMutation = useMutation({
    mutationFn: api.scraper.runAll,
    onSuccess: () => {
      jobCountRef.current = rawJobs.length;
      setIsScraping(true);
      stopPolling();
      pollRef.current = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
      }, 5000);
      setTimeout(() => {
        stopPolling();
        setIsScraping(false);
      }, 180_000);
    },
  });

  const selected = jobs.find((j) => j.id === selectedId) ?? jobs[0] ?? null;
  // Count against rawJobs so counts are unaffected by company filter
  const countFor = (s: JobStatus) =>
    rawJobs.filter((j) => j.status === s).length;
  const countByRole = (role: JobRole) =>
    jobs.filter((j) => j.role === role).length;

  if (isLoading) return <div className="detail-empty">Loading jobs...</div>;
  if (isError) return <div className="detail-empty">Failed to load jobs.</div>;

  return (
    <div className="split-pane">
      <div className="pane-left">
        <div className="pane-left-header">
          <h2 className="pane-title">Job Board</h2>
          <button
            className="btn-refresh"
            title="Scrape all sources"
            onClick={() => scrapeMutation.mutate()}
            disabled={isScraping || scrapeMutation.isPending}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              width={14}
              height={14}
              style={{
                animation:
                  isScraping || scrapeMutation.isPending
                    ? "spin 0.7s linear infinite"
                    : "none",
              }}
            >
              <path d="M1 4s1.5-3 7-3a7 7 0 1 1-5.1 2.2" />
              <polyline points="1,1 1,4 4,4" />
            </svg>
          </button>
        </div>

        {/* Row 1: Status filter */}
        <div className="filter-tabs">
          {(["all", "new", "saved", "applied", "archived"] as const).map(
            (s) => (
              <button
                key={s}
                className={`filter-tab ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "All" : STATUS_LABELS[s]}
                {s !== "archived" && (
                  <span className="filter-count">
                    {s === "all" ? rawJobs.length : countFor(s)}
                  </span>
                )}
              </button>
            )
          )}
        </div>

        {/* Row 2: Role filter */}
        <div className="filter-tabs filter-tabs-role">
          <button
            className={`filter-tab ${roleFilter === "all" ? "active" : ""}`}
            onClick={() => setRoleFilter("all")}
          >
            All roles
          </button>
          {(
            ["engineering_manager", "product_manager", "engineer"] as JobRole[]
          ).map((role) => (
            <button
              key={role}
              className={`filter-tab ${roleFilter === role ? "active" : ""}`}
              onClick={() => setRoleFilter(role)}
              style={
                roleFilter === role
                  ? {
                      color: JOB_ROLE_COLORS[role],
                      background: JOB_ROLE_COLORS[role] + "18",
                    }
                  : {}
              }
            >
              <span
                className="role-dot"
                style={{ background: JOB_ROLE_COLORS[role] }}
              />
              {JOB_ROLE_SHORT[role]}
              <span className="filter-count">{countByRole(role)}</span>
            </button>
          ))}
        </div>

        {/* Row 3: Company filter */}
        <div className="filter-search">
          <svg
            className="filter-search-icon"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            width={12}
            height={12}
          >
            <circle cx="6.5" cy="6.5" r="4.5" />
            <path d="M10 10l3 3" />
          </svg>
          <input
            className="filter-search-input"
            type="text"
            placeholder="Filter by company..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          />
          {companyFilter && (
            <button
              className="filter-search-clear"
              onClick={() => setCompanyFilter("")}
              title="Clear"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                width={10}
                height={10}
              >
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          )}
        </div>

        <div className="job-list">
          {jobs.length === 0 ? (
            <div className="detail-empty" style={{ height: "120px" }}>
              No jobs match these filters
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                selected={job.id === selectedId}
                onClick={() => setSelectedId(job.id)}
              />
            ))
          )}
        </div>
      </div>

      <div className="pane-right">
        {selected ? (
          <JobDetail job={selected} />
        ) : (
          <div className="detail-empty">Select a job to view details</div>
        )}
      </div>
    </div>
  );
}
