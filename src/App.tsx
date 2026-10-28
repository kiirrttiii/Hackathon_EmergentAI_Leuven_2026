import { useState } from "react";
import { SearchPanel } from "./components/SearchPanel";
import { QAPanel } from "./components/QAPanel";

type Tab = "search" | "qa";

export default function App() {
  const [tab, setTab] = useState<Tab>("search");

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-900 leading-tight">
                NGO Knowledge Assistant
              </h1>
              <p className="text-xs text-neutral-500 leading-tight">
                Source-grounded document search
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 flex gap-1">
          <TabButton active={tab === "search"} onClick={() => setTab("search")}>
            Search
          </TabButton>
          <TabButton active={tab === "qa"} onClick={() => setTab("qa")}>
            Question Answering
          </TabButton>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === "search" ? <SearchPanel /> : <QAPanel />}
      </main>

      <footer className="max-w-4xl mx-auto px-4 pb-8 text-center">
        <p className="text-xs text-neutral-400">
          Prototype for D4GC hackathon. Answers are grounded in indexed documents
          only. Verify critical information against the original source.
        </p>
      </footer>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
        active
          ? "border-primary-600 text-primary-700"
          : "border-transparent text-neutral-500 hover:text-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}
