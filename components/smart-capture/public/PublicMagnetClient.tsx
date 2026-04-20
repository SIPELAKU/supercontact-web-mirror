"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Mail,
  Phone,
  User,
  Globe,
  ShieldCheck,
  FileText,
  AlertCircle
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import { notify } from "@/lib/notifications";
import { usePublicSmartCapture } from "@/lib/hooks/usePublicSmartCapture";
import { AppButton } from "@/components/ui/app-button";

/**
 * Helper to map field names to appropriate Lucide icons
 */
const getFieldIcon = (fieldName: string) => {
  const name = fieldName.toLowerCase();
  if (name.includes('phone') || name.includes('whatsapp') || name === 'phones') return Phone;
  if (name.includes('email')) return Mail;
  if (name.includes('name') || name === 'fullname') return User;
  return FileText;
};

export default function PublicMagnetClient() {
  const params = useParams();
  const code = params.id as string; // The route is /m/[id], where id is the code

  const { data: response, isLoading: loading, error, submit } = usePublicSmartCapture(code);
  const magnet = response?.data;

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Format data for the backend: { fields: [ { name, value }, ... ] }
      const fields = Object.entries(formValues).map(([name, value]) => ({
        name,
        value
      }));

      await submit.mutateAsync({ fields });

      setSubmitted(true);
      notify.success("Terima kasih! File Anda sedang dikirim ke email.");
    } catch (err: any) {
      notify.error(err.message || "Gagal mengirim data. Silakan coba lagi.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <CircularProgress size={40} thickness={4} sx={{ color: '#5479EE' }} />
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Menyiapkan akses magnet...</p>
      </div>
    );
  }

  if (error || !magnet) {
    return (
      <div className="min-h-screen bg-white md:bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Gagal</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Maaf, lead magnet tidak ditemukan atau sudah tidak aktif.
          </p>
        </div>
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
            Silakan periksa email Anda (termasuk folder spam) untuk mengunduh <strong>{magnet.form_title || magnet.name}</strong>.
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
        <div className="w-12 h-12 rounded-lg flex items-center justify-center">
          <img src="/assets/logo3d.png" alt="SmartSales" className="h-10" />
        </div>
        <span className="text-sm font-bold text-gray-900 tracking-tight">SmartSales Capture</span>
      </div>

      <div className="max-w-[480px] w-full bg-white rounded-3xl md:shadow-[0_20px_50px_rgba(84,121,238,0.1)] border-0 md:border border-gray-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Visual Top Bar / Gradient */}
        <div className="h-2 bg-linear-to-r from-blue-400 via-indigo-500 to-purple-500" />

        <div className="p-8 md:p-10">
          {/* Magnet Info */}
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-blue-50 text-[#5479EE] text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
              Instant Access
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              {magnet.form_title || magnet.name}
            </h1>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {magnet.form_description || "Dapatkan akses instan ke resource ini dengan mengisi form di bawah."}
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {magnet.form_fields?.sort((a, b) => a.sort_order - b.sort_order).map((field) => {
              const Icon = getFieldIcon(field.name);
              const fieldId = `field-${field.name}`;
              const fieldType = field.field_type || field.type || 'text';
              const value = formValues[field.name] || '';

              return (
                <div key={field.id || field.name} className="space-y-2 group">
                  <label htmlFor={fieldId} className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-[#5479EE] transition-colors">
                    {field.label} {field.required && '*'}
                  </label>

                  {/* Poly-Input Renderer */}
                  {fieldType === 'textarea' ? (
                    <div className="relative">
                      <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#5479EE] transition-colors">
                        <FileText size={18} />
                      </div>
                      <textarea
                        id={fieldId}
                        required={field.required}
                        placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                        value={value}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5479EE]/20 focus:border-[#5479EE] focus:bg-white transition-all placeholder:text-gray-300 min-h-[100px] resize-none"
                      />
                    </div>
                  ) : fieldType === 'dropdown' ? (
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5479EE] transition-colors z-10 pointer-events-none">
                        <Globe size={18} />
                      </div>
                      <select
                        id={fieldId}
                        required={field.required}
                        value={value}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5479EE]/20 focus:border-[#5479EE] focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Pilih {field.label.toLowerCase()}...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  ) : fieldType === 'radio' ? (
                    <div className="grid grid-cols-1 gap-2">
                      {field.options?.map((opt) => (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${value === opt
                            ? 'bg-blue-50 border-blue-200 text-[#5479EE] shadow-sm'
                            : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200'
                            }`}
                        >
                          <input
                            type="radio"
                            name={field.name}
                            value={opt}
                            required={field.required}
                            checked={value === opt}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-4 h-4 text-[#5479EE] border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : fieldType === 'checkbox' ? (
                    <div className="grid grid-cols-1 gap-2">
                      {field.options?.map((opt) => {
                        const values = value ? value.split(', ') : [];
                        const isChecked = values.includes(opt);

                        const handleToggle = () => {
                          let newValues;
                          if (isChecked) {
                            newValues = values.filter(v => v !== opt);
                          } else {
                            newValues = [...values, opt];
                          }
                          handleInputChange(field.name, newValues.join(', '));
                        };

                        return (
                          <label
                            key={opt}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${isChecked
                              ? 'bg-blue-50 border-blue-200 text-[#5479EE] shadow-sm'
                              : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={handleToggle}
                              className="w-4 h-4 text-[#5479EE] rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5479EE] transition-colors">
                        <Icon size={18} />
                      </div>
                      <input
                        id={fieldId}
                        name={field.name}
                        type={fieldType === 'email' ? 'email' : fieldType === 'number' ? 'number' : 'text'}
                        required={field.required}
                        placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                        value={value}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5479EE]/20 focus:border-[#5479EE] focus:bg-white transition-all placeholder:text-gray-300"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              disabled={submit.isPending}
              className="w-full mt-6 bg-[#5479EE] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-[#3F66E0] hover:shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {submit.isPending ? (
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
        Powered by <img src="/assets/logo3d.png" alt="SmartSales" className="h-3.5 grayscale opacity-50" />
      </p>

    </div>
  );
}
