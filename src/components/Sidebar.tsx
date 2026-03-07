import { View } from "../App";

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="12.01" />
    <path d="M2 12h20" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const LogsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h4l3-9 4 18 3-9h4" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
  </svg>
);

const NAV_ITEMS = [
  { view: "board"  as View, Icon: BriefcaseIcon, label: "Job Board" },
  { view: "resume" as View, Icon: FileIcon,      label: "Resumes"   },
  { view: "logs"   as View, Icon: LogsIcon,      label: "Scraper Logs" },
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <span>J</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ view, Icon, label }) => (
          <button
            key={view}
            className={`sidebar-btn ${activeView === view ? "active" : ""}`}
            onClick={() => onViewChange(view)}
            title={label}
          >
            <Icon />
            <span className="sidebar-tooltip">{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="sidebar-btn" title="Settings">
          <SettingsIcon />
          <span className="sidebar-tooltip">Settings</span>
        </button>
      </div>
    </aside>
  );
}