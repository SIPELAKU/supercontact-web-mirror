"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { CompanyAbout, CompanyDetailStats, CompanyKeyPeopleCard, OrganizationStructureCard, RecentSignals, CompanyDocumentsCard } from "@/components/omnichannel";
import PageHeader from "@/components/ui/page-header";

import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, Box, IconButton } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { FileText, X, Upload } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import {
  fetchCompanyProfile,
  fetchCompanyProfileKeyPeople,
  fetchCompanyProfileOrganizationStructure,
  uploadCompanyDocument,
  fetchCompanyDocuments,
  deleteCompanyDocument,
  fetchRecentSignals,
  addRecentSignal,
} from "@/lib/api/company-profile";
import type { CompanyProfileData, CompanyProfileKeyPerson, CompanyDocument, CompanySignal } from "@/lib/types/company-profile";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { formatDistanceToNow } from "date-fns";

const DOT_COLOR_MAP: Record<string, string> = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
};

export default function CompanyProfileClient() {
  const { getToken } = useAuth();
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [keyPeople, setKeyPeople] = useState<CompanyProfileKeyPerson[]>([]);
  const [departmentsCount, setDepartmentsCount] = useState<number>(0);

  // Data states
  // Data states
  const [signals, setSignals] = useState<CompanySignal[]>([]);
  const [isSignalsLoading, setIsSignalsLoading] = useState(true);

  // Modal states
  const [isAddSignalOpen, setAddSignalOpen] = useState(false);
  const [isViewAllSignalsOpen, setViewAllSignalsOpen] = useState(false);
  const [isEditDocsOpen, setEditDocsOpen] = useState(false);
  const [isViewPdfOpen, setViewPdfOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CompanyDocument | null>(null);

  // Form states
  const [newSignal, setNewSignal] = useState<{ title: string; description: string; timePosted: Date | null }>({
    title: "",
    description: "",
    timePosted: new Date(),
  });

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document management states
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCompanyProfile = async () => {
      setIsloading(true);
      setError("");
      try {
        const token = await getToken();
        const [profileData, keyPeopleData, organizationData, signalsData] = await Promise.all([
          fetchCompanyProfile(token),
          fetchCompanyProfileKeyPeople(token, 1, 12),
          fetchCompanyProfileOrganizationStructure(token),
          fetchRecentSignals(token),
        ]);

        if (!isMounted) return;
        setProfile(profileData);
        setKeyPeople(keyPeopleData);
        setDepartmentsCount(organizationData.departmentsCount);
        setSignals(signalsData);
        setIsSignalsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load company profile");
      } finally {
        if (isMounted) setIsloading(false);
      }
    };

    loadCompanyProfile();
    return () => {
      isMounted = false;
    };
  }, [getToken]);

  const loadDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const token = await getToken();
      const docs = await fetchCompanyDocuments(token);
      setDocuments(docs);
    } catch (error: any) {
      console.error('Failed to load documents:', error);
      notify.error(error.message || 'Failed to load documents');
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [getToken]);

  const company = useMemo(() => {
    if (profile) return profile;
    return {
      name: "Company Profile",
      description: "Company profile information is not available.",
      tags: [] as string[],
      founded: "-",
      headquarters: "-",
      employees: "-",
      status: "-",
      aiSummary: {
        description: "AI summary is not available.",
        tags: [] as string[],
      },
      stats: [],
    };
  }, [profile]);

  const keyPeopleList = useMemo(
    () =>
      keyPeople.map((person) => ({
        id: person.id,
        name: person.name,
        title: person.title || "-",
        avatarUrl: person.avatarUrl,
      })),
    [keyPeople]
  );

  const handleViewPdf = (doc: CompanyDocument) => {
    setSelectedDoc(doc);
    setViewPdfOpen(true);
  };

  const handleAddSignal = async () => {
    if (!newSignal.title || !newSignal.description) return;

    try {
      const token = await getToken();
      await addRecentSignal(token, {
        signal_title: newSignal.title,
        description: newSignal.description,
        time_posted: newSignal.timePosted ? newSignal.timePosted.toISOString() : new Date().toISOString(),
      });

      notify.success("Signal added successfully");
      setNewSignal({ title: "", description: "", timePosted: new Date() });
      setAddSignalOpen(false);

      // Refresh signals
      const updatedSignals = await fetchRecentSignals(token);
      setSignals(updatedSignals);
    } catch (err: any) {
      notify.error(err.message || "Failed to add signal");
    }
  };



  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      notify.error('Only PDF files are allowed');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      notify.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      notify.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const token = await getToken();
      await uploadCompanyDocument(token, selectedFile);
      notify.success('Document uploaded successfully');
      setSelectedFile(null);
      setEditDocsOpen(false);
      // Refresh document list
      await loadDocuments();
    } catch (error: any) {
      notify.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    setIsDeleting(true);
    try {
      const token = await getToken();
      await deleteCompanyDocument(token, documentId);
      notify.success('Document deleted successfully');
      setDocumentToDelete(null);
      // Refresh document list
      await loadDocuments();
    } catch (error: any) {
      notify.error(error.message || 'Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title={company.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Company Profile" }
        ]}
      />

      <div className="mt-[63px] grid grid-cols-[repeat(auto-fit,minmax(267px,1fr))] gap-5">
        <CompanyDetailStats stats={company.stats} />
      </div>

      <div className="grid grid-cols-12 gap-6 mt-[63px]">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <CompanyAbout
            isLoading={isLoading}
            companyName={company.name}
            description={company.description}
            tags={company.tags}
            yearsFounded={company.founded}
            headquarters={company.headquarters}
            employees={company.employees}
            status={company.status}
          />
          <RecentSignals
            isLoading={isSignalsLoading}
            RECENT_SIGNALS={signals}
            onAdd={() => setAddSignalOpen(true)}
            onViewAll={() => setViewAllSignalsOpen(true)}
          />
          <CompanyDocumentsCard
            documents={documents}
            isLoading={isLoadingDocuments}
            onEdit={() => setEditDocsOpen(true)}
            onView={handleViewPdf}
          />
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <OrganizationStructureCard
            departmentsCount={departmentsCount}
            viewAllHref="/organization"
          />
          <CompanyKeyPeopleCard
            isLoading={isLoading}
            people={keyPeopleList}
            viewAllHref="/admin/company-profile/key-people"
          />
        </div>
      </div>

      {error && (
        <Typography className="text-sm! text-red-500!">{error}</Typography>
      )}


      {/* --- ADD SIGNAL MODAL --- */}
      <Dialog open={isAddSignalOpen} onClose={() => setAddSignalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Add Recent Signal</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SIGNAL TITLE</Typography>
              <AppInput
                fullWidth
                placeholder="e.g. New Office Opened"
                isBgWhite
                value={newSignal.title}
                onChange={(e) => setNewSignal({ ...newSignal, title: e.target.value })}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>DESCRIPTION</Typography>
              <AppInput
                fullWidth
                multiline
                rows={3}
                height="auto"
                placeholder="Provide details about the signal..."
                isBgWhite
                value={newSignal.description}
                onChange={(e) => setNewSignal({ ...newSignal, description: e.target.value })}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TIME POSTED</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={newSignal.timePosted}
                  onChange={(newValue: Date | null) => setNewSignal({ ...newSignal, timePosted: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <AppButton variantStyle="outline" color="gray" onClick={() => setAddSignalOpen(false)}>Cancel</AppButton>
          <AppButton onClick={handleAddSignal}>Add Signal</AppButton>
        </DialogActions>
      </Dialog>
      {/* --- EDIT DOCUMENTS MODAL --- */}
      <Dialog open={isEditDocsOpen} onClose={() => setEditDocsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Company Documents</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                p: 3,
                border: isDragging ? '2px dashed #3b82f6' : '2px dashed #e2e8f0',
                borderRadius: 2,
                textAlign: 'center',
                bgcolor: isDragging ? '#eff6ff' : '#f8fafc',
                transition: 'all 0.2s'
              }}
            >
              <Upload className="mx-auto mb-2 text-slate-400" size={32} />
              <Typography variant="body2" color="text.secondary" mb={2}>
                Drag and drop new documents here or click to upload
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <AppButton
                variantStyle="outline"
                size="small"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload File
              </AppButton>
              {selectedFile && (
                <Box mt={2} p={1.5} bgcolor="white" borderRadius={1} border="1px solid #e2e8f0">
                  <Typography variant="caption" fontWeight={500} color="primary">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                </Box>
              )}
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} mb={1.5}>Current Documents</Typography>
              {isLoadingDocuments ? (
                <Typography variant="caption" color="text.secondary">Loading documents...</Typography>
              ) : documents.length === 0 ? (
                <Typography variant="caption" color="text.secondary">No documents uploaded yet</Typography>
              ) : (
                <Stack spacing={1}>
                  {documents.map((doc) => (
                    <Box
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200"
                    >
                      <Box className="flex-1">
                        <Typography variant="caption" fontWeight={500} display="block">
                          {doc.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                          {doc.filename}
                        </Typography>
                      </Box>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setDocumentToDelete(doc.id)}
                      >
                        <X size={16} />
                      </button>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <AppButton variantStyle="outline" color="gray" onClick={() => setEditDocsOpen(false)}>Cancel</AppButton>
          <AppButton
            onClick={handleUploadDocument}
            isLoading={isUploading}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </AppButton>
        </DialogActions>
      </Dialog>

      {/* --- VIEW PDF MODAL --- */}
      <Dialog open={isViewPdfOpen} onClose={() => setViewPdfOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box className="flex items-center justify-between">
            <Typography variant="h6">{selectedDoc?.title}</Typography>
            <button onClick={() => setViewPdfOpen(false)}><X size={20} /></button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedDoc?.fileUrl ? (
            <Box sx={{ width: '100%', height: '70vh', position: 'relative' }}>
              <iframe
                src={selectedDoc.fileUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px'
                }}
                title={selectedDoc.filename}
              />
            </Box>
          ) : (
            <Box sx={{ minHeight: 400, bgcolor: '#f1f5f9', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 4 }}>
              <FileText size={64} className="text-slate-400" />
              <Typography variant="h6" color="text.secondary">No preview available</Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                The document URL is not available for preview.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {selectedDoc?.fileUrl && (
            <AppButton
              variantStyle="outline"
              onClick={() => window.open(selectedDoc.fileUrl, '_blank')}
            >
              Open in New Tab
            </AppButton>
          )}
          <AppButton onClick={() => setViewPdfOpen(false)}>Close Preview</AppButton>
        </DialogActions>
      </Dialog>

      {/* --- DELETE CONFIRMATION POPUP --- */}
      <ConfirmationPopup
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={() => documentToDelete && handleDeleteDocument(documentToDelete)}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
      {/* --- VIEW ALL SIGNALS MODAL --- */}
      <Dialog open={isViewAllSignalsOpen} onClose={() => setViewAllSignalsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>All Recent Signals</Typography>
          <IconButton onClick={() => setViewAllSignalsOpen(false)}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div className="space-y-6">
            {signals.map((item, index) => (
              <div key={item.id} className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="relative mt-1">
                    <span className={`block h-2.5 w-2.5 rounded-full ${DOT_COLOR_MAP[item.dotColor || 'green']}`} />
                  </div>

                  <div className="space-y-1">
                    <Typography className="text-sm! font-semibold! text-slate-900!">{item.signal_title}</Typography>
                    <Typography className="text-xs! text-slate-600!">{item.description}</Typography>
                  </div>
                </div>

                <Typography className="whitespace-nowrap text-[12px]! text-slate-500!">
                  {(() => {
                    try {
                      return formatDistanceToNow(new Date(item.time_posted), { addSuffix: true });
                    } catch (e) {
                      return item.time_posted;
                    }
                  })()}
                </Typography>
              </div>
            ))}
            {signals.length === 0 && (
              <Typography className="text-center text-slate-500 py-8">No signals found.</Typography>
            )}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <AppButton onClick={() => setViewAllSignalsOpen(false)}>Close</AppButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
