import { Plus, CheckCircle2, Circle } from 'lucide-react';

export default function DynamicFormTab() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Form Builder Column */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Form Builder</h2>

        <div className="space-y-4">
          {/* Header Form */}
          <div className="p-4 border border-gray-200 rounded-xl space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Header Form</h3>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Form Title</label>
              <input
                type="text"
                defaultValue="Template SOP Sales 2026"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Short Description</label>
              <textarea
                defaultValue="Please complete the data below to get instant access to the document for free."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] min-h-[80px]"
              />
            </div>
          </div>

          {/* Form Fields Mapping */}
          <div className="space-y-3">
            {[
              { id: '1', label: 'Full Name', required: true },
              { id: '2', label: 'Company Email', required: true },
              { id: '3', label: 'WhatsApp Number', required: true },
              { id: '4', label: 'Company Name', required: false },
            ].map((field) => (
              <div key={field.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors">
                <span className="font-medium text-sm text-gray-800">{field.label}</span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">System Default</span>
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    {field.required ? (
                      <CheckCircle2 className="w-5 h-5 text-[#5479EE]" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                    <span className={`text-sm ${field.required ? 'text-gray-700' : 'text-gray-400'}`}>Required</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Field Button */}
            <button className="w-full py-3 border-2 border-dashed border-[#5479EE]/40 text-[#5479EE] hover:bg-[#5479EE]/5 rounded-xl flex justify-center items-center gap-2 font-medium text-sm transition-colors mt-2">
              <Plus size={16} />
              Add New Question
            </button>
          </div>

        </div>
      </div>

      {/* Live Preview Column */}
      <div className="w-full lg:w-[400px] shrink-0">
        <div className="sticky top-6 bg-gray-50/50 rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Live Preview</h3>
            
            {/* Card Preview Frame */}
            <div className="w-full bg-white rounded-2xl border-4 border-blue-50/80 shadow-md p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Template SOP Sales 2026</h4>
                <p className="text-sm text-gray-600 mb-6">Please complete the data below to get instant access to the document for free.</p>

                <div className="space-y-4">
                  <input type="text" placeholder="Full Name *" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50/50 placeholder-gray-400" />
                  <input type="email" placeholder="Company Email *" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50/50 placeholder-gray-400" />
                  <input type="tel" placeholder="WhatsApp Number *" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50/50 placeholder-gray-400" />
                  <input type="text" placeholder="Company Name" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50/50 placeholder-gray-400" />
                  
                  <button className="w-full mt-2 bg-[#5479EE] text-white py-2.5 rounded-lg font-medium text-sm shadow-sm hover:bg-[#3F66E0] transition-colors">
                    Get It Now
                  </button>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}
