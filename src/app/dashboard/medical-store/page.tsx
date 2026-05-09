"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { getSales, sellWithPrescription } from "@/lib/api/sell";
import { getPrescriptions, verifySlip } from "@/lib/api/prescription";
import { getInventory } from "@/lib/api/audit";
import DashboardNav from "@/components/DashboardNav";
import { DRUGS_MASTER } from "@/lib/constants";

const STORE_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

function PatientDetailsFallback({ searchId, initialMatch }: { searchId: string, initialMatch: any }) {
    const [patient, setPatient] = useState<any>(initialMatch);
    const [loading, setLoading] = useState<boolean>(!initialMatch);

    useEffect(() => {
        if (initialMatch || !searchId) return;
        let isMounted = true;
        setLoading(true);
        
        // Dynamically fetch the fresh master list using the Axios API client to avoid CORS & hardcoded localhost hangs
        getPrescriptions()
            .then(all => {
                const matched = all.find((p: any) => 
                    (p.prescriptionId && p.prescriptionId.toLowerCase() === searchId) || 
                    (p.slipHash && p.slipHash.toLowerCase() === searchId)
                );
                if (isMounted && matched) setPatient(matched);
                if (isMounted) setLoading(false);
            })
            .catch(() => { if (isMounted) setLoading(false); });

        return () => { isMounted = false; };
    }, [searchId, initialMatch]);

    if (loading) {
        return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-2 bg-slate-200 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-slate-200 rounded col-span-2"></div><div className="h-2 bg-slate-200 rounded col-span-1"></div></div></div></div></div>;
    }

    if (patient) {
        return (
            <>
                <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Patient Details</label>
                    <p className="font-bold text-slate-800 text-sm mt-1 pb-0.5">{patient.patientName} <span className="text-slate-400 font-semibold text-xs ml-1">({patient.age || 'N/A'} yrs {patient.gender ? `• ${patient.gender.charAt(0).toUpperCase()}` : ''})</span></p>
                    <p className="text-xs text-slate-500 font-medium">{patient.address || 'Address hidden'} • Ph: {patient.mobileNo || 'Hidden'}</p>
                </div>
                <div>
                   <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Prescribed By</label>
                   <p className="font-semibold text-xs text-slate-700 mt-1">{patient.hospitalName || 'Hospital Network'} {patient.department ? ` - ${patient.department}` : ''}</p>
                </div>
            </>
        );
    }

    // Ultimate fallback if absolutely purely orphaned
    return (
        <div>
           <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Patient Prescription Hash</label>
           <p className="font-mono text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 break-all mt-1 shadow-inner">{searchId}</p>
        </div>
    );
}

export default function MedicalStoreDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'terminal' | 'inventory' | 'history'>('terminal');
  
  const { data: salesHistory, isLoading: loadingSales } = useQuery({ queryKey: ['sales'], queryFn: getSales });
  const { data: prescriptions } = useQuery({ queryKey: ['prescriptions'], queryFn: () => getPrescriptions() });

  // Map to get inventory for all 20 drugs
  const inventoryQueries = useQueries({
    queries: DRUGS_MASTER.map(drug => ({
      queryKey: ['inventory', drug.id],
      queryFn: () => getInventory(STORE_ADDRESS, drug.id),
      staleTime: 30000,
      enabled: activeTab === 'inventory' || activeTab === 'terminal' // load anyway to calculate total
    }))
  });

  // const totalStock = inventoryQueries.reduce((acc, query) => acc + (query.data?.quantity || 0), 0);
  // const loadingInventory = inventoryQueries.some(q => q.isLoading);

  const mutation = useMutation({
    mutationFn: sellWithPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setFormData({ slipHash: "", patientName: "", quantity: "", drugId: "" });
      setCheckedP(null);
      alert("✅ Sale recorded on blockchain!");
    },
    onError: (err: any) => {
      alert("❌ Error: " + (err?.error || err?.message || "Unknown error"));
    }
  });

  const [formData, setFormData] = useState({ slipHash: "", patientName: "", quantity: "", drugId: "" });
  const [checkedP, setCheckedP] = useState<any>(null);
  const [selectedInventory, setSelectedInventory] = useState<any>(null);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);

  const handleCheck = async () => {
    if (!formData.slipHash) return;
    try {
      const data = await verifySlip(formData.slipHash);
      if (data && data.valid) {
        setCheckedP(data);
      } else {
        alert("Slip Hash not valid or prescription expired/empty.");
        setCheckedP(null);
      }
    } catch (e) {
      alert("Error checking slip: Invalid hash or server error");
      setCheckedP(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkedP) {
      alert("Please verify slip first.");
      return;
    }
    if (!formData.drugId) {
      alert("Please select a drug to dispense.");
      return;
    }

    const itemIndex = checkedP.medications.findIndex((m: any) => m.drugId.toString() === formData.drugId);
    if (itemIndex === -1) {
      alert(`The selected drug is not authorized in this prescription.`);
      return;
    }

    const requestedQuantity = Number(formData.quantity);

    // 1. Validate against Prescription Limit
    const authorizedQty = checkedP.medications[itemIndex].remainingQty;
    if (requestedQuantity > authorizedQty) {
      alert(`❌ Over Limit: Prescription only authorizes ${authorizedQty} remaining units.`);
      return;
    }

    // 2. Validate against Physical Pharmacy Inventory
    const drugMasterIndex = DRUGS_MASTER.findIndex(d => d.id.toString() === formData.drugId);
    if (drugMasterIndex !== -1) {
        const physicalStock = inventoryQueries[drugMasterIndex].data?.quantity || 0;
        if (requestedQuantity > physicalStock) {
             alert(`❌ Insufficient Stock: You only have ${physicalStock} units of this drug physically in your store. Please supply units via Dealer Terminal first.`);
             return;
        }
    }

    mutation.mutate({
      slipHash: formData.slipHash,
      patientName: formData.patientName,
      quantity: requestedQuantity,
      itemIndex: itemIndex
    });
  };

  return (
    <>
      <DashboardNav />
      <main className="pt-20 px-4 md:px-10 pb-10 max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-headline font-extrabold text-primary tracking-tight">Pharmacy Terminal</h2>
            <p className="text-on-surface-variant mt-2">Dispense medication with prescription verification.</p>
          </div>
          
          <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
             <button onClick={() => setActiveTab('terminal')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none ${activeTab === 'terminal' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>Terminal</button>
             <button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none ${activeTab === 'inventory' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>Inventory Directory</button>
             <button onClick={() => setActiveTab('history')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>Dispense History</button>
          </div>
        </div>

        {activeTab === 'terminal' && (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline font-bold text-xl text-primary">Dispense Medication</h3>
                <span className="material-symbols-outlined text-primary/40">pill</span>
              </div>
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Step 1: Prescription Check */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1 block">Patient Slip (Hash or code)</label>
                  <div className="flex gap-2">
                    <input 
                      required 
                      value={formData.slipHash} 
                      onChange={e => setFormData({...formData, slipHash: e.target.value.toUpperCase()})} 
                      className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 transition-all font-mono text-sm" 
                      placeholder="e.g. PC-A1B2 or 0xabcd..." 
                      type="text"
                    />
                    <button type="button" onClick={handleCheck} className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">Verify</button>
                  </div>
                </div>

                {/* Step 2: Form */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1 block">Patient Name (For Verification Hash)</label>
                    <input required value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Patient Name" type="text" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Drug to Dispense</label>
                        <select required value={formData.drugId} onChange={e => setFormData({...formData, drugId: e.target.value})} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-sm h-[48px]">
                          <option value="" disabled>Select</option>
                          {DRUGS_MASTER.map(drug => (
                            <option key={drug.id} value={drug.id.toString()}>{drug.id}: {drug.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Quantity</label>
                        <div className="relative">
                          <input required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all h-[48px]" placeholder="Units" type="number" min="1" />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">UNITS</div>
                        </div>
                      </div>
                  </div>
                </div>

                {/* Medical Authorization Info List */}
                {checkedP && checkedP.medications && (
                  <div className="space-y-3 bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="material-symbols-outlined text-emerald-500 text-sm">verified</span>
                       <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Authorized Prescriptions</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {checkedP.medications.map((m: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm text-sm border border-emerald-100">
                           <span className="font-bold text-slate-800">{m.name} <span className="text-xs text-slate-400 ml-2">ID: {m.drugId}</span></span>
                           <span className={`${m.remainingQty === 0 ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'} bg-slate-50 px-3 py-1 rounded-full text-xs`}>{m.remainingQty} left</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button disabled={mutation.isPending} className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6" type="submit">
                  {mutation.isPending ? "Processing Blockchain Tx..." : "Confirm & Dispense"}
                  <span className="material-symbols-outlined">local_pharmacy</span>
                </button>
              </form>
            </div>
        </div>
        )}

        {activeTab === 'history' && (
           <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 animate-in fade-in duration-500 mt-8">
               <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="font-headline font-bold text-2xl text-primary">Dispense History</h3>
                    <p className="text-sm text-slate-500 mt-1">Immutable ledger of pharmaceutical dispatches</p>
                  </div>
                  <button onClick={() => { queryClient.invalidateQueries({ queryKey: ['sales'] }); }} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors">
                     <span className="material-symbols-outlined text-[18px]">refresh</span> Reload
                  </button>
               </div>

               <div className="flex flex-col gap-4">
                  {loadingSales ? (
                    <div className="py-12 text-center text-slate-400 font-bold">Loading blockchain history...</div>
                  ) : salesHistory?.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-bold">No dispense logs found.</div>
                  ) : [...(salesHistory || [])].reverse().map((sales, i) => {
                     const drugObj = DRUGS_MASTER.find(d => d.id == sales.drugId);
                     const drugName = drugObj ? drugObj.name : 'Unknown Compound';
                     return (
                        <div key={i} onClick={() => setSelectedHistory(sales)} className="group bg-white p-5 rounded-2xl border-2 border-slate-50 hover:border-primary/20 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-primary/5 group-hover:bg-primary/10 rounded-2xl flex items-center justify-center transition-colors">
                                 <span className="material-symbols-outlined text-primary/70 group-hover:text-primary transition-colors">receipt_long</span>
                              </div>
                              <div>
                                 <h4 className="text-xl font-bold font-headline tracking-tight text-slate-800 leading-tight">{drugName}</h4>
                                 <p className="text-xs font-semibold text-slate-400 mt-0.5">Dispatched to Patient • Click to view log details</p>
                              </div>
                           </div>
                           
                           <div className="flex items-end gap-1.5 text-right">
                              <span className="text-3xl font-headline font-black text-slate-800 tracking-tighter leading-none">{sales.quantity}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 hidden sm:block">Units</span>
                           </div>
                        </div>
                     );
                  })}
               </div>
           </div>
        )}

        {activeTab === 'inventory' && (
           <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 animate-in fade-in duration-500">
               <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="font-headline font-bold text-2xl text-primary">Full Store Inventory</h3>
                    <p className="text-sm text-slate-500 mt-1">Real-time balances fetched from smart contracts</p>
                  </div>
                  <button onClick={() => { queryClient.invalidateQueries({ queryKey: ['inventory'] }); }} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors">
                     <span className="material-symbols-outlined text-[18px]">refresh</span> Reload
                  </button>
               </div>

               <div className="flex flex-col gap-4">
                  {DRUGS_MASTER.map((drug, index) => {
                     const qty = inventoryQueries[index].data?.quantity ?? 0;
                     const isLoading = inventoryQueries[index].isLoading;
                     const isLow = qty > 0 && qty < 50;
                     const isOutOfStock = qty === 0;

                     return (
                        <div key={drug.id} onClick={() => setSelectedInventory({ drug, qty })} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${isOutOfStock ? 'bg-slate-50 border-slate-100 opacity-60' : isLow ? 'bg-orange-50 border-orange-100' : 'bg-white border-slate-100 hover:border-primary/20 hover:shadow-md'}`}>
                           <div className="flex items-center gap-5">
                               <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isOutOfStock ? 'bg-slate-200' : isLow ? 'bg-orange-200 text-orange-600' : 'bg-primary/10 text-primary'}`}>
                                  <span className="material-symbols-outlined font-bold text-xl">medication</span>
                               </div>
                               <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-bold text-lg text-slate-800 leading-none">{drug.name}</h4>
                                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">ID: {drug.id}</span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${isOutOfStock ? 'bg-slate-200 text-slate-500' : isLow ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {isLoading ? '...' : isOutOfStock ? 'Empty' : isLow ? 'Low Stock' : 'In Stock'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-semibold">{drug.category} • Click for storage specs</p>
                               </div>
                           </div>
                           <div className="flex items-end gap-1.5 pt-1">
                              <span className={`text-3xl font-black tracking-tighter leading-none ${isOutOfStock ? 'text-slate-400' : isLow ? 'text-orange-500' : 'text-primary'}`}>{isLoading ? '-' : qty}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 hidden sm:block">Units</span>
                           </div>
                        </div>
                     );
                  })}
               </div>
           </div>
        )}

        {/* Dispatch History Modal */}
        {selectedHistory && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedHistory(null)}>
              <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                 <div className="p-8 pb-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                       <h3 className="font-headline font-bold text-xl text-slate-800">Dispense Record</h3>
                       <p className="text-xs text-slate-500 font-semibold mt-1">Immutable Log Detailing</p>
                    </div>
                    <button onClick={() => setSelectedHistory(null)} className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded-full transition-colors"><span className="material-symbols-outlined text-sm text-slate-600">close</span></button>
                 </div>
                 <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Drug Formulation</label>
                          <p className="font-bold text-slate-800 text-lg">{DRUGS_MASTER.find(d => d.id == selectedHistory.drugId)?.name || 'Unknown'}</p>
                       </div>
                       <div>
                          <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Total Dispensed</label>
                          <p className="font-black text-primary text-2xl leading-none">{selectedHistory.quantity} <span className="text-[10px] text-slate-500 tracking-wider">UNITS</span></p>
                       </div>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                       {(() => {
                           const searchId = selectedHistory.prescriptionId?.toLowerCase() || "";
                           const matchedP = prescriptions?.find((p: any) => 
                               (p.prescriptionId && p.prescriptionId.toLowerCase() === searchId) || 
                               (p.slipHash && p.slipHash.toLowerCase() === searchId)
                           );

                           return <PatientDetailsFallback searchId={searchId} initialMatch={matchedP} />;
                       })()}
                       
                       <div>
                          <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Blockchain Txn Source</label>
                          <p className="font-mono text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 break-all mt-1 shadow-inner">{selectedHistory.transactionHash}</p>
                       </div>
                       <div>
                          <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Ledger Datetime</label>
                          <p className="font-bold text-sm text-slate-800 mt-1">Confirmed on Node (Recent)</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Inventory Lookup Modal */}
        {selectedInventory && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedInventory(null)}>
              <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                 <div className="p-8 pb-6 border-b border-slate-100 flex justify-between items-center bg-teal-50">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl">inventory_2</span>
                       </div>
                       <div>
                          <h3 className="font-headline font-bold text-xl text-teal-900">Inventory Specs</h3>
                          <p className="text-xs text-teal-600 font-semibold mt-1">{selectedInventory.drug.name}</p>
                       </div>
                    </div>
                    <button onClick={() => setSelectedInventory(null)} className="w-8 h-8 flex items-center justify-center bg-teal-200/50 hover:bg-teal-200 rounded-full transition-colors"><span className="material-symbols-outlined text-sm text-teal-700">close</span></button>
                 </div>
                 <div className="p-8 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center bg-gradient-to-br from-slate-50 to-white">
                        <div>
                          <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Available Local Stock</h4>
                          <span className={`text-4xl font-black ${selectedInventory.qty === 0 ? 'text-slate-400' : 'text-teal-600'}`}>{selectedInventory.qty}</span>
                        </div>
                        <span className="material-symbols-outlined text-4xl text-slate-200">medication</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Drug Designation</label>
                           <p className="font-bold text-slate-700 text-sm">{selectedInventory.drug.category}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Regulator Code</label>
                           <p className="font-bold text-slate-700 text-sm">#{selectedInventory.drug.id}</p>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 mt-2">
                           <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                              <span className="text-xs font-bold text-slate-500">Storage Authorization</span>
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Active</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                              <span className="text-xs font-bold text-slate-500">Scheduled Deliveries</span>
                              <span className="text-xs font-bold text-slate-700">{selectedInventory.qty < 50 ? 'Incoming Replenishment' : 'None Req.'}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500">Last Synced Nodes</span>
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Present</span>
                           </div>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </main>
    </>
  );
}
