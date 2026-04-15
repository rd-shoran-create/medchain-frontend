"use client";
import { useQuery } from "@tanstack/react-query";
import { getTraceProduction, getTraceDistribution, getTraceDispense } from "@/lib/api/regulator";
import { getPrescriptions } from "@/lib/api/prescription";
import { DRUGS_MASTER } from "@/lib/constants";
import { useState } from "react";

type TraceView = "production" | "distribution" | "dispense" | "prescriptions";

export default function TraceabilityTab() {
  const [view, setView] = useState<TraceView>("production");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { data: production, isLoading: loadingProd } = useQuery({ queryKey: ['traceProduction'], queryFn: getTraceProduction });
  const { data: distribution, isLoading: loadingDist } = useQuery({ queryKey: ['traceDistribution'], queryFn: getTraceDistribution });
  const { data: dispense, isLoading: loadingDisp } = useQuery({ queryKey: ['traceDispense'], queryFn: getTraceDispense });
  const { data: prescriptions, isLoading: loadingPresc } = useQuery({ queryKey: ['prescriptions'], queryFn: () => getPrescriptions() });

  const getDrugName = (id: number) => DRUGS_MASTER.find(d => d.id === id)?.name || `Drug #${id}`;
  const formatTime = (ts: number) => ts ? new Date(ts * 1000).toLocaleString() : "Recent";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl">
        <ViewButton active={view === "production"} onClick={() => { setView("production"); setExpandedRow(null); }} icon="precision_manufacturing" label="Production" count={production?.length ?? 0} />
        <ViewButton active={view === "distribution"} onClick={() => { setView("distribution"); setExpandedRow(null); }} icon="local_shipping" label="Distribution" count={distribution?.length ?? 0} />
        <ViewButton active={view === "dispense"} onClick={() => { setView("dispense"); setExpandedRow(null); }} icon="medication" label="Dispensing" count={dispense?.length ?? 0} />
        <ViewButton active={view === "prescriptions"} onClick={() => { setView("prescriptions"); setExpandedRow(null); }} icon="clinical_notes" label="Prescriptions" count={prescriptions?.length ?? 0} />
      </div>

      {/* Production: Manufacturer -> Dealer */}
      {view === "production" && (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-900/5">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-lg font-headline font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">precision_manufacturing</span>
              Production Ledger — Manufacturer → Dealer
            </h3>
            <p className="text-xs text-slate-500 mt-1">Every unit minted and dispatched from manufacturing to distribution</p>
          </div>
          <div className="divide-y divide-slate-50">
            {loadingProd ? <LoadingRow /> : !production?.length ? <EmptyRow text="No production records found." /> :
              [...production].reverse().map((item, i) => (
                <div key={i}>
                  <div className="px-6 py-4 hover:bg-indigo-50/20 transition-colors cursor-pointer flex items-center justify-between gap-4" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-violet-600">factory</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800">{item.manufacturerName} <span className="text-slate-300 mx-1">→</span> {item.dealerName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{getDrugName(item.drugId)} • {formatTime(item.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="font-black text-xl text-primary leading-none">{item.quantity}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Units</p>
                      </div>
                      <span className={`material-symbols-outlined text-slate-300 transition-transform ${expandedRow === i ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>
                  </div>
                  {expandedRow === i && (
                    <div className="px-6 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-slate-50 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <DetailField label="Manufacturer" value={item.manufacturerName} />
                        <DetailField label="Manufacturer Address" value={item.manufacturerAddress} mono />
                        <DetailField label="Dealer" value={item.dealerName} />
                        <DetailField label="Dealer Address" value={item.dealerAddress} mono />
                        <DetailField label="Drug Formulation" value={getDrugName(item.drugId)} />
                        <DetailField label="Quantity Minted" value={`${item.quantity} units`} />
                        <DetailField label="Transaction Hash" value={item.transactionHash} mono />
                        <DetailField label="Block Number" value={String(item.blockNumber)} />
                        <DetailField label="Timestamp" value={formatTime(item.timestamp)} />
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Distribution: Dealer -> Pharmacy */}
      {view === "distribution" && (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-900/5">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-lg font-headline font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">local_shipping</span>
              Distribution Ledger — Dealer → Pharmacy
            </h3>
            <p className="text-xs text-slate-500 mt-1">Drug units dispatched from dealers to medical stores</p>
          </div>
          <div className="divide-y divide-slate-50">
            {loadingDist ? <LoadingRow /> : !distribution?.length ? <EmptyRow text="No distribution records found." /> :
              [...distribution].reverse().map((item, i) => (
                <div key={i}>
                  <div className="px-6 py-4 hover:bg-indigo-50/20 transition-colors cursor-pointer flex items-center justify-between gap-4" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-blue-600">local_shipping</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800">{item.dealerName} <span className="text-slate-300 mx-1">→</span> {item.storeName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{getDrugName(item.drugId)} • {formatTime(item.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="font-black text-xl text-primary leading-none">{item.quantity}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Units</p>
                      </div>
                      <span className={`material-symbols-outlined text-slate-300 transition-transform ${expandedRow === i ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>
                  </div>
                  {expandedRow === i && (
                    <div className="px-6 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-slate-50 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <DetailField label="Dealer" value={item.dealerName} />
                        <DetailField label="Dealer Address" value={item.dealerAddress} mono />
                        <DetailField label="Pharmacy" value={item.storeName} />
                        <DetailField label="Pharmacy Address" value={item.storeAddress} mono />
                        <DetailField label="Drug Formulation" value={getDrugName(item.drugId)} />
                        <DetailField label="Quantity Supplied" value={`${item.quantity} units`} />
                        <DetailField label="Transaction Hash" value={item.transactionHash} mono />
                        <DetailField label="Block Number" value={String(item.blockNumber)} />
                        <DetailField label="Timestamp" value={formatTime(item.timestamp)} />
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Dispense: Pharmacy -> Patient */}
      {view === "dispense" && (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-900/5">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-lg font-headline font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">medication</span>
              Dispense Ledger — Pharmacy → Patient
            </h3>
            <p className="text-xs text-slate-500 mt-1">Complete patient dispensing records with identity verification</p>
          </div>
          <div className="divide-y divide-slate-50">
            {loadingDisp ? <LoadingRow /> : !dispense?.length ? <EmptyRow text="No dispense records found." /> :
              [...dispense].reverse().map((item, i) => (
                <div key={i}>
                  <div className="px-6 py-4 hover:bg-indigo-50/20 transition-colors cursor-pointer flex items-center justify-between gap-4" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-emerald-600">person</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800">
                          {item.patient?.patientName || "Unknown Patient"} <span className="text-slate-300 mx-1">←</span> {item.storeName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">{getDrugName(item.drugId)} • {item.quantity} units • {formatTime(item.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="font-black text-xl text-primary leading-none">{item.quantity}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Units</p>
                      </div>
                      <span className={`material-symbols-outlined text-slate-300 transition-transform ${expandedRow === i ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>
                  </div>
                  {expandedRow === i && (
                    <div className="px-6 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-slate-50 rounded-2xl p-5 space-y-4 text-xs">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-200 pb-2">Patient Information</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="Patient Name" value={item.patient?.patientName || "N/A"} />
                          <DetailField label="Father's Name" value={item.patient?.fatherName || "N/A"} />
                          <DetailField label="Address" value={item.patient?.address || "N/A"} />
                          <DetailField label="Mobile Number" value={item.patient?.mobileNo || "N/A"} />
                          <DetailField label="Aadhar No." value={item.patient?.aadharNo || "N/A"} />
                          <DetailField label="Prescription Code" value={item.patient?.shortCode || "N/A"} />
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-200 pb-2 pt-2">Blockchain Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="Pharmacy" value={item.storeName} />
                          <DetailField label="Pharmacy Address" value={item.storeAddress} mono />
                          <DetailField label="Drug Formulation" value={getDrugName(item.drugId)} />
                          <DetailField label="Quantity Dispensed" value={`${item.quantity} units`} />
                          <DetailField label="Patient Hash" value={item.patientHash} mono />
                          <DetailField label="Prescription ID" value={item.prescriptionId} mono />
                          <DetailField label="Transaction Hash" value={item.transactionHash} mono />
                          <DetailField label="Block Number" value={String(item.blockNumber)} />
                          <DetailField label="Issued By (Hospital)" value={item.patient?.issuedBy || "N/A"} />
                          <DetailField label="Timestamp" value={formatTime(item.timestamp)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Prescriptions */}
      {view === "prescriptions" && (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-900/5">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-lg font-headline font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">clinical_notes</span>
              Prescription Registry
            </h3>
            <p className="text-xs text-slate-500 mt-1">All prescriptions issued by hospitals with full patient details</p>
          </div>
          <div className="divide-y divide-slate-50">
            {loadingPresc ? <LoadingRow /> : !prescriptions?.length ? <EmptyRow text="No prescriptions found." /> :
              [...prescriptions].reverse().map((p: any, i: number) => (
                <div key={i}>
                  <div className="px-6 py-4 hover:bg-indigo-50/20 transition-colors cursor-pointer flex items-center justify-between gap-4" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-amber-600">clinical_notes</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800">{p.patientName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {p.shortCode} • {p.medications?.map((m: any) => m.name).join(", ")} • {new Date(p.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.active ? 'Active' : 'Used'}
                      </span>
                      <span className={`material-symbols-outlined text-slate-300 transition-transform ${expandedRow === i ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>
                  </div>
                  {expandedRow === i && (
                    <div className="px-6 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-slate-50 rounded-2xl p-5 space-y-4 text-xs">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-200 pb-2">Patient Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="Patient Name" value={p.patientName} />
                          <DetailField label="Father's Name" value={p.fatherName} />
                          <DetailField label="Address" value={p.address} />
                          <DetailField label="Mobile No." value={p.mobileNo || "N/A"} />
                          <DetailField label="Aadhar No." value={p.aadharNo || "N/A"} />
                          <DetailField label="Patient ID" value={p.patientId || "N/A"} />
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-200 pb-2 pt-2">Prescription Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="Short Code" value={p.shortCode} />
                          <DetailField label="Prescription ID" value={p.prescriptionId || "N/A"} mono />
                          <DetailField label="Slip Hash" value={p.slipHash} mono />
                          <DetailField label="Transaction Hash" value={p.txHash || "N/A"} mono />
                          <DetailField label="Issued By (Hospital)" value={p.issuedBy || "N/A"} />
                          <DetailField label="Expiry" value={p.expiry ? new Date(p.expiry * 1000).toLocaleDateString() : "N/A"} />
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-200 pb-2 pt-2">Medications</p>
                        <div className="space-y-2">
                          {p.medications?.map((med: any, mi: number) => (
                            <div key={mi} className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-100">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-primary bg-primary/5 w-7 h-7 rounded-lg flex items-center justify-center">{med.drugId}</span>
                                <span className="font-bold text-sm text-slate-700">{med.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-sm text-primary">{med.remainingQty}</span>
                                <span className="text-slate-400 text-xs"> / {med.totalQty}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

function ViewButton({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: string; label: string; count: number }) {
  return (
    <button onClick={onClick} className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 flex-1 md:flex-none justify-center ${active ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
      <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400'}`}>{count}</span>
    </button>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">{label}</p>
      <p className={`text-sm text-slate-700 font-semibold break-all ${mono ? 'font-mono text-xs bg-white px-2 py-1 rounded-lg border border-slate-100' : ''}`}>{value}</p>
    </div>
  );
}

function LoadingRow() {
  return <div className="p-12 text-center text-slate-400 font-medium">Loading from blockchain...</div>;
}

function EmptyRow({ text }: { text: string }) {
  return <div className="p-12 text-center text-slate-400 font-medium">{text}</div>;
}
