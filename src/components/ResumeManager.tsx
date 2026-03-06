import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { Resume } from "../types";
import { JOB_ROLE_COLORS } from "../types";

export default function ResumeManager() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: resumes = [], isLoading, isError } = useQuery({
    queryKey: ["resumes"],
    queryFn: api.resumes.list,
  });

  const selected = resumes.find(r => r.id === selectedId) ?? resumes[0] ?? null;

  if (isLoading) return <div className="detail-empty">Loading resumes...</div>;
  if (isError)   return <div className="detail-empty">Failed to load resumes.</div>;

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
          {resumes.map(r => (
            <button
              key={r.id}
              className={`job-card ${selected?.id === r.id ? "selected" : ""}`}
              onClick={() => setSelectedId(r.id)}
            >
              <div className="job-card-header">
                <div className="job-card-titles">
                  <span className="job-title">{r.name}</span>
                  <span className="job-company" style={{ color: JOB_ROLE_COLORS[r.role] }}>
                    {r.role.replace(/_/g, " ")}
                  </span>
                </div>
                {r.is_base && (
                  <span className="status-badge" style={{ color: "#3b9eff", borderColor: "#3b9eff44", background: "#3b9eff18" }}>
                    Base
                  </span>
                )}
              </div>
              <div className="job-card-meta">
                <span className="meta-tag">
                  Modified {new Date(r.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pane-right">
        {selected ? (
          <div className="job-detail">
            <div className="detail-header">
              <div className="detail-title-block">
                <h1 className="detail-job-title">{selected.name}</h1>
                <div className="detail-meta-row">
                  <span className="detail-company">
                    Last modified {new Date(selected.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
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
        ) : (
          <div className="detail-empty">Select a resume to preview</div>
        )}
      </div>
    </div>
  );
}