"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { getSupplyHistory, recordSupply } from "@/lib/api/supply";
import { getStores } from "@/lib/api/stores";
import { getDealerInventory } from "@/lib/api/manufacturer";
import DashboardNav from "@/components/DashboardNav";
import { DRUGS_MASTER } from "@/lib/constants";

const DEALER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export default function DealerDashboard() {
  const queryClient = useQueryClient();
  const { data: stores } = useQuery({ queryKey: ['stores'], queryFn: getStores });
  const { data: supplyHistory, isLoading } = useQuery({ queryKey: ['supplyHistory'], queryFn: getSupplyHistory });

  const [activeTab, setActiveTab] = useState<'terminal' | 'inventory' | 'history'>('terminal');

  // Dealer inventory for all 20 drugs
  const inventoryQueries = useQueries({
    queries: DRUGS_MASTER.map(drug => ({
      queryKey: ['dealerInventory', drug.id],
      queryFn: () => getDealerInventory(DEALER_ADDRESS, drug.id),
      staleTime: 30000,
      enabled: activeTab === 'inventory' || activeTab === 'terminal'
    }))
  });

  const totalStock = inventoryQueries.reduce((acc, query) => acc + (query.data?.quantity || 0), 0);

  const mutation = useMutation({
    mutationFn: recordSupply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplyHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dealerInventory'] });
      setFormData({ storeAddress: "", drugId: "", quantity: "" });
      alert("✅ Supply recorded on blockchain!");
    },
    onError: (err: any) => {
      alert("❌ Error: " + (err?.error || err?.message || "Unknown error"));
    }
  });

  const [formData, setFormData] = useState({ storeAddress: "", drugId: "", quantity: "" });

  const [drugSearch, setDrugSearch] = useState("");
  const [showDrugSearch, setShowDrugSearch] = useState(false);

  const filteredDrugs = DRUGS_MASTER.filter(d =>
     d.name.toLowerCase().includes(drugSearch.toLowerCase()) ||
     d.id.toString().includes(drugSearch)
  );
  const selectedDrugObj = DRUGS_MASTER.find(d => d.id.toString() === formData.drugId);

  // Show dealer's current stock for selected drug
  const selectedDrugStock = formData.drugId ? inventoryQueries[parseInt(formData.drugId) - 1]?.data?.quantity ?? 0 : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.drugId) {
      alert("Please select a drug formulation from the dropdown before confirming dispatch.");
      return;
    }
    mutation.mutate({
      storeAddress: formData.storeAddress,
      drugId: Number(formData.drugId),
      quantity: Number(formData.quantity)
    });
  };

  return (
    <>
      <DashboardNav />
      <main className="pt-20 px-4 md:px-10 pb-10 max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-headline font-extrabold text-primary tracking-tight">Supply Terminal</h2>
            <p className="text-on-surface-variant mt-2">Record drug supply to registered medical stores.</p>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
             <button onClick={() => setActiveTab('terminal')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none ${activeTab === 'terminal' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>Terminal</button>
             <button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none ${activeTab === 'inventory' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>Inventory</button>
             <button onClick={() => setActiveTab('history')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>Supply History</button>
          </div>
        </div>

        {/* ===== TERMINAL TAB ===== */}
        {activeTab === 'terminal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Supply Form */}
          <section className="lg:col-span-7">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary">local_shipping</span>
                </div>
                <div>
                   <h3 className="text-xl font-bold font-headline tracking-tight text-slate-800">Dispatch Units</h3>
                   <p className="text-xs text-slate-500 font-semibold mt-0.5">Record secure blockchain transfer</p>
                </div>
              </div>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Medical Store Recipient</label>
                  <select required value={formData.storeAddress} onChange={e => setFormData({...formData, storeAddress: e.target.value})} className="w-full h-14 px-4 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-xl transition-all text-sm font-semibold shadow-inner cursor-pointer">
                    <option value="" disabled>Select Store Destination</option>
                    {stores?.map((s: any) => <option key={s.address} value={s.address}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2 relative">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Drug Authorization</label>
                    <div className="relative">
                      <input
                         type="text"
                         placeholder="Search by ID or formulation..."
                         value={showDrugSearch ? drugSearch : (selectedDrugObj ? `${selectedDrugObj.id}: ${selectedDrugObj.name}` : "")}
                         onChange={(e) => {
                            setDrugSearch(e.target.value);
                            setShowDrugSearch(true);
                            if (formData.drugId) setFormData({...formData, drugId: ""});
                         }}
                         onFocus={() => setShowDrugSearch(true)}
                         className="w-full h-14 px-4 pr-10 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-xl transition-all text-sm font-semibold shadow-inner cursor-text"
                      />
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform duration-200" style={{ transform: showDrugSearch ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)' }}>
                        expand_more
                      </span>

                      {showDrugSearch && (
                         <>
                           <div className="fixed inset-0 z-40" onClick={() => { setShowDrugSearch(false); setDrugSearch(""); }}></div>
                           <div className="absolute z-50 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-indigo-900/15 max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="p-2 space-y-1">
                                 {filteredDrugs.length === 0 ? (
                                     <p className="text-xs text-slate-400 p-4 text-center">No formulation found.</p>
                                 ) : filteredDrugs.map(drug => (
                                    <button
                                      type="button"
                                      key={drug.id}
                                      className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 focus:bg-primary/5 rounded-xl transition-all flex justify-between items-center group"
                                      onClick={() => {
                                         setFormData({...formData, drugId: drug.id.toString()});
                                         setDrugSearch("");
                                         setShowDrugSearch(false);
                                      }}
                                    >
                                        <span className="font-semibold text-slate-700 group-hover:text-primary transition-colors line-clamp-1 pr-4">{drug.name}</span>
                                        <span className="text-[10px] font-bold bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-slate-500 px-2 py-1 rounded-md shrink-0 border border-slate-200 group-hover:border-primary/20">ID: {drug.id}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>
                         </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Dispatch Quantity</label>
                    <div className="relative">
                      <input required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full h-14 px-4 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-xl transition-all text-sm font-semibold shadow-inner" placeholder="Units" type="number" min="1"/>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-100/50 px-2 pl-1 py-0.5 rounded uppercase tracking-widest hidden sm:block">Units</span>
                    </div>
                  </div>
                </div>

                {/* Current stock indicator */}
                {selectedDrugStock !== null && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                       <span className="material-symbols-outlined text-blue-600 text-lg">inventory_2</span>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-blue-800">Current Holding Stock</p>
                       <p className="text-[10px] text-blue-600 mt-0.5">{selectedDrugStock.toLocaleString()} units of {selectedDrugObj?.name} available in your inventory</p>
                     </div>
                  </div>
                )}

                <div className="pt-2">
                    <button disabled={mutation.isPending} className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-2xl font-bold tracking-wide shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed" type="submit">
                      <span className="material-symbols-outlined text-xl group-hover:block transition-all">{mutation.isPending ? "sync" : "inventory_2"}</span>
                      {mutation.isPending ? "Configuring Blockchain Node..." : "Confirm Secure Dispatch"}
                    </button>
                </div>
              </form>
            </div>
          </section>

          {/* Stats */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col justify-between h-32">
                <span className="material-symbols-outlined text-primary/50">inventory_2</span>
                <div>
                  <p className="text-2xl font-headline font-extrabold text-primary">{totalStock}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Stock</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col justify-between h-32">
                <span className="material-symbols-outlined text-primary/50">local_shipping</span>
                <div>
                  <p className="text-2xl font-headline font-extrabold text-primary">{supplyHistory?.length ?? "—"}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Shipments</p>
                </div>
              </div>
            </div>

            {mutation.isSuccess && (
              <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-5 rounded-[2rem] flex items-center gap-5">
                <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 text-white">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Supply Recorded!</p>
                  <p className="text-xs text-emerald-600/80 mt-1">Transaction confirmed on blockchain</p>
                </div>
              </div>
            )}
          </aside>
        </div>
        )}

        {/* ===== INVENTORY TAB ===== */}
        {activeTab === 'inventory' && (
           <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 animate-in fade-in duration-500">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <h3 className="font-headline font-bold text-2xl text-primary">Holding Inventory</h3>
                    <p className="text-sm text-slate-500 mt-1">Stock received from manufacturers — available for distribution to pharmacies</p>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{totalStock} Total Units</span>
                      </div>
                      <button onClick={() => { queryClient.invalidateQueries({ queryKey: ['dealerInventory'] }); }} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                         <span className="material-symbols-outlined text-[18px]">refresh</span> Reload
                      </button>
                  </div>
               </div>

               <div className="space-y-3">
                  {DRUGS_MASTER.map((drug, i) => {
                    const qty = inventoryQueries[i]?.data?.quantity ?? 0;
                    const isLoadingQ = inventoryQueries[i]?.isLoading;
                    if (qty === 0 && !isLoadingQ) return null; // hide empty

                    return (
                      <div key={drug.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-primary/20 hover:shadow-lg transition-all flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                              <span className="text-[10px] font-black text-primary">{drug.id}</span>
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-800">{drug.name}</p>
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{drug.category}</p>
                            </div>
                         </div>
                         <div className="text-right">
                           {isLoadingQ ? (
                             <div className="animate-pulse h-5 w-16 bg-slate-100 rounded"></div>
                           ) : (
                             <>
                               <p className="font-black text-xl text-primary leading-none">{qty.toLocaleString()}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase">Units in stock</p>
                             </>
                           )}
                         </div>
                      </div>
                    );
                  })}
                  {inventoryQueries.every(q => !q.isLoading) && totalStock === 0 && (
                    <p className="text-center py-12 text-slate-400 font-medium">No inventory received yet. Request stock from a manufacturer.</p>
                  )}
               </div>
           </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === 'history' && (
           <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 animate-in fade-in duration-500">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <h3 className="font-headline font-bold text-2xl text-primary">Supply History</h3>
                    <p className="text-sm text-slate-500 mt-1">Immutable records of drugs dispatched to medical stores</p>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{supplyHistory?.length ?? 0} Dispatches</span>
                      </div>
                      <button onClick={() => { queryClient.invalidateQueries({ queryKey: ['supplyHistory'] }); }} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                         <span className="material-symbols-outlined text-[18px]">refresh</span> Reload
                      </button>
                  </div>
               </div>

               <div className="space-y-3">
                 {isLoading ? (
                  <p className="text-center py-12 text-slate-400 font-medium">Loading from blockchain...</p>
                ) : !supplyHistory?.length ? (
                  <p className="text-center py-12 text-slate-400 font-medium">No supply records found across the network.</p>
                ) : [...supplyHistory].reverse().map((item: any, i: number) => {
                  const storeName = stores?.find((s: any) => s.address.toLowerCase() === item.store.toLowerCase())?.name || "Unknown Store";
                  const drugName = DRUGS_MASTER.find(d => d.id === item.drugId)?.name || `Drug #${item.drugId}`;
                  const ts = item.timestamp ? new Date(item.timestamp * 1000).toLocaleString() : "Recent";

                  return (
                   <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-primary/20 hover:shadow-lg transition-all flex items-center justify-between gap-4">
                       <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-lg">store</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">{storeName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{drugName} • {ts}</p>
                          </div>
                       </div>
                       <div className="text-right shrink-0">
                         <p className="font-black text-2xl text-primary leading-none">{item.quantity}</p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Units</p>
                       </div>
                   </div>
                  );
                })}
               </div>
           </div>
        )}
      </main>
    </>
  );
}
