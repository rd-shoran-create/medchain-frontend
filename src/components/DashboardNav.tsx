"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  roleOverride?: string;
}

export default function DashboardNav({ activeTab, onTabChange, roleOverride }: DashboardNavProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(roleOverride || localStorage.getItem("hospital_role"));
    }
  }, [roleOverride]);

  let title = "MedChain";
  let icon = "hub";
  let isHospital = pathname.includes('/hospital') || pathname.includes('/reception');

  if (pathname.includes('/reception')) {
    title = "Reception Desk";
    icon = "how_to_reg";
  } else if (pathname.includes('/hospital')) {
    title = "Clinical Terminal";
    icon = "clinical_notes";
  } else if (pathname.includes('/dealer')) {
    title = "Dealer Dashboard";
    icon = "local_shipping";
  } else if (pathname.includes('/medical-store')) {
    title = "Pharmacy Terminal";
    icon = "medication";
  } else if (pathname.includes('/regulator')) {
    title = "Regulator Node";
    icon = "gavel";
  }

  return (
    <nav className="fixed top-0 w-full z-[60] bg-white/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl font-black">{icon}</span>
          </div>
          <span className="font-headline font-extrabold text-primary text-lg tracking-tighter">{title}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {isHospital && onTabChange && (
            <div className="hidden md:flex items-center bg-slate-100/50 p-1 rounded-xl ghost-border mr-2">
               <button 
                  onClick={() => onTabChange('terminal')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all ${activeTab === 'terminal' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  Terminal
               </button>
               <button 
                  onClick={() => onTabChange('patients')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all ${activeTab === 'patients' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  Directory
               </button>
            </div>
          )}

          <div className="w-[1px] h-6 bg-slate-100 hidden md:block"></div>

          <Link
            href="/"
            onClick={() => {
              localStorage.removeItem('hospital_role');
              localStorage.removeItem('staff_id');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden md:inline">Sign Out</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}