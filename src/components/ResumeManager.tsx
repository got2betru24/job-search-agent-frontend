import { useState } from "react";
import { FAKE_RESUMES, FAKE_JOBS } from "../data/fakeData";
import { Resume } from "../types";

export default function ResumeManager() {
  const [resumes] = useState<Resume[]>(FAKE_RESUMES);
  const [selected, setSelected] = useState<Resume>(FAKE_RESUMES[0]);

  return (
    <div className="split-pane">
      <div className="pane-left">
        <div className="pane-left-header">
          <h2 className="pane-title">Resumes</h2>
          <button className="btn-refresh" title="Upload new base resume">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} width={14} height={14}>
              <path d="M8 2v8M5 5l3-3 3 3" />
              <path d="M2 12h12" />
            </svg>
          </button>
        </div>
        <div className="job-list">
          {resumes.map(r => {
            const job = r.forJob ? FAKE_JOBS.find(j => j.id === r.forJob) : null;
            return (
              <button
                key={r.id}
                className={`job-card ${selected.id === r.id ? "selected" : ""}`}
                onClick={() => setSelected(r)}
              >
                <div className="job-card-header">
                  <div className="job-card-titles">
                    <span className="job-title">{r.name}</span>
                    {job && <span className="job-company">{job.company}</span>}
                  </div>
                  {r.isBase && (
                    <span className="status-badge" style={{ color: "#3b9eff", borderColor: "#3b9eff44", background: "#3b9eff18" }}>
                      Base
                    </span>
                  )}
                </div>
                <div className="job-card-meta">
                  <span className="meta-tag">
                    Modified {new Date(r.lastModified).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="pane-right">
        <div className="job-detail">
          <div className="detail-header">
            <div className="detail-title-block">
              <h1 className="detail-job-title">{selected.name}</h1>
              <div className="detail-meta-row">
                <span className="detail-company">
                  Last modified {new Date(selected.lastModified).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn-small accent">Download .docx</button>
              <button className="btn-small">Copy Text</button>
            </div>
          </div>
          <div className="detail-body">
            <pre className="resume-text">{selected.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
