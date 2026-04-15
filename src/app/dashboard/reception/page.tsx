"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPatients, registerPatient } from "@/lib/api/prescription";
import DashboardNav from "@/components/DashboardNav";
import PrescriptionSlip from "@/components/PrescriptionSlip";

export default function ReceptionDashboard() {
  const queryClient = useQueryClient();
  const [hospitalId, setHospitalId] = useState<string>("");
  const [activeView, setActiveView] = useState('terminal');

  useEffect(() => {
    setHospitalId(localStorage.getItem('staff_id') || '');
  }, []);

  const { data: patients, isLoading: isPatientsLoading } = useQuery({
    queryKey: ['patients', hospitalId],
    queryFn: () => getPatients()
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
  });

  const [directorySearch, setDirectorySearch] = useState("");
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);

  const filteredDirectoryPatients = patients?.filter((p: any) => 
    p.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
    p.patientId.toLowerCase().includes(directorySearch.toLowerCase()) ||
    p.mobileNo.includes(directorySearch) ||
    p.aadharNo.includes(directorySearch)
  );

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

        setFormData({ patientName: "", fatherName: "", address: "", mobileNo: "", aadharNo: "", age: "", gender: "", department: "", hospitalName: "" });
        alert(`Successfully Registered! PID: ${data.patient.patientId}`);
    },
    onError: (err: any) => {
        console.error("❌ Registration Error:", err);
        alert("❌ Registration Failed: " + (err?.error || err?.message || "Internal Server Error"));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Submitting Form [Role: reception]", formData);
    
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
  };

  return (
    <div className="min-h-screen bg-surface-container-low selection:bg-primary/10">
      <DashboardNav activeTab={activeView} onTabChange={setActiveView} roleOverride="reception" />
      {isSlipOpen && slipData && (
        <PrescriptionSlip isOpen={isSlipOpen} onClose={() => setIsSlipOpen(false)} data={slipData} />
      )}
      
      <main className="pt-20 px-4 md:px-10 pb-10 max-w-7xl mx-auto">
        
        {activeView === 'terminal' && (
          <div className="min-h-[calc(100vh-160px)] flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
             <form onSubmit={handleSubmit} className="w-full max-w-5xl animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-white rounded-[3rem] p-10 shadow-2xl ring-1 ring-slate-100 w-full relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-primary to-indigo-400"></div>
                         <h3 className="text-xl font-headline font-extrabold text-primary flex items-center justify-between mb-6">
                             <div className="flex items-center gap-2">
                                 <span className="material-symbols-outlined text-2xl">assignment_ind</span>
                                 OPD Registration Slip
                             </div>
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                             <div className="space-y-1 lg:col-span-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block px-1">Patient Name</label>
                                 <input required value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-2 transition-all text-sm font-semibold shadow-inner" placeholder="Legal full name" />
                             </div>
                             <div className="space-y-1 lg:col-span-1">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block px-1">Age</label>
                                 <input required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-2 transition-all text-sm font-semibold shadow-inner" placeholder="Years" type="text" inputMode="numeric" pattern="[0-9]*" />
                             </div>
                             <div className="space-y-1 lg:col-span-1">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block px-1">Gender</label>
                                 <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-2 transition-all text-sm font-semibold shadow-inner text-slate-700">
                                     <option value="" disabled>Select</option>
                                     <option value="Male">Male</option>
                                     <option value="Female">Female</option>
                                     <option value="Other">Other</option>
                                 </select>
                             </div>
                             
                             <div className="space-y-1 lg:col-span-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block px-1">Father / Guardian</label>
                                 <input required value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-2 transition-all text-sm font-semibold shadow-inner" placeholder="Guardian's name" />
                             </div>
                             <div className="space-y-1 lg:col-span-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block px-1">Department</label>
                                 <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-2 transition-all text-sm font-semibold shadow-inner text-slate-700">
                                     <option value="" disabled>Select Department</option>
                                     <option value="General Medicine">General Medicine</option>
                                     <option value="Neurology">Neurology</option>
                                     <option value="Mental Health / Psychiatry">Mental Health / Psychiatry</option>
                                     <option value="Orthopedics">Orthopedics</option>
                                     <option value="Oncology">Oncology</option>
                                 </select>
                             </div>

                             <div className="space-y-1 lg:col-span-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block px-1">Mobile No.</label>
                                 <input value={formData.mobileNo} onChange={e => setFormData({...formData, mobileNo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-2 transition-all text-sm font-semibold shadow-inner" placeholder="Active contact" />
                             </div>
                             <div className="space-y-1 lg:col-span-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block px-1">National ID (Aadhar)</label>
                                 <input value={formData.aadharNo} onChange={e => setFormData({...formData, aadharNo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-2 transition-all text-sm font-semibold shadow-inner" placeholder="0000 0000 0000" />
                             </div>

                             <div className="space-y-1 lg:col-span-4">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block px-1">Current Address</label>
                                 <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-2 transition-all text-sm font-semibold shadow-inner" placeholder="Primary residence" />
                             </div>
                         </div>
                         <div className="mt-6 border-t border-slate-100 pt-4">
                             <button type="submit" disabled={registerPatientMutation.isPending} className="w-full py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                 {registerPatientMutation.isPending ? "Generating Secure ID..." : "Commit Registration & Issue UID"}
                                 <span className="material-symbols-outlined text-sm">fingerprint</span>
                             </button>
                         </div>
                      </div>
                  </form>
               </div>
            )}

        {activeView === 'patients' && (
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
                           <div key={patient.patientId} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-8 py-4 bg-white rounded-[1.5rem] border border-slate-100 items-center hover:shadow-xl hover:border-primary/20 transition-all group group relative">
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
                                                hospitalName: "PGIMS Rohtak", // Note: Might want to pull this dynamically eventually if needed
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


      </main>
    </div>
  );
}
