"use client";
import { useState } from "react";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  const [selectedRole, setSelectedRole] = useState<null | typeof roles[0]>(null);

  const roles = [
    { 
      name: 'Manufacturer', 
      desc: 'Origin point for supply chain integrity.', 
      img: '/images/role-manufacturer.png',
      details: 'Securely register drug batches, generate unique unit IDs, and initialize the immutable chain of custody on the mainnet.'
    },
    { 
      name: 'Hospital', 
      desc: 'Precision prescription issuance.', 
      img: '/images/role-hospital.png',
      details: 'Clinicians issue hashed digital prescriptions that are cryptographically linked to specific drug tokens, ensuring patient privacy.'
    },
    { 
      name: 'Dealer', 
      desc: 'Transparent wholesale logistics.', 
      img: '/images/role-dealer.png',
      details: 'Track bulk movements and verify regulatory compliance at every handoff between manufacturers and dispensers.'
    },
    { 
      name: 'Pharmacy', 
      desc: 'Secure medicine dispensing.', 
      img: '/images/role-pharmacy.png',
      details: 'Instantly verify drug authenticity before sale and automatically burn digital tokens upon successful patient delivery.'
    },
    { 
      name: 'Regulator', 
      desc: 'Global forensic oversight.', 
      img: '/images/role-regulator.png',
      details: 'Real-time monitoring of controlled substance flows with automated discrepancy detection and deep-dive forensic auditing tools.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <LandingNav />
      
      <main>
        {/* --- Hero Section --- */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-200/40 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-[140px]"></div>
          </div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12"
          >
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                Active Blockchain Mainnet
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-['Manrope'] font-extrabold tracking-tight leading-[1.1] text-slate-900">
                MedChain: <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">The Immutable</span> <br />
                Pharma Network.
              </motion.h1>

              <motion.p variants={itemVariants} className="text-base md:text-lg text-slate-600 max-w-xl leading-relaxed mx-auto lg:mx-0">
                Securing the global pharmaceutical supply chain with cryptographic certainty. MedChain provides end-to-end immutable tracking for controlled substances.
              </motion.p>
            </div>

            <motion.div 
              variants={itemVariants}
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="flex-1 relative"
            >
              <div className="relative z-10 w-full max-w-[450px] aspect-square rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/20">
                <img 
                  src="/images/hero.png" 
                  alt="MedChain Hero" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent"></div>
              </div>
              {/* Decorative Glass Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl -z-10 rotate-12"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-100/30 backdrop-blur-lg border border-white/40 rounded-full shadow-2xl -z-10 animate-pulse"></div>
            </motion.div>
          </motion.div>
        </section>

        {/* --- Chain of Custody (Process) Section --- */}
        <section id="process" className="py-32 bg-[#F8FAFC] relative overflow-hidden">
          {/* Connecting Line Background */}
          <div className="absolute top-[60%] left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-100 to-transparent -z-10 hidden lg:block"></div>
          
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-6 mb-24">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em]"
              >
                The Lifecycle of Integrity
              </motion.span>
              <h2 className="text-5xl md:text-6xl font-['Manrope'] font-black text-slate-900 tracking-tight">
                Chain of Custody
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                An unbroken cryptographic thread weaving through the five pillars of the pharmaceutical ecosystem.
              </p>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative">
              {[
                { 
                  title: 'Production', 
                  actor: 'Manufacturer',
                  desc: 'Genesis batch hashing and secure unit-ID minting on the mainnet.', 
                  img: '/images/stage-production.png',
                },
                { 
                  title: 'Logistics', 
                  actor: 'Dealer',
                  desc: 'Multi-signature custody transfer and real-time geo-verification.', 
                  img: '/images/stage-logistics.png',
                },
                { 
                  title: 'Authorization', 
                  actor: 'Hospital',
                  desc: 'Clinically-locked prescription tokens linked to patient identifiers.', 
                  img: '/images/stage-authorization.png',
                },
                { 
                  title: 'Fulfillment', 
                  actor: 'Pharmacy',
                  desc: 'Final authenticity audit and on-chain token redemption.', 
                  img: '/images/stage-fulfillment.png',
                },
                { 
                  title: 'Oversight', 
                  actor: 'Regulator',
                  desc: 'Immutable real-time monitoring and forensic-grade auditing.', 
                  img: '/images/stage-oversight.png',
                }
              ].map((step, i) => (
                <motion.div 
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] transition-all duration-500 h-full flex flex-col text-left">
                    <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden mb-5 bg-slate-50 relative">
                      <img src={step.img} alt={step.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mixture-blend-multiply" />
                    </div>
                    
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-4 h-px bg-indigo-500/30"></span>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Stage {i + 1}</span>
                      </div>
                      <h4 className="text-lg font-['Manrope'] font-bold text-slate-900 leading-tight">{step.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                  
                  {/* Visual Connector for Desktop */}
                  {i < 4 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[16px] text-slate-300">arrow_forward</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="terminals" className="py-24 px-6 md:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-['Manrope'] font-bold text-slate-900">Enterprise Access</h2>
                <p className="text-slate-500 max-w-md text-lg">Role-specific entry points designed for medical data integrity and regulatory transparency.</p>
              </div>
              <button onClick={() => setSelectedRole(roles[4])} className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-4 transition-all group">
                Global Explorer <span className="material-symbols-outlined group-hover:bg-indigo-50 p-2 rounded-full transition-all">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {roles.map((role) => (
                <motion.button 
                  key={role.name}
                  onClick={() => setSelectedRole(role)}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="group bg-white rounded-[32px] p-5 border border-slate-100 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.04)] cursor-pointer overflow-hidden text-left w-full h-full flex flex-col"
                >
                  <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden mb-5 bg-slate-50">
                    <img src={role.img} alt={role.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 mixture-blend-multiply" />
                  </div>
                  <div className="space-y-2 mt-auto">
                    <h4 className="text-lg font-bold text-slate-900 leading-tight">{role.name} Terminal</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{role.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* --- Role Detail Modal --- */}
        <AnimatePresence>
          {selectedRole && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRole(null)}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 30 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-[48px] max-w-5xl w-full overflow-hidden shadow-2xl relative border border-white/20"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-5/12 h-64 md:h-[600px] overflow-hidden bg-slate-50">
                      <img src={selectedRole.img} alt={selectedRole.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="md:w-7/12 p-8 md:p-16 space-y-10 flex flex-col justify-center">
                      <div className="space-y-6">
                        <div className="inline-flex px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                          Protocol Intelligence
                        </div>
                        <h3 className="text-5xl font-['Manrope'] font-extrabold text-slate-900">{selectedRole.name} Node</h3>
                        <p className="text-slate-500 leading-relaxed text-xl">
                          {selectedRole.details}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 pt-4">
                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                          <span className="material-symbols-outlined text-indigo-600 mb-2">verified_user</span>
                          <h5 className="font-bold text-sm text-slate-900">Immutable Ledger</h5>
                          <p className="text-xs text-slate-500">All actions are recorded on-chain permanently.</p>
                        </div>
                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                          <span className="material-symbols-outlined text-violet-600 mb-2">security</span>
                          <h5 className="font-bold text-sm text-slate-900">Zero Trust Access</h5>
                          <p className="text-xs text-slate-500">Biometric and cryptographic authorization.</p>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button 
                          onClick={() => setSelectedRole(null)}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                        >
                          Acknowledge Protocol
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedRole(null)}
                    className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-100/50 hover:bg-slate-200/50 backdrop-blur-md flex items-center justify-center text-slate-900 transition-all z-10"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- Integrity & Technical Narrative Section --- */}
        <section className="py-24 px-6 md:py-32 bg-slate-50/50">
          <div className="max-w-7xl mx-auto rounded-[64px] bg-[#020617] p-12 md:p-24 relative overflow-hidden border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)]">
            {/* Immersive Background Accents */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]"></div>
            
            <div className="relative z-10 space-y-20">
              <div className="max-w-3xl space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 text-indigo-400"
                >
                  <div className="h-px w-12 bg-indigo-400/30"></div>
                  <span className="text-xs font-black uppercase tracking-[0.3em]">Protocol Specifications</span>
                </motion.div>
                <h2 className="text-5xl md:text-8xl font-['Manrope'] font-black text-white leading-[0.95] tracking-tighter">
                  Integrity in every <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">milligram.</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {[
                  { 
                    title: 'Cryptographic Identity', 
                    icon: 'fingerprint',
                    color: 'indigo',
                    desc: 'Every prescription and batch is hashed using Keccak-256 (SHA-3), ensuring that sensitive data remains private while being verifiable by authorized network nodes.' 
                  },
                  { 
                    title: 'Unit-Level Traceability', 
                    icon: 'account_tree',
                    color: 'violet',
                    desc: 'Unlike traditional batch-tracking, MedChain treats individual drug units as unique blockchain tokens (ERC-721/1155 derivative), eliminating bulk leakage and unauthorized diversion.' 
                  },
                  { 
                    title: 'Immutable Auditing', 
                    icon: 'policy',
                    color: 'fuchsia',
                    desc: 'A permanent, forensic-grade record of every handoff. Regulators monitor a live feed of global medication flows with sub-second latency and zero-knowledge privacy.' 
                  }
                ].map((feature, i) => (
                  <motion.div 
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="space-y-6 group"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center text-${feature.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                      <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-white font-black text-2xl tracking-tight">{feature.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg">hub</span>
              </div>
              <span className="text-xl font-bold font-['Manrope'] text-slate-900 tracking-tight">MedChain</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Global blockchain infrastructure for secure pharmaceutical custody and forensic auditing.
            </p>
          </div>
          {[
            { title: 'Platform', links: ['Network', 'Security', 'Compliance'] },
            { title: 'Company', links: ['About', 'Research', 'Contact', 'Ethics'] },
            { title: 'Legal', links: ['Privacy', 'Terms'] }
          ].map(group => (
            <div key={group.title} className="space-y-6">
              <h5 className="font-bold text-slate-900">{group.title}</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                {group.links.map(l => (
                  <li key={l}>
                    <Link 
                      href={`/info/${l.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} 
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-200">
          <p className="text-slate-400 text-xs text-center">© 2024 MedChain Infrastructure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
