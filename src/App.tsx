import { useState } from "react";
import Sidebar from "./components/Sidebar";
import JobBoard from "./components/JobBoard";
// import AppTracker from "./components/AppTracker";
import ResumeManager from "./components/ResumeManager";
import ScraperLogs from "./components/ScraperLogs";
import "./App.css";

export type View = "board" | "resume" | "logs";
// export type View = "board" | "tracker" | "resume" | "logs";

export default function App() {
  const [activeView, setActiveView] = useState<View>("board");
  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="main-content">
        {activeView === "board" && <JobBoard />}
        {/* {activeView === "tracker" && <AppTracker />} */}
        {activeView === "resume" && <ResumeManager />}
        {activeView === "logs" && <ScraperLogs />}
      </main>
    </div>
  );
}