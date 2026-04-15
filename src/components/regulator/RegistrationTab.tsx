"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { registerEntity } from "@/lib/api/regulator";
import { apiClient } from "@/lib/api/client";

const ENTITY_TYPES = [
  { value: "hospital", label: "Hospital", icon: "emergency", description: "Medical facility authorized to issue prescriptions", color: "bg-red-50 border-red-100 text-red-600" },
  { value: "manufacturer", label: "Manufacturer", icon: "factory", description: "Pharmaceutical producer licensed to mint drug units", color: "bg-violet-50 border-violet-100 text-violet-600" },
  { value: "dealer", label: "Dealer", icon: "local_shipping", description: "Authorized distributor for controlled substances", color: "bg-blue-50 border-blue-100 text-blue-600" },
  { value: "medical-store", label: "Medical Store (Pharmacy)", icon: "medication", description: "Retail dispensary authorized to sell to patients", color: "bg-emerald-50 border-emerald-100 text-emerald-600" },
];

const getAvailableAccounts = (): Promise<string[]> => apiClient.get('/accounts/available');

export default function RegistrationTab() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState("");
  
  // Generic fields
  const [entityName, setEntityName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  
  // Specific fields
  const [hospitalType, setHospitalType] = useState("");
  const [headDoctor, setHeadDoctor] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [manufacturingCategory, setManufacturingCategory] = useState("");
  const [distributionRegion, setDistributionRegion] = useState("");
  const [pharmacistName, setPharmacistName] = useState("");

  const [successInfo, setSuccessInfo] = useState<{ name: string; type: string; txHash: string; address: string } | null>(null);

  const { data: availableAccounts, isLoading: loadingAccounts, refetch: refetchAccounts } = useQuery({
    queryKey: ['availableAccounts'],
    queryFn: getAvailableAccounts
  });

  const nextAddress = availableAccounts?.[0] || "";

  const mutation = useMutation({
    mutationFn: (data: any) => registerEntity(data.type, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allEntities'] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['availableAccounts'] });
      setSuccessInfo({ name: variables.name, type: variables.type, txHash: result.txHash, address: variables.address });
      resetForm();
      refetchAccounts();
    },
    onError: (err: any) => {
      alert("❌ Registration Failed: " + (err?.error || err?.message || "Unknown error"));
    }
  });

  const resetForm = () => {
    setEntityName("");
    setAddress("");
    setCity("");
    setState("");
    setPhone("");
    setEmail("");
    setLicenseNumber("");
    setHospitalType("");
    setHeadDoctor("");
    setGstNumber("");
    setManufacturingCategory("");
    setDistributionRegion("");
    setPharmacistName("");
    setSelectedType("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) {
      alert("Please select an entity type.");
      return;
    }
    if (!nextAddress) {
      alert("No available blockchain accounts. All 20 Hardhat accounts are assigned.");
      return;
    }
    
    // Build payload
    const payload: any = {
        type: selectedType,
        name: entityName,
        address: nextAddress,
        streetAddress: address, // use streetAddress to avoid conflict with blockchain 'address'
        city,
        state,
        phone,
        email,
        licenseNumber
    };

    if (selectedType === "hospital") {
        payload.hospitalType = hospitalType;
        payload.headDoctor = headDoctor;
    } else if (selectedType === "manufacturer") {
        payload.gstNumber = gstNumber;
        payload.manufacturingCategory = manufacturingCategory;
    } else if (selectedType === "dealer") {
        payload.distributionRegion = distributionRegion;
    } else if (selectedType === "medical-store") {
        payload.pharmacistName = pharmacistName;
    }

    mutation.mutate(payload);
  };

  const selectedTypeConfig = ENTITY_TYPES.find(t => t.value === selectedType);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Success Banner */}
      {successInfo && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-6 rounded-[2rem] flex items-start gap-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 text-white">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg">Entity Registered Successfully!</p>
            <p className="text-sm text-emerald-600/80 mt-1 font-semibold">
              <strong>{successInfo.name}</strong> has been registered as a <strong>{successInfo.type}</strong> on the blockchain and internal database.
            </p>
            <div className="mt-3 bg-emerald-100/50 rounded-xl p-3 space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Assigned Blockchain Address</p>
              <p className="text-xs font-mono text-emerald-700 break-all">{successInfo.address}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 mt-2">Transaction Hash</p>
              <p className="text-xs font-mono text-emerald-600/60 break-all">{successInfo.txHash}</p>
            </div>
          </div>
          <button onClick={() => setSuccessInfo(null)} className="text-emerald-400 hover:text-emerald-600 shrink-0">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Registration Form */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-900/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">person_add</span>
          </div>
          <div>
            <h3 className="text-xl font-bold font-headline tracking-tight text-slate-800">Register New Entity</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Onboard a new node to the MedChain network</p>
          </div>
        </div>

        {/* Step 1: Select Entity Type */}
        <div className="space-y-2 mb-6">
          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Step 1: Select Entity Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ENTITY_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${selectedType === type.value ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${type.color}`}>
                    <span className="material-symbols-outlined">{type.icon}</span>
                  </div>
                  <span className="font-bold text-sm text-slate-800">{type.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Entity Details */}
        {selectedType && (
          <form className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300" onSubmit={handleSubmit}>
            <div className="border-t border-slate-100 pt-6">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1 mb-4">Step 2: Complete Entity Details</label>
            </div>

            {/* Core Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Entity Name" value={entityName} onChange={setEntityName} required />
              <InputField label="License Number" value={licenseNumber} onChange={setLicenseNumber} required />
              <InputField label="Phone Number" value={phone} onChange={setPhone} required />
              <InputField label="Email Address" value={email} onChange={setEmail} type="email" required />
            </div>

            <div className="space-y-4 pt-2">
                <InputField label="Street Address" value={address} onChange={setAddress} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="City" value={city} onChange={setCity} required />
                    <InputField label="State / Region" value={state} onChange={setState} required />
                </div>
            </div>

            {/* Dynamic Specific Fields */}
            {selectedType === "hospital" && (
                <div className="border-t border-slate-100 pt-6 space-y-4">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Hospital Configuration</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Type (e.g. Govt, Private)" value={hospitalType} onChange={setHospitalType} />
                        <InputField label="Chief Medical Officer" value={headDoctor} onChange={setHeadDoctor} />
                    </div>
                </div>
            )}

            {selectedType === "manufacturer" && (
                <div className="border-t border-slate-100 pt-6 space-y-4">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Manufacturer Metadata</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="GST Number" value={gstNumber} onChange={setGstNumber} />
                        <InputField label="Manufacturing Category" value={manufacturingCategory} onChange={setManufacturingCategory} />
                    </div>
                </div>
            )}

            {selectedType === "dealer" && (
                <div className="border-t border-slate-100 pt-6 space-y-4">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Dealer Authorization</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Distribution Region" value={distributionRegion} onChange={setDistributionRegion} />
                    </div>
                </div>
            )}

            {selectedType === "medical-store" && (
                <div className="border-t border-slate-100 pt-6 space-y-4">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Pharmacy Operation</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Assigned Pharmacist Name" value={pharmacistName} onChange={setPharmacistName} />
                    </div>
                </div>
            )}

            {/* Auto-assigned address */}
            <div className="pt-4">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1 mb-2">Blockchain Network Assignment</label>
              <div className="w-full h-14 px-4 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between">
                {loadingAccounts ? (
                  <span className="text-sm text-slate-400 font-semibold animate-pulse">Checking available node slots...</span>
                ) : nextAddress ? (
                  <>
                    <span className="text-sm font-mono text-emerald-700 truncate">{nextAddress}</span>
                    <span className="shrink-0 px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full">Auto</span>
                  </>
                ) : (
                  <span className="text-sm text-red-500 font-semibold">Network Full — No accounts available</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 ml-1 flex items-center gap-1 mt-2">
                <span className="material-symbols-outlined text-[14px] text-emerald-500">auto_awesome</span>
                Cryptographic identity will be assigned from next available local network node
              </p>
            </div>

            <div className="pt-6">
              <button
                disabled={mutation.isPending || !nextAddress || !entityName}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-2xl font-bold tracking-wide shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
              >
                <span className="material-symbols-outlined text-xl">{mutation.isPending ? "sync" : "how_to_reg"}</span>
                {mutation.isPending ? "Configuring Blockchain Node..." : `Deploy & Register ${selectedTypeConfig?.label || "Entity"}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Utility Input Component
function InputField({ label, value, onChange, type = "text", required = false }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-xl transition-all text-sm font-semibold shadow-inner"
      />
    </div>
  )
}
