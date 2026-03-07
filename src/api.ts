import { Job, JobStatus, Resume } from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error ${res.status}: ${error}`);
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────
export interface ScrapeLog {
  id: number;
  source_id: number;
  started_at: string;
  finished_at: string;
  status: "success" | "error" | "partial";
  jobs_found: number;
  jobs_added: number;
  jobs_filtered: number;
  jobs_skipped: number;
  error_message: string | null;
}

export interface RawLogsResponse {
  lines: string[];
  total: number;
  note: string;
}

// ── Jobs ─────────────────────────────────────────────────────
export const api = {
  jobs: {
    list: (params?: { status?: JobStatus | "all"; role?: string }) => {
      const query = new URLSearchParams();
      if (params?.status && params.status !== "all") query.set("status", params.status);
      if (params?.role && params.role !== "all") query.set("role", params.role);
      const qs = query.toString();
      return request<Job[]>(`/jobs${qs ? `?${qs}` : ""}`);
    },
    get: (id: number) => request<Job>(`/jobs/${id}`),
    updateStatus: (id: number, status: JobStatus) =>
      request<Job>(`/jobs/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },

  // ── Resumes ────────────────────────────────────────────────
  resumes: {
    list: () => request<Resume[]>("/resumes"),
    get: (id: number) => request<Resume>(`/resumes/${id}`),
    getForJob: (jobId: number) => request<Resume>(`/resumes/job/${jobId}`),
    update: (id: number, body: { name?: string; content?: string }) =>
      request<Resume>(`/resumes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },

  // ── Sources ────────────────────────────────────────────────
  sources: {
    list: () => request<{ id: number; company: string; url: string; active: boolean }[]>("/sources"),
  },

  // ── Scraper ───────────────────────────────────────────────
  scraper: {
    runAll: () =>
      request<{ sources_scraped: number; results: object[] }>("/scraper/run", { method: "POST" }),
    runOne: (sourceId: number) =>
      request<object>(`/scraper/run/${sourceId}`, { method: "POST" }),

    logs: (limit = 200) =>
      request<ScrapeLog[]>(`/scraper/logs?limit=${limit}`),

    rawLogs: (params?: {
      source?: string;
      level?: string;
      filter_type?: "filtered";
      limit?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.source) query.set("source", params.source);
      if (params?.level) query.set("level", params.level);
      if (params?.filter_type) query.set("filter_type", params.filter_type);
      if (params?.limit) query.set("limit", String(params.limit));
      const qs = query.toString();
      return request<RawLogsResponse>(`/scraper/logs/raw${qs ? `?${qs}` : ""}`);
    },
  },
};