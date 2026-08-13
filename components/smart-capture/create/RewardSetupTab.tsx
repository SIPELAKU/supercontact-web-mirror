import { useState, useRef, useMemo } from 'react';
import { Upload, X, File as FileIcon, Loader2, Eye } from 'lucide-react';
import Cookies from 'js-cookie';

import { AppButton } from '@/components/ui/app-button';
import { AppSelect } from '@/components/ui/app-select';
import { SmartCaptureCreateReq, SmartCaptureFile } from '@/lib/models/types';
import { uploadSmartCaptureFiles, deleteSmartCaptureFiles } from '@/lib/api';
import { useMailSenders } from '@/lib/hooks/useMailSenders';
import { useAuth } from '@/lib/context/AuthContext';
import { buildGroupedMailSenderOptions } from '@/lib/utils/mailSenderOptions';
import { notify } from '@/lib/notifications';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddMailSenderDialog from '@/components/email-marketing/campaigns/modals/AddMailSenderDialog';

interface RewardSetupTabProps {
  formData: SmartCaptureCreateReq;
  updateFormData: (updates: Partial<SmartCaptureCreateReq>) => void;
  initialFiles?: SmartCaptureFile[];
}

export default function RewardSetupTab({ 
  formData, 
  updateFormData,
  initialFiles = []
}: RewardSetupTabProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<SmartCaptureFile[]>(initialFiles);
  const [previewFile, setPreviewFile] = useState<SmartCaptureFile | null>(null);
  const [isAddMailSenderOpen, setIsAddMailSenderOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { userProfile } = useAuth();
  const { data: mailSendersData, isLoading: isLoadingMailSenders } = useMailSenders();
  const mailSenders = mailSendersData?.data?.mail_senders || [];
  const mailSenderOptions = useMemo(
    () => buildGroupedMailSenderOptions(mailSenders, userProfile?.id, formData.mail_sender_id),
    [mailSenders, userProfile?.id, formData.mail_sender_id]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const token = Cookies.get('access_token') as string;
      const response = await uploadSmartCaptureFiles(token, Array.from(files));
      
      if (response.success) {
        const newFiles = response.data.files;
        setUploadedFiles(prev => [...prev, ...newFiles]);
        
        const newFileIds = newFiles.map((f: SmartCaptureFile) => f.id);
        updateFormData({ 
          file_ids: [...(formData.file_ids || []), ...newFileIds] 
        });
        
        notify.success("File uploaded successfully");
      }
    } catch (error: any) {
      notify.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = async (id: string) => {
    try {
      const token = Cookies.get('access_token') as string;
      await deleteSmartCaptureFiles(token, [id]);
      
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
      updateFormData({ 
        file_ids: (formData.file_ids || []).filter(fid => fid !== id) 
      });
      notify.success("File removed");
    } catch (error: any) {
      notify.error("Failed to remove file");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Reward (Lead Magnet) Setup</h2>

      <div className="space-y-6">
        {/* Mail Sender Selection */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Mail Sender</label>
            <AppButton
              size="small"
              onClick={() => setIsAddMailSenderOpen(true)}
              variantStyle="text"
              color="primary"
              className="text-xs p-0 min-h-0 h-auto font-semibold"
            >
              + Add New Mail Sender
            </AppButton>
          </div>
          <AppSelect
            placeholder={isLoadingMailSenders ? "Loading mail senders..." : "Select Mail Sender"}
            value={formData.mail_sender_id || ''}
            onChange={(e) => updateFormData({ mail_sender_id: e.target.value as string })}
            options={mailSenderOptions}
            isBgWhite
          />
        </div>

        {/* Campaign Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Campaign / Form Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] placeholder-gray-400"
            placeholder="e.g., Sales Strategy Ebook"
          />
        </div>

        {/* File Asset Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Asset File (Sent automatically via Email)</label>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple
          />

          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
              {isUploading ? <Loader2 className="text-[#5479EE] w-5 h-5 animate-spin" /> : <Upload className="text-gray-500 w-5 h-5" />}
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {isUploading ? "Uploading files..." : "Choose a file or drag & drop it here"}
            </h4>
            <p className="text-xs text-gray-500 mb-4">PDF, DOCX, or ZIP (Max 10MB)</p>
            <AppButton variantStyle="outline" color="primary" className="rounded-lg px-6 shadow-sm bg-white" disabled={isUploading}>
              Browse File
            </AppButton>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-sm">
                  <div className="flex items-center gap-3">
                    <FileIcon size={18} className="text-[#5479EE]" />
                    <div>
                      <p className="font-medium text-gray-900">{file.file_name}</p>
                      <p className="text-xs text-gray-500">{(file.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPreviewFile(file)}
                      className="text-gray-400 hover:text-[#5479EE] transition-colors p-1.5 hover:bg-blue-50 rounded-lg"
                      title="View media"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => removeFile(file.id)} 
                      className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto Responder Email */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700">Delivery Email (Auto-Responder)</label>
          <input
            type="text"
            value={formData.email_subject}
            onChange={(e) => updateFormData({ email_subject: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] placeholder-gray-400"
            placeholder="Subject: Here is what you requested..."
          />
          <textarea
            value={formData.email_body}
            onChange={(e) => updateFormData({ email_body: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] placeholder-gray-400 min-h-[120px]"
            placeholder="Hello {{name}}, here is the file you requested..."
          ></textarea>
        </div>
      </div>

      {/* Media Preview Modal */}
      <Dialog 
        open={!!previewFile} 
        onOpenChange={(open) => !open && setPreviewFile(null)}
        maxWidth="md"
      >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{previewFile?.file_name}</DialogTitle>
        </DialogHeader>
        <DialogContent className="p-6 pt-0">
          <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center min-h-[300px] max-h-[70vh]">
            {previewFile && (
              <>
                {previewFile.mime_type?.startsWith('image/') ? (
                  <img 
                    src={previewFile.file_url} 
                    alt={previewFile.file_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : previewFile.mime_type === 'application/pdf' ? (
                  <iframe 
                    src={previewFile.file_url} 
                    className="w-full h-[60vh]"
                    title={previewFile.file_name}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-5 p-12 text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100">
                      <FileIcon size={40} className="text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Preview not available</h4>
                      <p className="text-sm text-gray-500 mb-6">This file type cannot be previewed directly in the browser.</p>
                      <AppButton 
                        variantStyle="primary" 
                        onClick={() => window.open(previewFile.file_url, '_blank')}
                        className="rounded-xl px-8"
                      >
                        Download / View in New Tab
                      </AppButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddMailSenderDialog
        open={isAddMailSenderOpen}
        onClose={() => setIsAddMailSenderOpen(false)}
        onSuccess={(sender) => {
          updateFormData({ mail_sender_id: sender.id });
        }}
      />
    </div>
  );
}
