"use client";
import { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LandingNav from '@/components/LandingNav';

export default function LoginPage({ params }: { params: { role: string } }) {
  const router = useRouter();
  const { role } = params;

  // Format title depending on role
  const getRoleTitle = (r: string) => {
    switch (r) {
      case 'hospital': return 'Hospital Portal';
      case 'dealer': return 'Dealer Dashboard';
      case 'medical-store': return 'Pharmacy Terminal';
      case 'regulator': return 'Regulator Node';
      case 'manufacturer': return 'Manufacturer Hub';
      default: return 'MedChain Portal';
    }
  };

  const getRoleIcon = (r: string) => {
    switch (r) {
      case 'hospital': return 'emergency';
      case 'dealer': return 'local_shipping';
      case 'medical-store': return 'medication';
      case 'regulator': return 'gavel';
      case 'manufacturer': return 'factory';
      default: return 'key';
    }
  };

  const [staffRole, setStaffRole] = useState<'reception' | 'doctor'>('reception');
  const [credentials, setCredentials] = useState({ id: "", pass: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'hospital') {
        localStorage.setItem('hospital_role', staffRole);
        localStorage.setItem('staff_id', credentials.id);
        
        if (staffRole === 'reception') {
            router.push(`/dashboard/reception`);
            return;
        }
    }
    router.push(`/dashboard/${role}`);
  };

  const isHospital = role === 'hospital';

  return (
    <>
      <LandingNav />
      <div className="min-h-screen pt-20 bg-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mt-64 -mr-64"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -mb-64 -ml-64"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          <span className="font-headline font-extrabold text-primary text-2xl tracking-tight">MedChain</span>
        </Link>

        <div className="glass-card rounded-[2.5rem] p-8 border border-outline-variant/20 shadow-2xl bg-white/80 backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-3xl">{getRoleIcon(role)}</span>
            </div>
          </div>

          <h1 className="text-3xl font-headline font-black text-center text-on-surface mb-2">{getRoleTitle(role)}</h1>
          <p className="text-center text-on-surface-variant text-sm mb-8">Secure multi-sig authentication protocol</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {isHospital && (
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                    {(['reception', 'doctor'] as const).map(r => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setStaffRole(r)}
                            className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${staffRole === r ? 'bg-white text-primary shadow-lg scale-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70 block px-1">
                {isHospital ? 'Staff Identifier' : 'Entity ID'}
              </label>
              <div className="relative group">
                <input
                  required
                  value={credentials.id}
                  onChange={e => setCredentials({...credentials, id: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/40 focus:bg-white rounded-[1.25rem] px-5 py-4 text-sm font-bold transition-all shadow-inner outline-none"
                  placeholder={isHospital ? "EMP-XXXXX" : "UID-XXXXXXXX"}
                />
                <span className="material-symbols-outlined absolute right-4 top-4 text-outline opacity-40 group-focus-within:opacity-100 transition-opacity">fingerprint</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70 block px-1">Access Credentials</label>
              <div className="relative group">
                <input
                  required
                  type="password"
                  value={credentials.pass}
                  onChange={e => setCredentials({...credentials, pass: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/40 focus:bg-white rounded-[1.25rem] px-5 py-4 text-sm font-bold transition-all shadow-inner outline-none"
                  placeholder="••••••••"
                />
                <span className="material-symbols-outlined absolute right-4 top-4 text-outline opacity-40 group-focus-within:opacity-100 transition-opacity">lock</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/25 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4 flex items-center justify-center gap-3"
            >
              Initialize Node Connection
              <span className="material-symbols-outlined text-lg">login</span>
            </button>
          </form>

          <p className="text-center mt-10 text-[10px] font-medium text-on-surface-variant/50 uppercase tracking-[0.2em] leading-relaxed">
            Authorized System Access Only<br/>
            IP LOGGED: 192.168.1.1 
          </p>
        </div>
        </div>
      </div>
    </>
  );
}
