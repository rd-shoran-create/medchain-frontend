"use client";
import { useQuery } from "@tanstack/react-query";
import { getPrescriptions } from "@/lib/api/prescription";
import { getSupplyHistory } from "@/lib/api/supply";
import { getSales } from "@/lib/api/sell";
import { getAllEntities } from "@/lib/api/regulator";
import { getManufacturerHistory } from "@/lib/api/manufacturer";
import { getStores } from "@/lib/api/stores";
import { getAudit } from "@/lib/api/audit";
import { useState } from "react";

export default function OverviewTab() {
  const { data: prescriptions } = useQuery({ queryKey: ['prescriptions'], queryFn: () => getPrescriptions() });
  const { data: supplyHistory } = useQuery({ queryKey: ['supplyHistory'], queryFn: getSupplyHistory });
  const { data: salesHistory } = useQuery({ queryKey: ['sales'], queryFn: getSales });
  const { data: entities } = useQuery({ queryKey: ['allEntities'], queryFn: getAllEntities });
  const { data: mfgHistory } = useQuery({ queryKey: ['mfgHistory'], queryFn: getManufacturerHistory });
  const { data: stores } = useQuery({ queryKey: ['stores'], queryFn: getStores });

  const [auditStore, setAuditStore] = useState("");
  const { data: auditData, refetch: refetchAudit, isLoading: loadingAudit } = useQuery({
    queryKey: ['audit', auditStore],
    queryFn: () => getAudit(auditStore),
    enabled: false
  });

  const manufacturers = entities?.filter(e => e.role === "MANUFACTURER") || [];
  const dealers = entities?.filter(e => e.role === "DEALER") || [];
  const hospitals = entities?.filter(e => e.role === "HOSPITAL") || [];
  const pharmacies = entities?.filter(e => e.role === "MEDICAL_STORE") || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard icon="medication" label="Prescriptions" value={prescriptions?.length ?? "—"} />
        <KPICard icon="factory" label="Manufacturers" value={manufacturers.length} />
        <KPICard icon="local_shipping" label="Dealers" value={dealers.length} />
        <KPICard icon="store" label="Pharmacies" value={pharmacies.length} />
        <KPICard icon="receipt_long" label="Dispensed" value={salesHistory?.length ?? "—"} />
        <KPICard icon="emergency" label="Hospitals" value={hospitals.length} />
      </div>

      {/* Supply Chain Flow Summary */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-900/5">
        <h3 className="font-headline font-bold text-xl text-primary mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">hub</span>
          Supply Chain Flow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FlowCard step="1" title="Production" icon="precision_manufacturing" count={mfgHistory?.length ?? 0} subtitle="Manufacturer → Dealer" />
          <FlowCard step="2" title="Distribution" icon="local_shipping" count={supplyHistory?.length ?? 0} subtitle="Dealer → Pharmacy" />
          <FlowCard step="3" title="Prescription" icon="clinical_notes" count={prescriptions?.length ?? 0} subtitle="Hospital → Patient" />
          <FlowCard step="4" title="Dispensing" icon="medication" count={salesHistory?.length ?? 0} subtitle="Pharmacy → Patient" />
        </div>
      </div>

      {/* Store Audit */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-900/5">
        <h3 className="font-headline font-bold text-xl text-primary mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">search_insights</span>
          Pharmacy Audit
        </h3>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1 block">Select Pharmacy to Audit</label>
            <div className="flex gap-2">
              <select value={auditStore} onChange={e => setAuditStore(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-sm font-semibold">
                <option value="" disabled>Select a pharmacy</option>
                {stores?.map((s: any) => <option key={s.address} value={s.address}>{s.name}</option>)}
              </select>
              <button onClick={() => refetchAudit()} disabled={!auditStore || loadingAudit} className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                {loadingAudit ? "Auditing..." : "Run Audit"}
              </button>
            </div>
          </div>

          {auditData && (
            <div className="space-y-4 mt-6">
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-headline font-extrabold text-blue-600">{(auditData as any).totalSupplied}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Supplied</p>
                  </div>
                  <div>
                    <p className="text-2xl font-headline font-extrabold text-amber-600">{(auditData as any).totalSold}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Sold</p>
                  </div>
                  <div>
                    <p className="text-2xl font-headline font-extrabold text-emerald-600">{(auditData as any).currentInventory}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">In Stock</p>
                  </div>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl mt-4 ${(auditData as any).mismatch === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${(auditData as any).mismatch === 0 ? 'text-emerald-600' : 'text-red-600'}`} style={{"fontVariationSettings":"'FILL' 1"}}>
                      {(auditData as any).mismatch === 0 ? 'check_circle' : 'warning'}
                    </span>
                    <span className={`text-sm font-bold ${(auditData as any).mismatch === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {(auditData as any).mismatch === 0 ? 'No Discrepancies Found' : 'MISMATCH DETECTED'}
                    </span>
                  </div>
                  <span className={`text-xl font-headline font-black ${(auditData as any).mismatch === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(auditData as any).mismatch}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col justify-between h-32 hover:border-primary/20 hover:shadow-lg transition-all">
      <span className="material-symbols-outlined text-primary/50">{icon}</span>
      <div>
        <p className="text-2xl font-headline font-extrabold text-primary">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function FlowCard({ step, title, icon, count, subtitle }: { step: string; title: string; icon: string; count: number; subtitle: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
      <div className="absolute top-3 right-4 text-6xl font-headline font-black text-primary/5">{step}</div>
      <span className="material-symbols-outlined text-primary mb-3">{icon}</span>
      <p className="font-bold text-sm text-slate-800">{title}</p>
      <p className="text-2xl font-headline font-extrabold text-primary mt-1">{count}</p>
      <p className="text-[10px] text-slate-400 font-bold mt-1">{subtitle}</p>
    </div>
  );
}
