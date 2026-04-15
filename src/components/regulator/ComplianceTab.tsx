"use client";
import { useState } from "react";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllEntities, setManufacturerLimit } from "@/lib/api/regulator";
import { getManufacturerLimits } from "@/lib/api/manufacturer";
import { DRUGS_MASTER } from "@/lib/constants";

export default function ComplianceTab() {
  const queryClient = useQueryClient();
  const { data: entities } = useQuery({ queryKey: ['allEntities'], queryFn: getAllEntities });

  const manufacturers = (entities || []).filter(e => e.role === "MANUFACTURER");
  const [selectedMfg, setSelectedMfg] = useState("");
  const [editingDrug, setEditingDrug] = useState<number | null>(null);
  const [newLimit, setNewLimit] = useState("");

  // Query limits for all drugs for the selected manufacturer
  const limitQueries = useQueries({
    queries: DRUGS_MASTER.map(drug => ({
      queryKey: ['mfgLimit', selectedMfg, drug.id],
      queryFn: () => getManufacturerLimits(selectedMfg, drug.id),
      staleTime: 30000,
      enabled: !!selectedMfg
    }))
  });

  const mutation = useMutation({
    mutationFn: setManufacturerLimit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mfgLimit'] });
      setEditingDrug(null);
      setNewLimit("");
      alert("✅ Manufacturing limit updated on blockchain!");
    },
    onError: (err: any) => {
      alert("❌ Error: " + (err?.error || err?.message || "Unknown error"));
    }
  });

  const handleUpdateLimit = (drugId: number) => {
    if (!selectedMfg || !newLimit) return;
    mutation.mutate({
      manufacturerAddress: selectedMfg,
      drugId,
      maxAmount: Number(newLimit)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Manufacturer Selector */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-900/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600">policy</span>
          </div>
          <div>
            <h3 className="text-xl font-bold font-headline tracking-tight text-slate-800">Manufacturing Compliance</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Set and monitor drug production limits per manufacturer</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Select Manufacturer</label>
          <select
            value={selectedMfg}
            onChange={e => { setSelectedMfg(e.target.value); setEditingDrug(null); }}
            className="w-full md:w-96 h-14 px-4 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-xl transition-all text-sm font-semibold shadow-inner cursor-pointer"
          >
            <option value="" disabled>Choose a manufacturer...</option>
            {manufacturers.map(m => <option key={m.address} value={m.address}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {/* Limits Table */}
      {selectedMfg && (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-900/5">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-headline font-bold text-primary">Production Limits</h3>
              <p className="text-xs text-slate-500 mt-1">
                Manufacturer: <span className="font-bold text-slate-700">{manufacturers.find(m => m.address === selectedMfg)?.name}</span>
              </p>
            </div>
            <button onClick={() => { queryClient.invalidateQueries({ queryKey: ['mfgLimit'] }); }} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
              <span className="material-symbols-outlined text-[18px]">refresh</span> Reload
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {DRUGS_MASTER.map((drug, i) => {
              const lq = limitQueries[i];
              const limit = lq?.data?.limit ?? 0;
              const minted = lq?.data?.minted ?? 0;
              const remaining = limit - minted;
              const pct = limit > 0 ? (minted / limit) * 100 : 0;
              const isLoading = lq?.isLoading;
              const isEditing = editingDrug === drug.id;

              return (
                <div key={drug.id} className="px-6 py-4 hover:bg-indigo-50/10 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-primary">{drug.id}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800">{drug.name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{drug.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      {isLoading ? (
                        <div className="animate-pulse h-5 w-24 bg-slate-100 rounded"></div>
                      ) : (
                        <>
                          <div className="hidden md:block w-40">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${pct}%` }}></div>
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold mt-1">{minted.toLocaleString()} / {limit.toLocaleString()} minted</p>
                          </div>
                          <div className="text-right w-20">
                            <p className="font-black text-lg text-primary leading-none">{remaining.toLocaleString()}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Remaining</p>
                          </div>
                        </>
                      )}

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={newLimit}
                            onChange={e => setNewLimit(e.target.value)}
                            placeholder="New limit"
                            className="w-28 h-10 px-3 bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-xl text-sm font-semibold"
                            min="0"
                          />
                          <button onClick={() => handleUpdateLimit(drug.id)} disabled={mutation.isPending} className="bg-primary text-white px-4 h-10 rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50">
                            {mutation.isPending ? "..." : "Set"}
                          </button>
                          <button onClick={() => { setEditingDrug(null); setNewLimit(""); }} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingDrug(drug.id); setNewLimit(String(limit)); }} className="text-slate-400 hover:text-primary transition-colors" title="Edit Limit">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!selectedMfg && (
        <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl shadow-slate-900/5">
          <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">factory</span>
          <p className="text-slate-400 font-medium">Select a manufacturer above to view and manage production limits.</p>
        </div>
      )}
    </div>
  );
}
