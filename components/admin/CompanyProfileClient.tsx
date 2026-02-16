"use client";

import { useEffect, useMemo, useState } from "react";
import { CompanyAbout, CompanyDetailStats, CompanyKeyPeopleCard, OrganizationStructureCard, RecentSignals, CompanyDocumentsCard } from "@/components/omnichannel";
import PageHeader from "@/components/ui/page-header";
import { RECENT_SIGNALS } from "@/lib/data/recent-signals";
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, Box } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { FileText, X } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  fetchCompanyProfile,
  fetchCompanyProfileKeyPeople,
  fetchCompanyProfileOrganizationStructure,
} from "@/lib/api/company-profile";
import type { CompanyProfileData, CompanyProfileKeyPerson } from "@/lib/types/company-profile";

export default function CompanyProfileClient() {
  const { getToken } = useAuth();
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [keyPeople, setKeyPeople] = useState<CompanyProfileKeyPerson[]>([]);
  const [departmentsCount, setDepartmentsCount] = useState<number>(0);

  // Data states
  const [signals, setSignals] = useState(RECENT_SIGNALS);

  // Modal states
  const [isAddSignalOpen, setAddSignalOpen] = useState(false);
  const [isEditDocsOpen, setEditDocsOpen] = useState(false);
  const [isViewPdfOpen, setViewPdfOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ title: string; filename: string } | null>(null);

  // Form states
  const [newSignal, setNewSignal] = useState({ title: "", description: "", timePosted: "Just now" });

  useEffect(() => {
    let isMounted = true;

    const loadCompanyProfile = async () => {
      setIsloading(true);
      setError("");
      try {
        const token = await getToken();
        const [profileData, keyPeopleData, organizationData] = await Promise.all([
          fetchCompanyProfile(token),
          fetchCompanyProfileKeyPeople(token, 1, 12),
          fetchCompanyProfileOrganizationStructure(token),
        ]);

        if (!isMounted) return;
        setProfile(profileData);
        setKeyPeople(keyPeopleData);
        setDepartmentsCount(organizationData.departmentsCount);
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
