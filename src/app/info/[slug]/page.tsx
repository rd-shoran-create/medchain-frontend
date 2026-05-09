"use client";
import React from 'react';
import LandingNav from '@/components/LandingNav';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

const pageData: Record<string, any> = {
  network: {
    title: "Network Architecture",
    tagline: "Decentralized infrastructure for pharmaceutical integrity.",
    description: "The PrescChain network operates on a private, permissioned blockchain ledger, ensuring that every handoff in the supply chain is cryptographically verified. Unlike centralized databases, our node-based architecture prevents single points of failure and unauthorized data manipulation.",
    details: [
      {
        title: "Node Distribution",
        content: "The network is comprised of five primary node types: Manufacturers, Dealers, Pharmacies, Hospitals, and Regulators. Each stakeholder maintains a local copy of the ledger for real-time verification.",
        icon: "hub"
      },
      {
        title: "Proof of Custody",
        content: "Every transaction requires a cryptographic 'accept' from the receiver, creating an unbroken chain of custody from the factory floor to the patient's hand.",
        icon: "account_tree"
      },
      {
        title: "Uptime & Reliability",
        content: "By utilizing a decentralized consensus mechanism, the network maintains 99.99% availability, resistant to regional outages or server failures.",
        icon: "alt_route"
      }
    ],
    stats: [
      { label: "Active Nodes", value: "Global" },
      { label: "Consensus", value: "RBAC-PoA" },
      { label: "Latency", value: "< 2.0s" }
    ]
  },
  security: {
    title: "Security Protocols",
    tagline: "Military-grade encryption for patient and product safety.",
    description: "PrescChain utilizes advanced cryptographic standards to ensure that sensitive medical data and drug unit identities are impenetrable. We prioritize unit-level security over batch security.",
    details: [
      {
        title: "Keccak-256 Hashing",
        content: "Every individual drug unit is assigned a unique identifier generated via Keccak-256 batch hashing, making it impossible to counterfeit or duplicate.",
        icon: "enhanced_encryption"
      },
      {
        title: "Zero-Trust Backend",
        content: "Our system operates on a zero-trust principle. Every API request is verified against on-chain permissions before any data is processed.",
        icon: "verified_user"
      },
      {
        title: "Immutable Auditing",
        content: "Once a transaction is finalized on the ledger, it cannot be deleted or modified, providing a permanent forensic record for investigators.",
        icon: "history_edu"
      }
    ],
    stats: [
      { label: "Hash standard", value: "Keccak-256" },
      { label: "Auth", value: "JWT + RBAC" },
      { label: "Encryption", value: "AES-256" }
    ]
  },
  compliance: {
    title: "Compliance Standards",
    tagline: "Aligning with FDA and Global Regulatory Frameworks.",
    description: "PrescChain is designed to exceed the requirements set by the FDA Drug Supply Chain Security Act (DSCSA). We automate compliance reporting to reduce administrative overhead and eliminate human error.",
    details: [
      {
        title: "DSCSA Alignment",
        content: "Automated track-and-trace capabilities ensure full compliance with unit-level tracking requirements mandated for 2026 and beyond.",
        icon: "gavel"
      },
      {
        title: "Automated Reporting",
        content: "Regulators receive real-time alerts if any inventory discrepancy or unauthorized diversion is detected by the system.",
        icon: "analytics"
      },
      {
        title: "Audit Readiness",
        content: "The immutable nature of the ledger means your facility is always in a state of 'Constant Audit Readiness' without manual preparation.",
        icon: "assignment_turned_in"
      }
    ],
    stats: [
      { label: "Standard", value: "DSCSA" },
      { label: "Audits", value: "Real-time" },
      { label: "Precision", value: "Unit-level" }
    ]
  },
  about: {
    title: "About PrescChain",
    tagline: "The Immutable Pharma Network.",
    description: "PrescChain was founded with a singular mission: to eliminate the black market for controlled substances. By leveraging blockchain technology, we provide the transparency needed to protect patients and ensure that life-saving medications reach their intended destination.",
    details: [
      {
        title: "Combating Diversion",
        content: "Our system identifies patterns of drug 'leakage' from the supply chain, cutting off black market supply at the source.",
        icon: "block"
      },
      {
        title: "Market Capping",
        content: "For highly sensitive drugs like opioids, we implement decentralized market caps to prevent over-distribution in critical zones.",
        icon: "trending_down"
      },
      {
        title: "Vision",
        content: "We envision a world where every milligram of a controlled substance is accounted for, from manufacture to consumption.",
        icon: "visibility"
      }
    ],
    stats: [
      { label: "Focus", value: "Non-Diversion" },
      { label: "Tech", value: "Web3/Next.js" },
      { label: "Year", value: "2026" }
    ]
  },
  research: {
    title: "PrescChain Research",
    tagline: "Pushing the boundaries of supply chain intelligence.",
    description: "Our research initiatives focus on the intersection of distributed ledger technology and pharmaceutical logistics. We are building the next generation of predictive auditing tools.",
    details: [
      {
        title: "Forensic Visualization",
        content: "Developing tools to map the global flow of drugs in real-time using graph-network analysis.",
        icon: "monitoring"
      },
      {
        title: "Predictive Analytics",
        content: "Using historical ledger data to predict future shortages or surplus in specific medical regions.",
        icon: "psychology"
      },
      {
        title: "Academic Integrity",
        content: "Collaborating with researchers to validate the efficacy of blockchain in reducing administrative fraud.",
        icon: "school"
      }
    ],
    stats: [
      { label: "Status", value: "Research v1" },
      { label: "Impact", value: "High-Integrity" },
      { label: "Scale", value: "Exponential" }
    ]
  },
  ethics: {
    title: "Ethics & Privacy",
    tagline: "Sovereign privacy in an immutable world.",
    description: "Managing sensitive medical data requires a delicate balance between total transparency and patient privacy. PrescChain employs a hybrid data model to solve this challenge.",
    details: [
      {
        title: "Hybrid Privacy Model",
        content: "Personal Health Information (PHI) is stored securely off-chain, while only non-personally identifiable cryptographic proofs reside on the ledger.",
        icon: "shield_lock"
      },
      {
        title: "Patient Sovereignty",
        content: "Patients maintain control over their data, with the system ensuring that no identity is visible to supply chain nodes (Manufacturers/Dealers).",
        icon: "person_celebrate"
      },
      {
        title: "Anti-Counterfeiting",
        content: "Ethical distribution focuses on ensuring the authenticity of medications, preventing the entry of fatal fake drugs into the market.",
        icon: "fact_check"
      }
    ],
    stats: [
      { label: "Model", value: "On/Off-Chain" },
      { label: "PII/PHI", value: "Encrypted" },
      { label: "GDPR", value: "Compliant" }
    ]
  },
  contact: {
    title: "Contact PrescChain",
    tagline: "Get in touch with the core development team.",
    description: "We are currently in active development. For technical inquiries, integration requests, or developer partnerships, please reach out via our official channels.",
    details: [
      {
        title: "Developer Support",
        content: "Currently maintained by the PrescChain Core Team. Documentation and early access APIs are available for verified institutional partners.",
        icon: "terminal"
      },
      {
        title: "Integrations",
        content: "Looking to integrate PrescChain into your Hospital Management System (HMS) or ERP? Our team can provide custom adapter solutions.",
        icon: "integration_instructions"
      },
      {
        title: "Location",
        content: "Distributed development with a core focus on secure pharmaceutical zones and regulatory hubs.",
        icon: "location_on"
      }
    ],
    stats: [
      { label: "Response", value: "24-48h" },
      { label: "Email", value: "dev@prescchain.io" },
      { label: "GitHub", value: "PrescChain" }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    tagline: "A new standard for health data disclosure.",
    description: "Our privacy policy is centered around the concept of 'Privacy by Design'. We ensure that transparency in the supply chain does not come at the cost of individual dignity.",
    details: [
      {
        title: "Immutable Disclosure",
        content: "Users must be aware that ledger records are permanent. While data is anonymized, the event history itself cannot be erased, fulfilling the requirements of absolute accountability.",
        icon: "warning"
      },
      {
        title: "Data Minimization",
        content: "We only record the minimum data necessary to verify the chain of custody. No unnecessary personal details ever enter the blockchain ecosystem.",
        icon: "compress"
      },
      {
        title: "Access Rights",
        content: "Only authorized personnel (Doctors/Regulators) have the cryptographic keys necessary to link blockchain events back to specific patient prescriptions.",
        icon: "key"
      }
    ],
    stats: [
      { label: "Retention", value: "Permanent" },
      { label: "ID Hash", value: "SHA-256" },
      { label: "Policy v", value: "1.0.2" }
    ]
  },
  terms: {
    title: "Terms of Service",
    tagline: "Rules of engagement for the PrescChain infrastructure.",
    description: "By accessing the PrescChain network, stakeholders agree to the following terms designed to maintain the integrity and security of the pharmaceutical supply chain.",
    details: [
      {
        title: "Stakeholder Accountability",
        content: "All nodes are responsible for the security of their private keys. Any unauthorized use of credentials must be reported to the Regulator node immediately.",
        icon: "security_update_good"
      },
      {
        title: "Prohibited Acts",
        content: "Attempting to reverse-engineer patient hashes or bypass market caps is strictly prohibited and results in immediate node revocation.",
        icon: "gpp_bad"
      },
      {
        title: "System Integrity",
        content: "PrescChain provides the infrastructure only. Actual clinical decisions remain the responsibility of licensed medical professionals.",
        icon: "clinical_notes"
      }
    ],
    stats: [
      { label: "Agreement", value: "Required" },
      { label: "Governing", value: "Blockchain Law" },
      { label: "Revocation", value: "Instant" }
    ]
  }
};

export default function InfoPage() {
  const { slug } = useParams();
  const data = pageData[slug as string] || pageData.about;

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-['Manrope'] overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <LandingNav />

      {/* Background Blobs - Light Mode Pastels */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/40 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-100/30 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm">
            Protocol Intelligence
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900">
            {data.title}
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl font-medium">
            {data.tagline}
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-2 space-y-12"
          >
            <div className="p-8 md:p-12 rounded-[2.5rem] bg-white/70 border border-slate-200/60 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(31,38,135,0.08)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 transition-colors"></div>

              <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-12 font-medium">
                {data.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {data.details.map((detail: any, idx: number) => (
                  <div key={idx} className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                      <span className="material-symbols-outlined text-2xl">{detail.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{detail.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {detail.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-all group"
              >
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back to Terminal
              </Link>
            </div>
          </motion.div>

          {/* Sidebar Metadata */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-6"
          >
            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200/60 shadow-sm">
              <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-8">Metadata Explorer</h4>
              <div className="space-y-8">
                {data.stats.map((stat: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-1 border-l-2 border-indigo-100 pl-6 hover:border-indigo-500 transition-colors">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{stat.label}</span>
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 shadow-sm">
              <h4 className="text-xs font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">verified</span>
                Integrity Verified
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                All information on this page is cryptographically linked to the PrescChain core protocol specification v1.4.2. Current network status: <span className="text-emerald-600 font-bold">Synchronized</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 mt-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg font-bold">hub</span>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">PrescChain</span>
          </div>
          <p className="text-slate-400 text-[10px] text-center md:text-left font-bold uppercase tracking-wider">
            © 2026 PrescChain Infrastructure. Designed for High-Integrity Pharma Logistics.
          </p>
        </div>
      </footer>
    </div>
  );
}
