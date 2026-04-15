"use client";
import React, { useRef } from 'react';

interface PrescriptionSlipProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        patientId: string;
        patientName: string;
        age: string | number;
        gender: string;
        fatherName: string;
        mobileNo: string;
        department: string;
        hospitalName: string;
        token?: string;
        room?: string;
        date?: string;
    };
}

export default function PrescriptionSlip({ isOpen, onClose, data }: PrescriptionSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Defaults for the OPD layout
  const displayDate = data.date || new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toUpperCase();

  const token = data.token || (data.patientId ? data.patientId.slice(-4) : "0000");
  const room = data.room || "244"; // User supplied 244 in example

  const handlePrint = () => {
    const printContent = slipRef.current;
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '100%';
    iframe.style.bottom = '100%';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      
      const hostStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\n');

      doc.write(`
        <html>
          <head>
            <title>OPD Slip - ${data.patientName}</title>
            ${hostStyles}
            <style>
              @page { 
                size: 85.6mm 53.98mm; 
                margin: 0 !important; 
              }
              html, body { 
                margin: 0 !important; 
                padding: 0 !important; 
                background: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                width: 85.6mm !important;
                height: 53.98mm !important;
                overflow: hidden !important;
              }
              #printable-slip {
                width: 85.6mm !important;
                height: 53.98mm !important;
                padding: 4mm !important;
                box-sizing: border-box !important;
                font-family: 'Manrope', sans-serif !important;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .barcode {
                font-family: 'Libre Barcode 39', cursive !important;
                font-size: 24px !important;
                white-space: nowrap !important;
                display: block !important;
                text-align: center !important;
              }
              p { margin: 0 !important; line-height: 1.2 !important; }
            </style>
          </head>
          <body>
            <div id="printable-slip">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Modal UI Header */}
        <div className="bg-[#0c0069] p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-lg text-white">how_to_reg</span>
             <h2 className="text-lg font-headline font-black tracking-tight text-white m-0">OPD Patient Identity Card</h2>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform p-1 text-white/60 hover:text-white">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* The Slip View (The part that prints) */}
        <div className="p-6 bg-white overflow-hidden" ref={slipRef}>
            <div className="font-bold text-slate-800 uppercase tracking-tight flex flex-col justify-between w-[calc(85.6mm-12mm)] h-[calc(53.98mm-12mm)] mx-auto border border-slate-50 p-1">
                
                {/* Row 1: UHID & DateTime */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-1">
                    <p className="text-[8px] font-black text-slate-400">PATIENT ID</p>
                    <p className="text-[12px] font-black text-slate-900">{data.patientId}</p>
                    <p className="text-[7px] text-slate-400 font-black">{displayDate}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1">
                    {/* Left Column Data */}
                    <div className="space-y-4 flex flex-col justify-center">
                         {/* Row 4: Name, Age, Gender */}
                        <div className="space-y-1">
                            <p className="text-[15px] font-black uppercase text-slate-900 leading-none">
                                {data.patientName}
                            </p>
                            <p className="text-[11px] font-bold text-primary">
                                AGE: {data.age ? `${data.age}Y` : 'N/A'} / {data.gender || 'N/A'}
                            </p>
                        </div>

                        {/* Row 5 & 6: Father Name & Mobile */}
                        <div className="text-[10px] text-slate-500 space-y-1">
                            <p className="font-bold uppercase tracking-tight leading-tight">
                                {data.gender?.toLowerCase() === 'female' ? 'D/O' : 'S/O'}: {data.fatherName}
                            </p>
                            <p className="font-bold uppercase tracking-tight leading-tight">MOB: {data.mobileNo}</p>
                        </div>
                    </div>

                    {/* Right Column Data (Token/Room/Dept) */}
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col justify-center space-y-1">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[6px] text-slate-400 font-black">TOKEN</p>
                                <p className="text-2xl font-black text-primary leading-none">{token}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[6px] text-slate-400 font-black">ROOM</p>
                                <p className="text-base font-black text-slate-800 leading-none">{room}</p>
                            </div>
                        </div>
                        <div className="pt-1 border-t border-slate-200">
                             <p className="text-[9px] font-black text-slate-800 truncate">{data.department || "GENERAL MEDICINE"}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Section: Metadata Row */}
                <div className="mt-1 pt-1 border-t border-slate-100 flex justify-between items-center px-1">
                    <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">{data.hospitalName}</p>
                    <p className="text-[8px] font-bold text-slate-400 italic bg-yellow-50 px-2 rounded tracking-normal">NOT FOR MLC PURPOSE</p>
                </div>

                {/* Dedicated Barcode Row (Prevent Overlap) */}
                <div className="flex flex-col items-center w-full mt-1 border-t border-dashed border-slate-100 pt-1">
                    <span className="barcode font-normal text-slate-800 leading-none text-[20px] whitespace-nowrap">
                        *{data.patientId}*
                    </span>
                    <p className="text-[6px] font-mono text-slate-300 mt-0.5 tracking-[0.2em]">{data.patientId}</p>
                </div>
            </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 bg-slate-50 flex justify-between gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-2xl transition-all uppercase text-xs tracking-widest"
          >
            Close
          </button>
          <button 
            onClick={handlePrint}
            className="flex-[2] btn-gradient py-3 text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Print OPD Slip
          </button>
        </div>

      </div>
    </div>
  );
}
