import { useState } from "react";
import { Job, JobRole, JobStatus, JOB_ROLE_COLORS, JOB_ROLE_SHORT } from "../types";
import { FAKE_JOBS, FAKE_RESUMES } from "../data/fakeData";

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

function MatchBar({ score }: { score: number }) {
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="match-bar-wrap" title={`${score}% match`}>
      <div className="match-bar-bg">
        <div className="match-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="match-score" style={{ color }}>{score}%</span>
    </div>
  );
}

function RolePill({ role }: { role: JobRole }) {
  const color = JOB_ROLE_COLORS[role];
  return (
    <span className="role-pill" style={{ color, borderColor: color + "44", background: color + "18" }}>
      {JOB_ROLE_SHORT[role]}
    </span>
  );
}

function JobCard({ job, selected, onClick }: { job: Job; selected: boolean; onClick: () => void }) {
  return (
    <button className={`job-card ${selected ? "selected" : ""} ${job.status === "archived" ? "archived" : ""}`} onClick={onClick}>
      <div className="job-card-header">
        <div className="job-card-titles">
          <span className="job-title">{job.title}</span>
          <span className="job-company">{job.company}</span>
        </div>
        <div className="job-card-badges">
          <RolePill role={job.role} />
          <span className="status-badge" style={{ color: STATUS_COLORS[job.status], borderColor: STATUS_COLORS[job.status] + "44", background: STATUS_COLORS[job.status] + "18" }}>
            {STATUS_LABELS[job.status]}
          </span>
        </div>
      </div>
      <div className="job-card-meta">
        <span className="meta-tag">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} width={11} height={11}>
            <path d="M8 1.5A4.5 4.5 0 1 0 8 10.5A4.5 4.5 0 0 0 8 1.5z" />
            <path d="M8 14.5v-4" />
          </svg>
          {job.companyTag}
        </span>
        <span className="meta-tag">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} width={11} height={11}>
            <rect x="1" y="2" width="14" height="12" rx="2" />
            <path d="M1 6h14" />
            <path d="M5 1v2M11 1v2" />
          </svg>
          {new Date(job.dateFound).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
      <MatchBar score={job.matchScore} />
    </button>
  );
}

function JobDetail({ job, onStatusChange }: { job: Job; onStatusChange: (id: string, status: JobStatus) => void }) {
  const [mode, setMode] = useState<DetailMode>("description");
  const [tailoring, setTailoring] = useState(false);
  const [tailored, setTailored] = useState<string | null>(null);

  const baseResume = FAKE_RESUMES.find(r => r.isBase && r.baseForRole === job.role);

  const handleTailor = () => {
    setMode("tailoring");
    setTailoring(true);
    setTimeout(() => {
      setTailoring(false);
      setTailored(`${baseResume?.name.toUpperCase()} — TAILORED FOR ${job.company.toUpperCase()}

[This would be Claude-generated content tailored specifically to the ${job.title} role at ${job.company}, rewriting bullets and reordering sections to match the job description's priorities.]

Key changes made:
${job.requirements.slice(0, 3).map(r => `→ Highlighted experience relevant to: "${r}"`).join("\n")}`);
    }, 2200);
  };

  return (
    <div className={`job-detail ${job.status === "archived" ? "detail-archived" : ""}`}>
      <div className="detail-header">
        <div className="detail-title-block">
          <div className="detail-title-row">
            <h1 className="detail-job-title">{job.title}</h1>
            <RolePill role={job.role} />
          </div>
          <div className="detail-meta-row">
            <span className="detail-company">{job.company}</span>
            <span className="detail-dot">·</span>
            <span className="detail-location">{job.location}</span>
            <span className="detail-dot">·</span>
            <span className="detail-type">{job.type}</span>
            {job.salary && <><span className="detail-dot">·</span><span className="detail-salary">{job.salary}</span></>}
          </div>
          <div className="detail-source">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} width={12} height={12}>
              <path d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3" />
              <path d="M10 1h5v5" /><path d="M15 1L7 9" />
            </svg>
            {job.sourceUrl}
          </div>
        </div>
        <div className="detail-actions">
          <select
            className="status-select"
            value={job.status}
            onChange={e => onStatusChange(job.id, e.target.value as JobStatus)}
          >
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {job.status !== "archived" && (
            <button className="btn-tailor" onClick={handleTailor} disabled={tailoring}>
              {tailoring ? (
                <><span className="spinner" />Tailoring...</>
              ) : (
                <><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} width={13} height={13}><path d="M13 2L3 8l3 1.5L7.5 13 13 2z" /></svg>Tailor Resume</>
              )}
            </button>
          )}
        </div>
      </div>

      {job.status === "archived" && (
        <div className="archived-banner">
          This job has been archived. It will remain in the database but won't appear as new again.
        </div>
      )}

      {mode === "description" ? (
        <div className="detail-body">
          {baseResume && (
            <div className="base-resume-indicator">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} width={12} height={12}>
                <path d="M14 2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
                <path d="M10 2v4l-1.5-1L7 6V2" />
              </svg>
              Base resume: <span style={{ color: JOB_ROLE_COLORS[job.role] }}>{baseResume.name}</span>
            </div>
          )}
          <section className="detail-section">
            <h3 className="section-label">About the Role</h3>
            <p className="detail-description">{job.description}</p>
          </section>
          <section className="detail-section">
            <h3 className="section-label">Requirements</h3>
            <ul className="requirements-list">
              {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          </section>
          <section className="detail-section">
            <h3 className="section-label">Match Analysis</h3>
            <div className="match-analysis">
              <div className="match-score-big" style={{ color: job.matchScore >= 85 ? "#10b981" : job.matchScore >= 70 ? "#f59e0b" : "#ef4444" }}>
                {job.matchScore}%
              </div>
              <p className="match-note">Claude's analysis of how well your base resume matches this job description. Tailor your resume to improve this score.</p>
            </div>
          </section>
        </div>
      ) : (
        <div className="tailoring-panes">
          <div className="tailor-pane">
            <div className="tailor-pane-label">
              <span className="tailor-label-dot original" />
              {baseResume?.name ?? "Base Resume"}
            </div>
            <pre className="resume-text">{baseResume?.content}</pre>
          </div>
          <div className="tailor-divider" />
          <div className="tailor-pane">
            <div className="tailor-pane-label">
              <span className="tailor-label-dot tailored" />
              Tailored — {job.company}
              {tailored && (
                <div className="tailor-actions-inline">
                  <button className="btn-small">Copy</button>
                  <button className="btn-small accent">Download .docx</button>
                </div>
              )}
            </div>
            {tailoring ? (
              <div className="tailoring-loading">
                <div className="loading-pulse">
                  {[72, 58, 81, 45, 67, 90].map((w, i) => (
                    <span key={i} className="loading-bar" style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="loading-label">Claude is tailoring your resume...</p>
              </div>
            ) : tailored ? (
              <pre className="resume-text tailored-text">{tailored}</pre>
            ) : (
              <div className="tailor-empty">Click "Tailor Resume" to generate a version optimized for this role.</div>
            )}
          </div>
        </div>
      )}

      {mode === "tailoring" && (
        <button className="back-to-desc" onClick={() => setMode("description")}>
          ← Back to job description
        </button>
      )}
    </div>
  );
}

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>(FAKE_JOBS);
  const [selectedId, setSelectedId] = useState<string>(FAKE_JOBS[0].id);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [roleFilter, setRoleFilter] = useState<JobRole | "all">("all");

  const handleStatusChange = (id: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  // Default feed hides archived unless explicitly filtering for it
  const filtered = jobs.filter(j => {
    const statusMatch = statusFilter === "all"
      ? j.status !== "archived"   // hide archived from "All" tab
      : j.status === statusFilter;
    const roleMatch = roleFilter === "all" || j.role === roleFilter;
    return statusMatch && roleMatch;
  });

  const selected = jobs.find(j => j.id === selectedId) || jobs[0];
  const countByRole = (role: JobRole) => jobs.filter(j => j.role === role && (statusFilter === "all" ? j.status !== "archived" : j.status === statusFilter)).length;

  return (
    <div className="split-pane">
      <div className="pane-left">
        <div className="pane-left-header">
          <h2 className="pane-title">Job Board</h2>
          <button className="btn-refresh" title="Refresh all sources">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} width={14} height={14}>
              <path d="M1 4s1.5-3 7-3a7 7 0 1 1-5.1 2.2" />
              <polyline points="1,1 1,4 4,4" />
            </svg>
          </button>
        </div>

        {/* Row 1: Status filter */}
        <div className="filter-tabs">
          {(["all", "new", "applied", "archived"] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
              {s !== "archived" && (
                <span className="filter-count">
                  {s === "all"
                    ? jobs.filter(j => j.status !== "archived" && (roleFilter === "all" || j.role === roleFilter)).length
                    : jobs.filter(j => j.status === s && (roleFilter === "all" || j.role === roleFilter)).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Row 2: Role filter */}
        <div className="filter-tabs filter-tabs-role">
          <button className={`filter-tab ${roleFilter === "all" ? "active" : ""}`} onClick={() => setRoleFilter("all")}>
            All roles
          </button>
          {(["engineering_manager", "product_manager", "engineer"] as JobRole[]).map(role => (
            <button
              key={role}
              className={`filter-tab ${roleFilter === role ? "active" : ""}`}
              onClick={() => setRoleFilter(role)}
              style={roleFilter === role ? { color: JOB_ROLE_COLORS[role], background: JOB_ROLE_COLORS[role] + "18" } : {}}
            >
              <span className="role-dot" style={{ background: JOB_ROLE_COLORS[role] }} />
              {JOB_ROLE_SHORT[role]}
              <span className="filter-count">{countByRole(role)}</span>
            </button>
          ))}
        </div>

        <div className="job-list">
          {filtered.length === 0 ? (
            <div className="detail-empty" style={{ height: "120px" }}>No jobs match these filters</div>
          ) : (
            filtered.map(job => (
              <JobCard key={job.id} job={job} selected={job.id === selectedId} onClick={() => setSelectedId(job.id)} />
            ))
          )}
        </div>
      </div>

      <div className="pane-right">
        {selected ? <JobDetail job={selected} onStatusChange={handleStatusChange} /> : (
          <div className="detail-empty">Select a job to view details</div>
        )}
      </div>
    </div>
  );
}