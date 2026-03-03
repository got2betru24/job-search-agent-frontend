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
  engineer: "DEV",
};

export const JOB_ROLE_COLORS: Record<JobRole, string> = {
  engineering_manager: "#f97316",  // orange
  product_manager: "#a78bfa",      // purple
  engineer: "#3b9eff",             // blue
};

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  role: JobRole;
  type: string;
  sourceUrl: string;
  companyTag: string;
  dateFound: string;
  status: JobStatus;
  matchScore: number; // 0-100
  description: string;
  requirements: string[];
  salary?: string;
}

export interface Resume {
  id: string;
  name: string;
  lastModified: string;
  isBase: boolean;
  baseForRole?: JobRole;
  forJob?: string;
  content: string;
}