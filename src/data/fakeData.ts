import { Job, Resume } from "../types";

export const FAKE_JOBS: Job[] = [
  {
    id: "1",
    title: "Senior Backend Engineer",
    company: "Stripe",
    location: "Remote (US)",
    role: "engineer",
    type: "Full-time",
    sourceUrl: "https://stripe.com/jobs",
    companyTag: "stripe.com",
    dateFound: "2026-02-25",
    status: "new",
    matchScore: 91,
    salary: "$180k–$220k",
    description: `We're looking for a Senior Backend Engineer to join our Payments Infrastructure team. You'll design and build the systems that process millions of transactions per day with extreme reliability and low latency.\n\nYou'll work closely with product engineers and partner teams to architect solutions that scale globally, and help define engineering best practices across the organization.`,
    requirements: [
      "5+ years backend engineering experience",
      "Strong proficiency in Python, Go, or Java",
      "Experience designing distributed systems at scale",
      "Familiarity with financial systems or payments a plus",
      "Track record of owning large, complex technical projects",
    ],
  },
  {
    id: "2",
    title: "Staff Software Engineer – Platform",
    company: "Linear",
    location: "Remote",
    role: "engineer",
    type: "Full-time",
    sourceUrl: "https://linear.app/careers",
    companyTag: "linear.app",
    dateFound: "2026-02-24",
    status: "saved",
    matchScore: 87,
    salary: "$200k–$240k",
    description: `Linear is building the system for modern software development. As a Staff Engineer on Platform, you'll own the infrastructure that powers the entire product — from our real-time sync engine to our API layer and data pipelines.\n\nWe're a small, high-output team. Everyone here has broad impact. You'll work directly with the founders and have significant say in technical direction.`,
    requirements: [
      "8+ years of software engineering",
      "Deep experience with TypeScript/Node.js or similar",
      "Experience with real-time systems (WebSockets, CRDTs, etc.)",
      "Strong opinions on developer tooling and DX",
      "Comfortable working in a small, fast-moving team",
    ],
  },
  {
    id: "3",
    title: "Principal Engineer – AI Infrastructure",
    company: "Cohere",
    location: "Toronto / Remote",
    role: "engineer",
    type: "Full-time",
    sourceUrl: "https://cohere.com/careers",
    companyTag: "cohere.com",
    dateFound: "2026-02-23",
    status: "applied",
    matchScore: 78,
    salary: "$220k–$260k",
    description: `Cohere is making language AI accessible to every developer and enterprise. As Principal Engineer on AI Infrastructure, you'll design and operate the training and serving infrastructure that powers our frontier models.\n\nThis is a deeply technical role at the intersection of ML systems, distributed computing, and cloud infrastructure.`,
    requirements: [
      "10+ years engineering, 3+ in ML infrastructure",
      "Experience with large-scale distributed training (FSDP, Megatron, etc.)",
      "Strong Python and systems programming background",
      "Familiarity with Kubernetes and cloud infrastructure (AWS/GCP/Azure)",
      "Experience working with GPU clusters at scale",
    ],
  },
  {
    id: "4",
    title: "Engineering Manager – Backend",
    company: "Vercel",
    location: "Remote",
    role: "engineering_manager",
    type: "Full-time",
    sourceUrl: "https://vercel.com/careers",
    companyTag: "vercel.com",
    dateFound: "2026-02-22",
    status: "interviewing",
    matchScore: 83,
    salary: "$190k–$230k",
    description: `We're hiring an Engineering Manager for our Edge Network team. You'll lead a team of 6–8 engineers building the infrastructure that serves millions of deploys and billions of requests globally.\n\nYou'll be responsible for team health, roadmap execution, hiring, and technical quality — while staying close enough to the code to make good architectural calls.`,
    requirements: [
      "3+ years engineering management",
      "Strong technical foundation in backend/infrastructure",
      "Experience managing distributed, remote-first teams",
      "Track record of shipping large infrastructure projects",
      "Excellent communication and stakeholder management",
    ],
  },
  {
    id: "5",
    title: "Engineering Manager – Data Platform",
    company: "dbt Labs",
    location: "Remote (US/Canada)",
    role: "engineering_manager",
    type: "Full-time",
    sourceUrl: "https://www.getdbt.com/careers",
    companyTag: "getdbt.com",
    dateFound: "2026-02-21",
    status: "new",
    matchScore: 72,
    salary: "$160k–$195k",
    description: `dbt Labs builds the tooling that data teams rely on to transform and model their data. As Engineering Manager of the Data Platform team, you'll lead a group of engineers building features used by hundreds of thousands of analysts and engineers every day.`,
    requirements: [
      "3+ years engineering management",
      "Strong technical background in data infrastructure",
      "Experience with data warehouses (Snowflake, BigQuery, Redshift)",
      "Familiarity with SQL and data modeling concepts",
      "Track record of growing and retaining engineering talent",
    ],
  },
  {
    id: "6",
    title: "Product Manager – Developer Platform",
    company: "Fly.io",
    location: "Remote",
    role: "product_manager",
    type: "Full-time",
    sourceUrl: "https://fly.io/jobs",
    companyTag: "fly.io",
    dateFound: "2026-02-20",
    status: "saved",
    matchScore: 65,
    salary: "$150k–$185k",
    description: `Fly.io is a platform for running full-stack apps and databases close to users around the world. You'll own the product roadmap for our developer-facing platform — working closely with engineering and customers to decide what we build and why.\n\nWe're a small team that ships fast. You'll have a lot of autonomy.`,
    requirements: [
      "3+ years product management at a developer tools company",
      "Deep empathy for developers as users",
      "Ability to go deep on technical tradeoffs",
      "Strong written communication — we're async-first",
      "Experience working with infrastructure or platform products",
    ],
  },
];

export const FAKE_RESUME_ENGINEER = `JOHN DEVELOPER — ENGINEER
john@example.com | github.com/johndeveloper | Salt Lake City, UT

SUMMARY
Senior software engineer with 8+ years building scalable backend systems and distributed infrastructure. Strong background in Python, TypeScript, and cloud-native architectures.

EXPERIENCE

Senior Software Engineer — Acme Corp (2021–Present)
• Led architecture of event-driven data pipeline processing 50M+ events/day
• Reduced API p99 latency from 800ms to 120ms through query optimization and caching
• Stack: Python, FastAPI, PostgreSQL, Kafka, Redis, AWS

Software Engineer — TechStartup Inc (2018–2021)
• Built and scaled core billing service from 0 to 200k users
• Designed multi-tenant architecture supporting enterprise clients
• Stack: Node.js, TypeScript, MySQL, Docker, GCP

SKILLS
Python, TypeScript, Go, FastAPI, React, Docker, Kubernetes, AWS, GCP, PostgreSQL, MySQL, Redis`;

export const FAKE_RESUME_EM = `JOHN DEVELOPER — ENGINEERING MANAGER
john@example.com | linkedin.com/in/johndeveloper | Salt Lake City, UT

SUMMARY
Engineering leader with 8+ years of software engineering and 3+ years managing high-performing teams. Track record of scaling teams, shipping complex infrastructure, and building engineering culture.

EXPERIENCE

Senior Software Engineer / Tech Lead — Acme Corp (2021–Present)
• Led cross-functional team of 5 engineers delivering data platform initiative
• Established engineering standards, code review practices, and on-call processes
• Mentored 4 junior engineers; 2 promoted within 18 months

Software Engineer — TechStartup Inc (2018–2021)
• Owned backend infrastructure migration from monolith to microservices
• Coordinated across 3 teams to deliver zero-downtime migration

LEADERSHIP SKILLS
Team building, hiring, performance management, roadmap planning, stakeholder communication`;

export const FAKE_RESUME_PM = `JOHN DEVELOPER — PRODUCT MANAGER
john@example.com | linkedin.com/in/johndeveloper | Salt Lake City, UT

SUMMARY
Technical product manager with engineering background. Experienced translating complex technical constraints into clear product strategy, working closely with engineering and design to ship developer-facing products.

EXPERIENCE

Senior Software Engineer / Product Lead — Acme Corp (2021–Present)
• Drove roadmap for internal developer platform used by 200+ engineers
• Defined and prioritized features through customer interviews and usage data
• Partnered with design to ship 3 major product initiatives

Software Engineer — TechStartup Inc (2018–2021)
• Acted as technical liaison between product and engineering teams
• Contributed to product specs and wrote detailed technical requirements

SKILLS
Roadmap planning, user research, technical writing, cross-functional collaboration, data analysis`;

export const FAKE_RESUMES: Resume[] = [
  {
    id: "base-em",
    name: "Base Resume — Eng Manager",
    lastModified: "2026-02-01",
    isBase: true,
    baseForRole: "engineering_manager",
    content: FAKE_RESUME_EM,
  },
  {
    id: "base-eng",
    name: "Base Resume — Engineer",
    lastModified: "2026-02-01",
    isBase: true,
    baseForRole: "engineer",
    content: FAKE_RESUME_ENGINEER,
  },
  {
    id: "base-pm",
    name: "Base Resume — Product",
    lastModified: "2026-02-01",
    isBase: true,
    baseForRole: "product_manager",
    content: FAKE_RESUME_PM,
  },
  {
    id: "r1",
    name: "Tailored — Vercel EM",
    lastModified: "2026-02-22",
    isBase: false,
    forJob: "4",
    content: FAKE_RESUME_EM + "\n\n[TAILORED VERSION — Vercel Engineering Manager]",
  },
  {
    id: "r2",
    name: "Tailored — Stripe Backend",
    lastModified: "2026-02-25",
    isBase: false,
    forJob: "1",
    content: FAKE_RESUME_ENGINEER + "\n\n[TAILORED VERSION — Stripe Senior Backend Engineer]",
  },
];