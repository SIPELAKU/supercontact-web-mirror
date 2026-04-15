"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, ChevronRight, Mail, Phone, User, Globe, ShieldCheck } from "lucide-react";
import { CircularProgress } from "@mui/material";
import { notify } from "@/lib/notifications";

// Mock Data (Consistent with detail and edit pages)
const MOCK_LEAD_MAGNETS = [
  { 
    id: '1', 
    name: 'Template SOP Sales 2026', 
    description: 'Dapatkan framework lengkap untuk membangun tim sales yang performa tinggi dan konsisten mencapai target.',
    fields: [
        { id: '1', label: 'Nama Lengkap', type: 'text', placeholder: 'John Doe', icon: User, required: true },
        { id: '2', label: 'Email Bisnis', type: 'email', placeholder: 'john@company.com', icon: Mail, required: true },
        { id: '3', label: 'Nomor WhatsApp', type: 'tel', placeholder: '0812xxxx', icon: Phone, required: true },
    ]
  },
  { 
    id: '2', 
    name: 'E-book: Cold Calling Script', 
    description: 'Panduan praktis melakukan cold calling yang tidak membosankan dan meningkatkan rasio closing Anda.',
    fields: [
        { id: '1', label: 'Nama Lengkap', type: 'text', placeholder: 'John Doe', icon: User, required: true },
        { id: '2', label: 'Email Bisnis', type: 'email', placeholder: 'john@company.com', icon: Mail, required: true },
    ]
  },
  { 
    id: '3', 
    name: 'Kalkulator ROI B2B', 
    description: 'Hitung potensi keuntungan investasi layanan Anda dengan kalkulator presisi untuk presentasi klien.',
    fields: [
        { id: '1', label: 'Nama Lengkap', type: 'text', placeholder: 'John Doe', icon: User, required: true },
        { id: '2', label: 'Email Bisnis', type: 'email', placeholder: 'john@company.com', icon: Mail, required: true },
    ]
  },
];

export default function PublicMagnetClient() {
  const params = useParams();
  const id = params.id as string;

  const [magnet, setMagnet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      const found = MOCK_LEAD_MAGNETS.find(m => m.id === id) || MOCK_LEAD_MAGNETS[0];
      setMagnet(found);
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      notify.success("Terima kasih! File Anda sedang dikirim ke email.");
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <CircularProgress size={40} thickness={4} sx={{ color: '#5479EE' }} />
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Menyiapkan akses magnet...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white md:bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Berhasil Terkirim!</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Silakan periksa email Anda (termasuk folder spam) untuk mengunduh <strong>{magnet.name}</strong>.
          </p>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 text-left">
             <ShieldCheck className="text-blue-500 shrink-0" size={20} />
             <p className="text-xs text-gray-500 italic">Link akses ini bersifat pribadi dan aman. Jangan bagikan link download Anda.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-[#F8FAFC] flex flex-col items-center justify-center py-12 px-4 selection:bg-blue-100">
      
      {/* Branding Header (Optional) */}
      <div className="mb-8 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 bg-[#5479EE] rounded-lg flex items-center justify-center text-white">
            <Globe size={18} />
        </div>
        <span className="text-sm font-bold text-gray-900 tracking-tight">SmartSales Capture</span>
      </div>

      <div className="max-w-[480px] w-full bg-white rounded-3xl md:shadow-[0_20px_50px_rgba(84,121,238,0.1)] border-0 md:border border-gray-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Visual Top Bar / Gradient */}
        <div className="h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
        
        <div className="p-8 md:p-10">
            {/* Magnet Info */}
            <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 bg-blue-50 text-[#5479EE] text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                    Instant Access
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                    {magnet.name}
                </h1>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    {magnet.description}
                </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {magnet.fields.map((field: any) => {
                    const Icon = field.icon;
                    return (
                        <div key={field.id} className="space-y-1.5 group">
                            <label className="text-xs font-semibold text-gray-500 ml-1 group-focus-within:text-[#5479EE] transition-colors">
                                {field.label} {field.required && '*'}
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5479EE] transition-colors">
                                    <Icon size={18} />
                                </div>
                                <input
                                    type={field.type}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5479EE]/20 focus:border-[#5479EE] focus:bg-white transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>
                    );
                })}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-[#5479EE] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-[#3F66E0] hover:shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <>
                            <CircularProgress size={18} thickness={5} sx={{ color: 'white' }} />
                            <span>Memproses...</span>
                        </>
                    ) : (
                        <>
                            <span>Dapatkan Akses Sekarang</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-8 text-center text-xs text-gray-400 font-medium">
                🔒 Data Anda aman dan hanya digunakan untuk keperluan pengiriman aset ini.
            </p>
        </div>
      </div>
      
      {/* Footer Branding */}
      <p className="mt-12 text-xs text-gray-400 font-medium flex items-center gap-1.5">
        Powered by <img src="/assets/sc-logo.png" alt="SmartSales" className="h-3.5 grayscale opacity-50" />
      </p>

    </div>
  );
}
