"use client";

import { useState } from "react";
import { AiIntelligenceSummary, CompanyAbout, CompanyDetailStats, CompanyKeyPeopleCard, OrganizationStructureCard, RecentSignals, CompanyDocumentsCard } from "@/components/omnichannel";
import PageHeader from "@/components/ui/page-header";
import { RECENT_SIGNALS } from "@/lib/data/recent-signals";
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, Box } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { FileText, X } from "lucide-react";

export default function CompanyProfileClient() {
  const [isLoading, setIsloading] = useState<boolean>(false);

  // Data states
  const [signals, setSignals] = useState(RECENT_SIGNALS);

  // Modal states
  const [isAddSignalOpen, setAddSignalOpen] = useState(false);
  const [isEditDocsOpen, setEditDocsOpen] = useState(false);
  const [isViewPdfOpen, setViewPdfOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ title: string; filename: string } | null>(null);

  // Form states
  const [newSignal, setNewSignal] = useState({ title: "", description: "", timePosted: "Just now" });

  // Solvera company data
  const solveraCompany = {
    name: "Solvera",
    description: "Solvera is a leading technology company specializing in innovative software solutions and digital transformation services. We help businesses streamline their operations and achieve their digital goals through cutting-edge technology and expert consulting.",
    tags: ["Technology", "Software Development", "Digital Transformation", "Consulting", "Innovation"],
    founded: "2015",
    headquarters: "Jakarta, Indonesia",
    employees: "150-200",
    status: "Active" as const
  };

  const solveraAiSummary = {
    description: "Solvera is a dynamic technology company focused on delivering comprehensive software solutions and digital transformation services. With a strong presence in the Indonesian market, the company has established itself as a trusted partner for businesses seeking to modernize their operations and embrace digital innovation.",
    tags: ["Tech Leader", "Digital Innovation", "Growth Stage", "B2B Focus"]
  };

  const handleViewPdf = (doc: { title: string; filename: string }) => {
    setSelectedDoc(doc);
    setViewPdfOpen(true);
  };

  const handleAddSignal = () => {
    if (!newSignal.title || !newSignal.description) return;

    const signalToAdd = {
      id: Date.now(),
      title: newSignal.title,
      description: newSignal.description,
      timePosted: newSignal.timePosted,
      dotColor: "green" as const
    };

    setSignals([signalToAdd, ...signals]);
    setNewSignal({ title: "", description: "", timePosted: "Just now" });
    setAddSignalOpen(false);
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Solvera"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Company Profile" }
        ]}
      />

      <AiIntelligenceSummary
        description={solveraAiSummary.description}
        tags={solveraAiSummary.tags}
      />

      <div className="mt-[63px] grid grid-cols-[repeat(auto-fit,minmax(267px,1fr))] gap-5">
        <CompanyDetailStats />
      </div>

      <div className="grid grid-cols-12 gap-6 mt-[63px]">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <CompanyAbout
            isLoading={isLoading}
            companyName={solveraCompany.name}
            description={solveraCompany.description}
            tags={solveraCompany.tags}
            yearsFounded={solveraCompany.founded}
            headquarters={solveraCompany.headquarters}
            employees={solveraCompany.employees}
            status={solveraCompany.status}
          />
          <RecentSignals
            isLoading={isLoading}
            RECENT_SIGNALS={signals}
            onAdd={() => setAddSignalOpen(true)}
          />
          <CompanyDocumentsCard
            onEdit={() => setEditDocsOpen(true)}
            onView={handleViewPdf}
          />
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <OrganizationStructureCard />
          <CompanyKeyPeopleCard isLoading={isLoading} />
        </div>
      </div>

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
              <AppInput
                fullWidth
                placeholder="e.g. Just now, 2 hours ago"
                isBgWhite
                value={newSignal.timePosted}
                onChange={(e) => setNewSignal({ ...newSignal, timePosted: e.target.value })}
              />
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
            <Box sx={{ p: 2, border: '1px dashed #e2e8f0', borderRadius: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
              <Typography variant="body2" color="text.secondary">Drag and drop new documents here or click to upload</Typography>
              <AppButton variantStyle="outline" size="small" sx={{ mt: 1 }}>Upload File</AppButton>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} mb={1}>Current Documents</Typography>
              <Stack spacing={1}>
                <Box className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <Typography variant="caption" fontWeight={500}>NIB_Solvera.pdf</Typography>
                  <button className="text-red-500 hover:text-red-700"><X size={14} /></button>
                </Box>
                <Box className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <Typography variant="caption" fontWeight={500}>NPWP_Solvera.pdf</Typography>
                  <button className="text-red-500 hover:text-red-700"><X size={14} /></button>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <AppButton variantStyle="outline" onClick={() => setEditDocsOpen(false)}>Cancel</AppButton>
          <AppButton onClick={() => setEditDocsOpen(false)}>Save Changes</AppButton>
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
        <DialogContent>
          <Box sx={{ minHeight: 400, bgcolor: '#f1f5f9', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 4 }}>
            <FileText size={64} className="text-slate-400" />
            <Typography variant="h6" color="text.secondary">PDF Preview: {selectedDoc?.filename}</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              This is a dummy PDF viewer placeholder. In a production environment, this would render the actual PDF document using a library like react-pdf or a native iframe.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <AppButton onClick={() => setViewPdfOpen(false)}>Close Preview</AppButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
