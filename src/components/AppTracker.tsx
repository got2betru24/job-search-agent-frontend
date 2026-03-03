import { FAKE_JOBS } from "../data/fakeData";
import { Job, JobStatus } from "../types";

const COLUMNS: { status: JobStatus; label: string; color: string }[] = [
  { status: "saved", label: "Saved", color: "#a78bfa" },
  { status: "applied", label: "Applied", color: "#f59e0b" },
  { status: "interviewing", label: "Interviewing", color: "#10b981" },
  { status: "offer", label: "Offer", color: "#34d399" },
  { status: "rejected", label: "Rejected", color: "#6b7280" },
];

function TrackerCard({ job }: { job: Job }) {
  return (
    <div className="tracker-card">
      <div className="tracker-card-title">{job.title}</div>
      <div className="tracker-card-company">{job.company}</div>
      <div className="tracker-card-footer">
        <span className="tracker-date">{new Date(job.dateFound).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <span className="tracker-match">{job.matchScore}%</span>
      </div>
    </div>
  );
}

export default function AppTracker() {
  const jobs = FAKE_JOBS;

  return (
    <div className="tracker-view">
      <div className="tracker-header">
        <h2 className="pane-title">Application Tracker</h2>
        <p className="tracker-subtitle">Drag cards to update status (drag coming soon)</p>
      </div>
      <div className="tracker-board">
        {COLUMNS.map(col => {
          const colJobs = jobs.filter(j => j.status === col.status);
          return (
            <div key={col.status} className="tracker-column">
              <div className="tracker-col-header" style={{ borderTopColor: col.color }}>
                <span className="tracker-col-label" style={{ color: col.color }}>{col.label}</span>
                <span className="tracker-col-count">{colJobs.length}</span>
              </div>
              <div className="tracker-col-body">
                {colJobs.length === 0 ? (
                  <div className="tracker-empty">No jobs here</div>
                ) : (
                  colJobs.map(job => <TrackerCard key={job.id} job={job} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
