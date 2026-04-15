"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPrescriptions, issuePrescription, getPrescriptionMetadata, getPatients, searchPatients, registerPatient } from "@/lib/api/prescription";
import DashboardNav from "@/components/DashboardNav";
import PrescriptionSlip from "@/components/PrescriptionSlip";

import { DRUGS_MASTER } from "@/lib/constants";

import { useRouter } from "next/navigation";

export default function HospitalDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hospitalRole, setHospitalRole] = useState<'reception' | 'doctor' | null>(null);
  const [hospitalId, setHospitalId] = useState<string>("");
  const [activeView, setActiveView] = useState('terminal');

  useEffect(() => {
    const role = localStorage.getItem('hospital_role') as any;
    if (role === 'reception') {
      router.push('/dashboard/reception');
    }
    setHospitalRole(role || 'doctor');
    setHospitalId(localStorage.getItem('staff_id') || '');
  }, [router]);

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => getPrescriptions(),
    refetchInterval: 5000,
  });

  const { data: patients, isLoading: isPatientsLoading } = useQuery({
    queryKey: ['patients', hospitalId],
    queryFn: () => hospitalRole === 'doctor' ? getPatients(hospitalId) : getPatients()
  });

  const [formData, setFormData] = useState({
    patientName: "", 
    fatherName: "", 
    address: "", 
    mobileNo: "", 
    aadharNo: "",
    age: "",
    gender: "",
    department: "",
    hospitalName: "",
    drugId: "", 
    quantity: "",
    patientId: ""
  });
  const [medications, setMedications] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrugDropdownOpen, setIsDrugDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [activePatient, setActivePatient] = useState<any>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const drugDropdownRef = useRef<HTMLDivElement>(null);

  const { data: patientHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['patientHistory', activePatient?.patientId || selectedPatient?.patientId],
    queryFn: () => getPrescriptions(activePatient?.patientId || selectedPatient?.patientId),
    enabled: !!(activePatient?.patientId || selectedPatient?.patientId) && hospitalRole === 'doctor',
    refetchInterval: 5000, // Poll every 5 seconds for pharmacy updates
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drugDropdownRef.current && !drugDropdownRef.current.contains(event.target as Node)) {
        setIsDrugDropdownOpen(false);
      }
    };
    if (isDrugDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDrugDropdownOpen]);

  const triggerSearch = async () => {
    const query = formData.patientId || formData.aadharNo || formData.mobileNo;
    console.log("🔍 Triggering Search for:", query);
    setSearchFeedback(null);
    
    if (!query || query.length < 3) {
        setSearchFeedback("Please enter a valid identifier (min 3 chars)");
        return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchPatients(query);
      console.log("📊 Search Results:", results);
      if (results && results.length > 0) {
        setLookupResult(results[0]);
        setSearchFeedback(null);
      } else {
        setLookupResult(null);
        setSearchFeedback("No patient record found in the ledger.");
      }
    } catch (e: any) {
      console.error("❌ Search failed", e);
      setSearchFeedback("Search failed: " + (e?.error || e?.message || "Internal Server Error"));
    } finally {
      setIsSearching(false);
    }
  };


  const filteredDirectoryPatients = patients?.filter((p: any) => 
    p.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
    p.patientId.toLowerCase().includes(directorySearch.toLowerCase()) ||
    p.mobileNo.includes(directorySearch) ||
    p.aadharNo.includes(directorySearch)
  );

  const applyLookup = () => {
    if (lookupResult) {
      if (hospitalRole === 'doctor') {
        setActivePatient(lookupResult);
        setFormData(prev => ({
            ...prev,
            patientId: lookupResult.patientId,
            patientName: lookupResult.name,
            fatherName: lookupResult.fatherName,
            address: lookupResult.address,
            aadharNo: lookupResult.aadharNo || prev.aadharNo,
            mobileNo: lookupResult.mobileNo || prev.mobileNo
        }));
      } else {
        setFormData(prev => ({
            ...prev,
            patientName: lookupResult.name,
            fatherName: lookupResult.fatherName,
            address: lookupResult.address,
            aadharNo: lookupResult.aadharNo || prev.aadharNo,
            mobileNo: lookupResult.mobileNo || prev.mobileNo
        }));
      }
      setLookupResult(null);
    }
  };

  const clearPatientSession = () => {
    setActivePatient(null);
    setLookupResult(null);
    setSearchFeedback(null);
    setFormData({
        patientName: "", fatherName: "", address: "", mobileNo: "", aadharNo: "", age: "", gender: "", department: "", hospitalName: "", drugId: "", quantity: "", patientId: ""
    });
    setMedications([]);
  };

  const filteredDrugs = DRUGS_MASTER.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id.toString() === searchTerm
  );

  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);

  const registerPatientMutation = useMutation({
    mutationFn: (data: any) => registerPatient(data),
    onSuccess: (data) => {
        console.log("✅ Registration Success:", data);
        queryClient.invalidateQueries({ queryKey: ['patients'] });
        
        setSlipData({
            patientId: data.patient.patientId,
            patientName: data.patient.name || formData.patientName,
            age: data.patient.age || formData.age,
            gender: data.patient.gender || formData.gender,
            fatherName: data.patient.fatherName || formData.fatherName,
            mobileNo: data.patient.mobileNo || formData.mobileNo,
            department: data.patient.department || formData.department,
            hospitalName: "PGIMS Rohtak", 
            token: data.patient.patientId.slice(-4),
            room: (Math.floor(Math.random() * 200) + 100).toString()
        });
        setIsSlipOpen(true);

        setFormData({ ...formData, patientName: "", fatherName: "", address: "", mobileNo: "", aadharNo: "", age: "", gender: "", department: "", hospitalName: "" });
        alert(`Successfully Registered! PID: ${data.patient.patientId}`);
    },
    onError: (err: any) => {
        console.error("❌ Registration Error:", err);
        alert("❌ Registration Failed: " + (err?.error || err?.message || "Internal Server Error"));
    }
  });

  const issueMutation = useMutation({
    mutationFn: issuePrescription,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['patientHistory'] });
      setShowSuccessCard(true);
    },
    onError: (err: any) => { alert("❌ Error: " + (err?.error || err?.message)); }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Submitting Form [Role:", hospitalRole, "]", formData);
    
    if (hospitalRole === 'reception') {
        registerPatientMutation.mutate({
            name: formData.patientName,
            fatherName: formData.fatherName,
            address: formData.address,
            mobileNo: formData.mobileNo,
            aadharNo: formData.aadharNo,
            age: formData.age,
            gender: formData.gender,
            department: formData.department,
            hospitalName: hospitalId
        });
        return;
    }

    if (medications.length === 0) {
      alert("Please add medications.");
      return;
    }
    const data = new FormData();
    data.append("patientId", activePatient?.patientId || "");
    data.append("patientName", formData.patientName);
    data.append("fatherName", formData.fatherName);
    data.append("address", formData.address);
    data.append("mobileNo", formData.mobileNo);
    data.append("aadharNo", formData.aadharNo);
    data.append("medications", JSON.stringify(medications));
    data.append("expiry", (Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)).toString());
    if (hospitalRole === 'doctor' && hospitalId) {
        data.append("issuedBy", hospitalId);
    }
    if(file) data.append("prescriptionPdf", file);
    issueMutation.mutate(data);
  };

  const addToPrescription = () => {
    const drug = DRUGS_MASTER.find(d => d.id.toString() === formData.drugId);
    if (!drug || !formData.quantity) return;
    setMedications(prev => [...prev, { ...drug, totalQty: parseInt(formData.quantity) }]);
    setFormData(prev => ({ ...prev, drugId: "", quantity: "" }));
    setSearchTerm("");
  };

  const handlePatientClick = (patient: any) => {
    setSelectedPatient(patient);
  };

  const isDoctor = hospitalRole === 'doctor';
  const isReception = hospitalRole === 'reception';

  return (
    <div className="min-h-screen bg-surface-container-low selection:bg-primary/10">
      <DashboardNav activeTab={activeView} onTabChange={setActiveView} />
      {isSlipOpen && slipData && (
        <PrescriptionSlip isOpen={isSlipOpen} onClose={() => setIsSlipOpen(false)} data={slipData} />
      )}
      
      <main className="pt-20 px-4 md:px-10 pb-10 max-w-7xl mx-auto">
        
        {activeView === 'terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* LEFT COLUMN: Clinical Workspace (Directives + Queue) */}
            {isDoctor && (
              <div className={`flex flex-col gap-6 ${!activePatient ? 'lg:col-span-2 items-center justify-center min-h-[75vh]' : 'lg:col-span-1'}`}>
                {!activePatient && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl animate-in fade-in zoom-in-95 duration-700">
                        {/* Search Card */}
                        <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5 ring-1 ring-primary/10 text-center flex flex-col justify-center transition-all hover:shadow-primary/10">
                            <div className="w-20 h-20 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20">
                                <span className="material-symbols-outlined text-[2.5rem]">person_search</span>
                            </div>
                            <h3 className="text-2xl font-headline font-black text-slate-800 mb-2">Patient Search</h3>
                            <p className="text-slate-500 text-base mb-8 font-medium">Search by Universal ID (UID), Mobile, or Aadhar</p>
                            
                            <div className="relative group space-y-6">
                                <div className="relative">
                                    <input 
                                        value={formData.patientId}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData({...formData, patientId: val});
                                            if (!val) {
                                                setLookupResult(null);
                                                setSearchFeedback(null);
                                            }
                                        }}
                                        onKeyDown={e => e.key === 'Enter' && triggerSearch()}
                                        placeholder="Enter PID, Mobile or Aadhar"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/40 focus:bg-white rounded-2xl px-8 py-5 text-lg font-headline font-black text-slate-800 transition-all shadow-inner outline-none text-center tracking-tight"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary animate-spin">
                                            <span className="material-symbols-outlined text-2xl">sync</span>
                                        </div>
                                    )}
                                </div>

                                {searchFeedback && !lookupResult && (
                                    <p className="text-xs font-black text-red-500 uppercase tracking-widest animate-pulse">
                                        {searchFeedback}
                                    </p>
                                )}

                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        triggerSearch();
                                    }}
                                    disabled={isSearching || !formData.patientId}
                                    className="w-full py-5 btn-gradient text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">search</span>
                                    {isSearching ? "Searching Ledger..." : "Find Patient Record"}
                                </button>
                            </div>
                        </div>

                        {/* Identity Card */}
                        <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5 ring-1 ring-primary/10 text-center flex flex-col justify-center transition-all min-h-[420px]">
                            {lookupResult ? (
                                <div className="p-8 bg-white border-2 border-emerald-100 rounded-[2.25rem] shadow-xl animate-in fade-in slide-in-from-top-2 border-dashed relative h-full flex flex-col justify-center">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-6 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                                        Identity Confirmed
                                    </div>
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="text-center">
                                            <h4 className="text-3xl font-black text-slate-800 leading-tight">{lookupResult.name}</h4>
                                            <div className="flex items-center justify-center gap-3 mt-3">
                                                <p className="text-xs text-primary font-black uppercase bg-primary/5 px-3 py-1 rounded-lg">UID: {lookupResult.patientId}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={applyLookup}
                                            className="w-full bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            <span className="material-symbols-outlined text-lg">clinical_notes</span>
                                            Start Clinical Session
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                    <div className="w-20 h-20 bg-slate-100 rounded-[1.5rem] flex items-center justify-center mb-6 border border-slate-200">
                                        <span className="material-symbols-outlined text-[2.5rem]">person</span>
                                    </div>
                                    <p className="text-xl font-black text-slate-800 mb-2">Patient Identity</p>
                                    <p className="text-sm font-medium text-center max-w-[200px]">Awaiting secure records search to begin session</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(isReception || (isDoctor && activePatient)) && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        {isDoctor && activePatient && (
                            <div className="bg-white ring-1 ring-slate-200 rounded-[1.25rem] p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-300 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/20">
                                        <span className="material-symbols-outlined text-lg text-primary">person</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-2 mb-0.5">
                                            <h3 className="text-lg font-black text-slate-800">{activePatient.name}</h3>
                                            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{activePatient.patientId}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">phone</span>
                                                {activePatient.mobileNo}
                                            </span>
                                            <span className="text-[9px] text-slate-300">•</span>
                                            <span className="text-xs font-bold text-slate-500 truncate max-w-[200px] flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                                {activePatient.address}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" onClick={clearPatientSession} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-red-50 transition-all border border-slate-200 hover:border-red-200">
                                    <span className="material-symbols-outlined text-[12px]">cancel</span>
                                    End Session
                                </button>
                            </div>
                        )}

                                              {isReception && (
                            <div className="flex items-center justify-center min-h-[80vh] w-full animate-in fade-in zoom-in-95 duration-500">
                                <div className="bg-white rounded-[3rem] p-12 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] ring-1 ring-slate-100 max-w-5xl w-full relative overflow-hidden border border-slate-50">
                                    <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-indigo-500 to-primary"></div>
                                    <h3 className="text-3xl font-headline font-black text-primary flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-4xl">assignment_ind</span>
                                            OPD Registration Slip
                                        </div>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-400 block px-1">Patient Name</label>
                                            <input required value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3.5 transition-all text-base font-bold shadow-inner" placeholder="Legal full name" />
                                        </div>
                                        <div className="space-y-2 lg:col-span-1">
                                            <label className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-400 block px-1">Age</label>
                                            <input required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3.5 transition-all text-base font-bold shadow-inner" placeholder="Years" type="text" inputMode="numeric" pattern="[0-9]*" />
                                        </div>
                                        <div className="space-y-2 lg:col-span-1">
                                            <label className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-400 block px-1">Gender</label>
                                            <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3.5 transition-all text-base font-bold shadow-inner text-slate-700">
                                                <option value="" disabled>Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-400 block px-1">Father / Guardian</label>
                                            <input required value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3.5 transition-all text-base font-bold shadow-inner" placeholder="Guardian's name" />
                                        </div>
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-400 block px-1">Department</label>
                                            <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3.5 transition-all text-base font-bold shadow-inner text-slate-700">
                                                <option value="" disabled>Select Department</option>
                                                <option value="General Medicine">General Medicine</option>
                                                <option value="Neurology">Neurology</option>
                                                <option value="Mental Health / Psychiatry">Mental Health / Psychiatry</option>
                                                <option value="Orthopedics">Orthopedics</option>
                                                <option value="Oncology">Oncology</option>
                                            </select>
                                        </div>
 
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-400 block px-1">Mobile No.</label>
                                            <input value={formData.mobileNo} onChange={e => setFormData({...formData, mobileNo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3.5 transition-all text-base font-bold shadow-inner" placeholder="Active contact" />
                                        </div>
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-400 block px-1">National ID (Aadhar)</label>
                                            <input value={formData.aadharNo} onChange={e => setFormData({...formData, aadharNo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3.5 transition-all text-base font-bold shadow-inner" placeholder="0000 0000 0000" />
                                        </div>
 
                                        <div className="space-y-2 lg:col-span-4">
                                            <label className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-400 block px-1">Current Address</label>
                                            <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3.5 transition-all text-base font-bold shadow-inner" placeholder="Primary residence" />
                                        </div>
                                    </div>
                                    <div className="mt-10 border-t border-slate-100 pt-8">
                                        <button type="submit" disabled={registerPatientMutation.isPending} className="w-full py-5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                            {registerPatientMutation.isPending ? "Generating Secure ID..." : "Commit Registration & Issue UID"}
                                            <span className="material-symbols-outlined text-xl">fingerprint</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isDoctor && (
                            <div className="bg-white rounded-[2rem] p-6 shadow-md border border-slate-100 flex flex-col transition-all">
                                <h3 className="text-sm font-headline font-black text-slate-400 flex items-center gap-2 mb-4 uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-xs text-primary">clinical_notes</span>
                                    Prescription Directives
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1">
                                    <div className="md:col-span-8 space-y-1.5 relative">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Narcotic Substance</label>
                                        <div className="relative" ref={drugDropdownRef}>
                                            <input 
                                                value={searchTerm}
                                                onFocus={() => setIsDrugDropdownOpen(true)}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSearchTerm(val);
                                                    if (!val || val !== (DRUGS_MASTER.find(d => d.id.toString() === formData.drugId)?.name)) {
                                                        setFormData(prev => ({ ...prev, drugId: "" }));
                                                    }
                                                    setIsDrugDropdownOpen(true);
                                                }}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-lg px-3 py-2 transition-all text-sm font-bold shadow-inner"
                                                placeholder="Search registry..." 
                                            />
                                            {isDrugDropdownOpen && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                    {filteredDrugs.map(drug => (
                                                        <button key={drug.id} type="button" onClick={() => {setFormData({...formData, drugId: drug.id.toString()}); setSearchTerm(drug.name); setIsDrugDropdownOpen(false);}} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between group">
                                                            <div>
                                                                <p className="font-bold text-sm text-slate-700">{drug.name}</p>
                                                                <p className="text-[9px] uppercase text-slate-400 font-bold">{drug.category}</p>
                                                            </div>
                                                            <span className="bg-primary/5 text-primary text-[8px] font-black px-1.5 py-0.5 rounded">ID {drug.id}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:col-span-3 space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Quantity</label>
                                        <input value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-lg px-3 py-2 transition-all text-sm font-bold shadow-inner" placeholder="Units" type="number" />
                                    </div>
                                    <div className="md:col-span-1 flex items-end pb-0.5">
                                        <button type="button" onClick={addToPrescription} className="w-full h-10 bg-primary text-white rounded-lg shadow-md hover:rotate-90 transition-all flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">add</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-4 space-y-3 flex-1 flex flex-col">
                                    <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 rounded-xl flex items-center justify-between group hover:border-primary/40 transition-all cursor-pointer relative">
                                        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
                                                <span className="material-symbols-outlined">upload_file</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-600 uppercase tracking-tight">{file ? file.name : 'Attach Verified RX Proof'}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-300">attach_file</span>
                                    </div>
                                    <button type="submit" disabled={issueMutation.isPending} className="w-full py-3 bg-black text-white rounded-xl font-headline font-black text-base shadow-lg hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                        {issueMutation.isPending ? 'Signing...' : 'Authorize Clinical Record'}
                                        <span className="material-symbols-outlined uppercase">verified_user</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {isDoctor && medications.length > 0 && (
                            <div className="bg-white rounded-[2rem] p-6 shadow-md border border-slate-100 animate-in slide-in-from-left-4 flex flex-col">
                                <h3 className="font-headline font-black text-slate-400 flex items-center gap-2 mb-4 uppercase tracking-widest text-xs">
                                    <span className="material-symbols-outlined text-xs text-primary">inventory_2</span>
                                    Queued Dispensation
                                </h3>
                                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 min-h-0">
                                    {medications.map((m, idx) => (
                                        <div key={idx} className="p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm flex justify-between items-center group">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-black text-[10px]">
                                                    {m.drugId}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 truncate max-w-[140px]">{m.name}</p>
                                                    <p className="text-[9px] font-bold text-primary uppercase">{m.totalQty} Units</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setMedications(prev => prev.filter((_, i) => i !== idx))} className="text-slate-200 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showSuccessCard && issueMutation.isSuccess && (
                            <div className="bg-primary text-white rounded-[2rem] p-6 shadow-xl animate-in zoom-in-95 duration-700 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    Auth Confirmed
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-white/10 pb-3">
                                        <div>
                                            <p className="text-[9px] font-black text-white/40 uppercase mb-1">Access Passcode</p>
                                            <p className="text-2xl font-black tracking-tighter">{issueMutation.data?.metadata?.shortCode}</p>
                                        </div>
                                        <button type="button" onClick={() => navigator.clipboard.writeText(issueMutation.data?.metadata?.shortCode)} className="bg-white/20 p-2.5 rounded-xl hover:bg-white/40 transition-all">
                                            <span className="material-symbols-outlined text-sm">content_copy</span>
                                        </button>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-xl">
                                        <p className="text-[9px] font-black text-white/40 uppercase mb-1">Transaction Token</p>
                                        <p className="text-[10px] font-mono break-all opacity-80">{issueMutation.data?.metadata?.shortCode}</p>
                                    </div>
                                    <button type="button" onClick={() => { setShowSuccessCard(false); clearPatientSession(); }} className="w-full py-2.5 bg-white text-primary rounded-xl font-black uppercase text-xs hover:scale-[1.02] transition-transform">Dismiss</button>
                                </div>
                            </div>
                        )}
                    </form>
                )}
              </div>
            )}

            {/* RIGHT COLUMN: Clinical Authorization History */}
            {isDoctor && activePatient && (
              <div className="flex flex-col h-full">
                <div className="bg-white rounded-[2rem] p-6 shadow-md border border-slate-100 ring-1 ring-slate-100/50 animate-in fade-in slide-in-from-bottom-2 duration-500 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <h3 className="text-xs font-headline font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs">history</span>
                            Clinical Authorization History
                        </h3>
                        {!isHistoryLoading && (
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{patientHistory?.length || 0} RECORDS INDEXED</span>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                        {isHistoryLoading ? (
                            <div className="h-full flex items-center justify-center text-slate-300 italic text-[10px]">Retrieving blockchain audit trail...</div>
                        ) : !patientHistory?.length ? (
                            <div className="h-full flex items-center justify-center text-slate-300 bg-slate-50 rounded-xl border border-dashed border-slate-100 text-[10px] font-bold p-8 text-center">
                                This subject has no previous records on the distributed ledger.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {patientHistory.map((h: any) => (
                                    <div key={h._id || h.slipHash} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all hover:bg-white group cursor-default shadow-sm">
                                        <div className="flex justify-between items-start mb-2.5">
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase leading-none">{new Date(h.createdAt).toLocaleDateString()}</p>
                                                <p className="text-sm font-black text-slate-800 mt-0.5">Token: {h.shortCode || h.prescriptionId || 'N/A'}</p>
                                            </div>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase transition-colors duration-500 ${ (h.active ?? h.medications?.some((m: any) => m.remainingQty > 0)) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {(h.active ?? h.medications?.some((m: any) => m.remainingQty > 0)) ? 'Active' : 'Redeemed'}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {h.medications?.slice(0, 2).map((m: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-slate-100">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{m.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400">ID: {m.drugId}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-primary">{m.totalQty} units</p>
                                                        <p className={`text-[11px] font-black uppercase tracking-tight ${m.remainingQty === 0 ? 'text-rose-500' : 'text-slate-500'}`}>{m.remainingQty} left</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                                            <p className="text-[9px] font-bold text-slate-400">Expires: {new Date(h.expiry * 1000).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'registry' && hospitalRole === 'doctor' && !selectedPatient && (
           <section className="animate-in fade-in duration-500">
              <div className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-900/5 border border-slate-100 min-h-[600px] flex flex-col">
                 <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                     <div>
                         <h3 className="text-3xl font-headline font-black text-primary tracking-tighter">Clinical Ledger</h3>
                         <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1 italic">Immutable blockchain audit trail</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-4 py-2 rounded-full border border-indigo-100">
                            {prescriptions?.length || 0} TOTAL AUTHORIZATIONS
                        </span>
                     </div>
                 </div>
                 <div className="overflow-x-auto flex-1">
                     <table className="w-full text-left border-collapse">
                         <thead>
                             <tr className="bg-slate-50/50">
                                 <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-tighter">Auth ID / Reference</th>
                                 <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-tighter">Clinical Patient</th>
                                 <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-tighter text-center">Medications</th>
                                 <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-tighter">Ledger Status</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 font-medium">
                             {isLoading ? (
                                 <tr><td colSpan={5} className="py-20 text-center text-slate-300 italic">Syncing with blockchain ledger...</td></tr>
                             ) : !prescriptions?.length ? (
                                 <tr><td colSpan={5} className="py-20 text-center text-slate-300 italic">No clinical authorizations found on-chain.</td></tr>
                             ) : prescriptions.map((p: any) => (
                                 <tr key={p._id || p.slipHash} className="hover:bg-slate-50/50 transition-colors group">
                                     <td className="px-8 py-5">
                                         <p className="text-sm font-black text-slate-700">{p.prescriptionId || 'PENDING'}</p>
                                         <p className="text-[10px] font-mono font-black text-primary uppercase mt-1 px-1.5 py-0.5 bg-primary/5 rounded inline-block">{p.shortCode || 'N/A'}</p>
                                     </td>
                                     <td className="px-8 py-5">
                                         <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-lg border border-slate-200">
                                                 {p.patientName?.[0]}
                                             </div>
                                             <div>
                                                 <p className="text-sm font-black text-slate-800">{p.patientName}</p>
                                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.patientId}</p>
                                             </div>
                                         </div>
                                     </td>
                                     <td className="px-8 py-5">
                                         <div className="flex flex-wrap gap-2 justify-center">
                                             {p.medications?.slice(0, 3).map((m: any, i: number) => (
                                                 <span key={i} className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100 uppercase tracking-tighter">{m.name}</span>
                                             ))}
                                             {p.medications?.length > 3 && <span className="text-[9px] font-black text-slate-300">+{p.medications.length - 3}</span>}
                                         </div>
                                     </td>
                                     <td className="px-8 py-5">
                                         <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase border ${p.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                             {p.active ? 'Available' : 'Redeemed'}
                                         </span>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
              </div>
           </section>
        )}

        {activeView === 'patients' && !selectedPatient && (
           <section className="animate-in fade-in duration-500">
              <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 min-h-[600px]">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                       <div>
                           <h3 className="text-3xl font-headline font-black text-primary tracking-tighter">Patient Registry</h3>
                           <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Consolidated universal health identity records</p>
                       </div>
                       <div className="flex flex-1 max-w-md w-full relative">
                           <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                           <input 
                               value={directorySearch}
                               onChange={e => setDirectorySearch(e.target.value)}
                               placeholder="Search Name, UHID, Aadhar or Mobile..."
                               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                           />
                       </div>
                       <div className="flex gap-4">
                           <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                              {filteredDirectoryPatients?.length || 0} RECORDS FOUND
                           </span>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50/50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest text">
                           <div className="col-span-1">Avatar</div>
                           <div className="col-span-3">Patient Profile</div>
                           <div className="col-span-2">Contact</div>
                           <div className="col-span-2">Aadhar/Govt ID</div>
                           <div className="col-span-2">Registration</div>
                           <div className="col-span-2 text-right">Administrative</div>
                       </div>

                       {isPatientsLoading ? (
                           <div className="py-20 text-center opacity-20">
                              <span className="material-symbols-outlined text-6xl animate-spin">sync</span>
                           </div>
                       ) : !filteredDirectoryPatients?.length ? (
                           <div className="py-20 text-center text-slate-300 italic">No patients found matching your search.</div>
                       ) : filteredDirectoryPatients.map((patient: any) => (
                           <div key={patient.patientId} onClick={() => handlePatientClick(patient)} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-8 py-4 bg-white rounded-[1.5rem] border border-slate-100 items-center hover:shadow-xl hover:border-primary/20 transition-all group group relative cursor-pointer">
                               <div className="col-span-1">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-base border border-slate-100 group-hover:text-primary transition-colors">
                                        {patient.name?.[0]}
                                    </div>
                               </div>
                               <div className="col-span-3">
                                  <div className="flex flex-col">
                                      <span className="text-xs font-black text-slate-800 leading-tight">{patient.name}</span>
                                      <span className="text-[10px] font-black text-primary uppercase tracking-tighter mt-0.5">{patient.patientId}</span>
                                  </div>
                               </div>
                               <div className="col-span-2">
                                  <div className="flex flex-col">
                                      <span className="text-xs font-bold text-slate-600">{patient.mobileNo}</span>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Primary Mobile</span>
                                  </div>
                               </div>
                               <div className="col-span-2">
                                  <span className="text-xs font-bold text-slate-500 font-mono tracking-tighter bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{patient.aadharNo}</span>
                               </div>
                               <div className="col-span-2">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">
                                    {new Date(patient.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                               </div>
                               <div className="col-span-2 text-right">
                                   <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSlipData({
                                                ...patient,
                                                patientName: patient.name,
                                                hospitalName: "PGIMS Rohtak",
                                                token: patient.patientId.slice(-4),
                                                room: "244"
                                            });
                                            setIsSlipOpen(true);
                                        }}
                                        className="inline-flex items-center gap-2 bg-primary/5 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-primary/10"
                                   >
                                       Print Slip
                                       <span className="material-symbols-outlined text-sm">print</span>
                                   </button>
                               </div>
                           </div>
                       ))}
                   </div>
              </div>
           </section>
        )}

        {/* PATIENT DETAIL VIEW */}
        {selectedPatient && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 min-h-[600px]">
                    <div className="flex items-center justify-between mb-8">
                        <button 
                            onClick={() => setSelectedPatient(null)}
                            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-black uppercase text-xs tracking-widest"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back to Registry
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg ring-1 ring-slate-100">
                            <div className="flex flex-col md:flex-row gap-4 items-start">
                                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-3xl text-primary border-4 border-white shadow">
                                    {selectedPatient.name?.[0]}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <h2 className="text-2xl font-headline font-black text-slate-800 mb-1">{selectedPatient.name}</h2>
                                        <p className="text-sm font-black text-primary uppercase tracking-tighter">{selectedPatient.patientId}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile</p>
                                            <p className="font-semibold text-slate-700">{selectedPatient.mobileNo || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aadhar</p>
                                            <p className="font-semibold text-slate-700 font-mono">{selectedPatient.aadharNo || 'N/A'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</p>
                                            <p className="font-semibold text-slate-700">{selectedPatient.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-headline font-black text-slate-800 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">history</span>
                                Medical History
                            </h3>
                            {isHistoryLoading ? (
                                <div className="text-center py-10 text-slate-300 italic">Loading medical history...</div>
                            ) : !patientHistory?.length ? (
                                <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                                    <span className="material-symbols-outlined text-5xl text-slate-200 mb-3 block">inventory_2</span>
                                    <p className="text-slate-400">No prescriptions found in the ledger.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                                    {patientHistory.map((h: any) => (
                                        <div key={h._id || h.slipHash} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                                            <div className="flex justify-between items-start mb-2.5">
                                                <div>
                                                    <p className="text-xs font-black text-primary uppercase">{new Date(h.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    <p className="text-sm font-black text-slate-800 mt-1">Token: {h.shortCode || h.prescriptionId || 'N/A'}</p>
                                                </div>
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${h.active ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    {h.active ? 'Active' : 'Completed'}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {h.medications?.map((m: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-700 truncate max-w-[100px]">{m.name}</p>
                                                            <p className="text-[9px] font-bold text-slate-400">ID: {m.drugId}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-primary">{m.totalQty} units</p>
                                                            <p className="text-[9px] font-bold text-slate-400">{m.remainingQty} left</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                                                <p className="text-[9px] font-bold text-slate-400">Expires: {new Date(h.expiry * 1000).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        )}
      </main>
    </div>
  );
}