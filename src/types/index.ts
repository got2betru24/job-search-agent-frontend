export type JobStatus = "new" | "saved" | "applied" | "archived";

export type JobRole = "engineering_manager" | "product_manager" | "engineer";

export const JOB_ROLE_LABELS: Record<JobRole, string> = {
  engineering_manager: "Eng Manager",
  product_manager: "Product",
  engineer: "Engineer",
};

export const JOB_ROLE_SHORT: Record<JobRole, string> = {
  engineering_manager: "EM",
  product_manager: "PM",
  engineer: "ENG",
};

export const JOB_ROLE_COLORS: Record<JobRole, string> = {
  engineering_manager: "#f97316",
  product_manager: "#a78bfa",
  engineer: "#3b9eff",
};

// Matches the API response shape (snake_case from DB)
export interface Job {
  id:             number;
  source_id:      number;
  title:          string;
  job_url:        string;
  company:        string | null;
  location:       string | null;
  job_type:       string | null;
  salary:         string | null;
  description:    string | null;
  requirements:   string[] | null;
  role:           JobRole | null;
  match_score:    number | null;
  status:         JobStatus;
  scrape_status:  "pending" | "scraped" | "failed";
  found_at:       string;
  scraped_at:     string | null;
  updated_at:     string;
}

// Matches the API response shape
export interface Resume {
  id:           number;
  name:         string;
  content:      string;
  role:         JobRole;
  is_base:      boolean;
  job_id:       number | null;
  created_at:   string;
  updated_at:   string;
}