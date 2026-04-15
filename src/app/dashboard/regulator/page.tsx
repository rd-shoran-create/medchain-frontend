"use client";
import { useState, lazy, Suspense } from "react";
import DashboardNav from "@/components/DashboardNav";

// Lazy-load tab components so they don't block initial render
const OverviewTab = lazy(() => import("@/components/regulator/OverviewTab"));
const NetworkTab = lazy(() => import("@/components/regulator/NetworkTab"));
const TraceabilityTab = lazy(() => import("@/components/regulator/TraceabilityTab"));
const ComplianceTab = lazy(() => import("@/components/regulator/ComplianceTab"));
const RegistrationTab = lazy(() => import("@/components/regulator/RegistrationTab"));

type Tab = "overview" | "network" | "traceability" | "compliance" | "registration";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "dashboard" },
  { key: "network", label: "Network", icon: "hub" },
  { key: "traceability", label: "Traceability", icon: "account_tree" },
  { key: "compliance", label: "Compliance", icon: "policy" },
  { key: "registration", label: "Register", icon: "person_add" },
];

function TabFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-slate-400">
        <span className="material-symbols-outlined animate-spin">sync</span>
        <span className="font-semibold">Loading module...</span>
      </div>
    </div>
  );
}

export default function RegulatorDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <>
      <DashboardNav />
      <main className="pt-20 px-4 md:px-10 pb-10 max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-headline font-extrabold text-primary tracking-tight">Regulatory Command</h2>
            <p className="text-on-surface-variant mt-2">Full oversight of the pharmaceutical supply chain.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.key ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Suspense fallback={<TabFallback />}>
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "network" && <NetworkTab />}
          {activeTab === "traceability" && <TraceabilityTab />}
          {activeTab === "compliance" && <ComplianceTab />}
          {activeTab === "registration" && <RegistrationTab />}
        </Suspense>
      </main>
    </>
  );
}
