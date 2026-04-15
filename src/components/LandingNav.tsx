"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LandingNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] transition-all duration-300">
      <nav className="flex justify-between items-center px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-white text-2xl font-bold">hub</span>
          </div>
          <span className="font-['Manrope'] text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            MedChain
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {[
            { name: 'Home', href: '/' },
            { name: 'Hospital', href: '/login/hospital' },
            { name: 'Dealer', href: '/login/dealer' },
            { name: 'Pharmacy', href: '/login/medical-store' },
            { name: 'Manufacturer', href: '/login/manufacturer' },
            { name: 'Regulator', href: '/login/regulator' }
          ].map((link) => (
            <Link
              key={link.name}
              className={`font-['Manrope'] text-[15px] font-extrabold tracking-tight transition-all duration-300 relative group ${pathname === link.href || (pathname.includes(link.href) && link.href !== '/')
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400'
                }`}
              href={link.href}>
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full ${pathname === link.href || (pathname.includes(link.href) && link.href !== '/') ? 'w-full' : ''
                }`}></span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
