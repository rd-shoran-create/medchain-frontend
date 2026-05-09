"use client";
import React from 'react';
import LandingNav from '@/components/LandingNav';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const developers = [
  {
    name: "Aarti Punia",
    role: "Lead Blockchain Researcher",
    bio: "Currently pursuing a Ph.D. in Computer Science at the Department of Computer Science & Applications, M.D. University, Rohtak, India. She completed her B.Tech. in Computer Science in 2012 and M.Tech in 2014 from M.D.U, Rohtak. Her main research area includes Blockchain, Cloud computing etc. She has published some research papers indexed in SCI, SCIE and presented papers in national and international conferences.",
    image: "/images/aarti.png",
    gradient: "from-indigo-500 to-violet-500"
  },
  {
    name: "Prof. Preeti Gulia",
    role: "Professor & Principal Investigator",
    bio: "Ph.D. in computer science (2013). Currently working as a Professor at the Department of Computer Science & Applications, M.D. University, Rohtak, India. Serving the Department since 2009. Published more than 100 research papers indexed in SCI, SCIE, and Scopus. Area of research includes Data Mining, Big Data, Machine Learning, Deep Learning, IoT, and Software Engineering. Active professional member of IAENG, CSI, and ACM.",
    image: "/images/Preeti.png",
    gradient: "from-violet-500 to-fuchsia-500"
  },
  {
    name: "Prof. Nasib Singh Gill",
    role: "Head of the Department",
    bio: "Head of the Department of Computer Science & Applications, M. D. University, Rohtak, India. Holds post-Doctoral research from Brunel University (2001-2002) and Ph.D. (1996). Recipient of the Commonwealth Fellowship Award. Director of the Directorate of Distance Education & Digital Learning Centre. Published more than 304 research papers indexed in SCI, SCIE, and Scopus. Research interests include IoT, Machine & Deep Learning, Information and Network Security.",
    image: "/images/nasib.png",
    gradient: "from-fuchsia-500 to-rose-500"
  }
];

export default function DevelopersPage() {
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

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-['Manrope'] overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-100/50 blur-[120px] mix-blend-multiply opacity-70 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-100/40 blur-[140px] mix-blend-multiply opacity-70"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <LandingNav />

        <main className="flex-grow max-w-5xl mx-auto px-6 py-20 md:py-32 w-full">
          {/* Header */}
          <div className="text-center space-y-6 mb-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-widest shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">groups</span>
              The Visionaries
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900"
            >
              Research &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Development</span> Team
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-xl text-slate-600 max-w-2xl leading-relaxed mx-auto font-medium"
            >
              The minds behind PrescChain&apos;s immutable architecture. Dedicated to securing the global pharmaceutical supply chain through advanced cryptographic implementations.
            </motion.p>
          </div>

          {/* Developers Horizontal List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 mb-20"
          >
            {developers.map((dev, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="group relative bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden flex flex-col md:flex-row items-start gap-8"
              >
                {/* Accent Left Border Line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${dev.gradient} opacity-80`}></div>
                
                {/* DP / Passport size Avatar on the left */}
                <div className="flex-shrink-0 relative">
                  <div className="w-32 h-40 md:w-40 md:h-48 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shadow-inner overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 relative z-10">
                    <Image src={dev.image} alt={dev.name} width={160} height={192} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${dev.gradient} blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl`}></div>
                </div>

                {/* Info on the right */}
                <div className="flex flex-col flex-grow justify-center py-2">
                  <div className="space-y-1 mb-4">
                    <h3 className="text-3xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{dev.name}</h3>
                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">{dev.role}</p>
                  </div>

                  <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                    {dev.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <Link 
              href="/" 
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-all group"
            >
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to Terminal
            </Link>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg font-bold">hub</span>
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">PrescChain</span>
            </div>
            <p className="text-slate-400 text-[10px] text-center md:text-left font-bold uppercase tracking-wider">
              © 2024 PrescChain Infrastructure. Designed for High-Integrity Pharma Logistics.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
