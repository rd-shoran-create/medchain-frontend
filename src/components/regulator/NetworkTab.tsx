"use client";
import { useQuery } from "@tanstack/react-query";
import { getAllEntities } from "@/lib/api/regulator";
import { useState } from "react";

const ROLE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  HOSPITAL: { label: "Hospital", icon: "emergency", color: "text-red-600 bg-red-50 border-red-100" },
  MANUFACTURER: { label: "Manufacturer", icon: "factory", color: "text-violet-600 bg-violet-50 border-violet-100" },
  DEALER: { label: "Dealer", icon: "local_shipping", color: "text-blue-600 bg-blue-50 border-blue-100" },
  MEDICAL_STORE: { label: "Pharmacy", icon: "medication", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  REGULATOR: { label: "Regulator", icon: "gavel", color: "text-amber-600 bg-amber-50 border-amber-100" }
};

export default function NetworkTab() {
  const { data: entities, isLoading } = useQuery({ queryKey: ['allEntities'], queryFn: getAllEntities });
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = (entities || []).filter(e => {
    const matchesRole = filterRole === "ALL" || e.role === filterRole;
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const roleCounts = (entities || []).reduce((acc: Record<string, number>, e) => {
    acc[e.role] = (acc[e.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Role Filter Chips */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setFilterRole("ALL")} className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${filterRole === "ALL" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
          All ({entities?.length ?? 0})
        </button>
        {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilterRole(key)} className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${filterRole === key ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            <span className="material-symbols-outlined text-[16px]">{cfg.icon}</span>
            {cfg.label} ({roleCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input
          type="text"
          placeholder="Search by name or blockchain address..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm font-semibold shadow-inner transition-all"
        />
      </div>

      {/* Entity Table */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-900/5">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-headline font-bold text-primary">Authorized Network Nodes</h3>
          <span className="text-xs font-bold text-primary uppercase tracking-widest">{filtered.length} nodes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Entity Name</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Blockchain Address</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400 font-medium">Loading entities from blockchain...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400 font-medium">No entities found.</td></tr>
              ) : filtered.map((entity, i) => {
                const cfg = ROLE_CONFIG[entity.role] || { label: entity.role, icon: "help", color: "text-slate-600 bg-slate-50 border-slate-100" };
                return (
                  <tr key={i} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.color}`}>
                          <span className="material-symbols-outlined text-lg">{cfg.icon}</span>
                        </div>
                        <span className="font-bold text-sm text-slate-800">{entity.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">{entity.address}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
