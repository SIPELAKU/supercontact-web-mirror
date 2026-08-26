"use client";

// components/email-marketing/OverviewClient.tsx
//
// The module's front door. `/email-marketing` used to 404: the route was in
// middleware's protected list and the sidebar had three children, but no page
// existed at the parent path.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Paper, Skeleton, Typography } from "@mui/material";
import { format } from "date-fns";
import {
  ArrowRight,
  ListChecks,
  Mail,
  MailOpen,
  Plus,
  Send,
  Users,
} from "lucide-react";

import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useEmailMarketingOverview } from "@/lib/hooks/useEmailMarketingOverview";
import { useCampaigns } from "@/lib/hooks/useCampaigns";
import { campaignStatusChipColor } from "@/lib/constants/campaign-status";
import { Chip } from "@mui/material";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  isLoading,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
  href?: string;
  isLoading: boolean;
}) {
  const body = (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        transition: "border-color .2s, box-shadow .2s",
        ...(href
          ? {
              "&:hover": {
                borderColor: "primary.main",
                boxShadow: "0 2px 10px rgba(0,0,0,.05)",
              },
            }
          : {}),
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.light",
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        <Icon size={20} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
          {label}
        </Typography>
        {isLoading ? (
          <Skeleton width={80} height={36} />
        ) : (
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </Typography>
        )}
        {hint && !isLoading && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {hint}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {body}
    </Link>
  ) : (
    body
  );
}

export default function OverviewClient() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useEmailMarketingOverview();
  const overview = data?.data;

  // Reuses the campaigns list endpoint rather than duplicating "latest N" on
  // the server — same data, one contract.
  const { data: recentData, isLoading: isLoadingRecent } = useCampaigns(
    1,
    5,
    "",
    undefined,
    "created_at",
    "desc"
  );
  const recent = recentData?.data?.campaigns || [];

  const rate = (value: number | null | undefined) =>
    value === null || value === undefined ? "—" : `${value.toFixed(1)}%`;

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Email Marketing"
        description="Subscribers, mailing lists and campaigns at a glance."
        breadcrumbs={[{ label: "Email Marketing" }]}
        actions={
          <AppButton
            variantStyle="primary"
            startIcon={<Plus size={16} />}
            onClick={() => router.push("/email-marketing/campaigns/new")}
          >
            Add Campaign
          </AppButton>
        }
      />

      {isError ? (
        <EmptyState
          icon={Mail}
          title="We could not load the overview"
          description="The summary figures failed to load. Your lists and campaigns are still available."
          action={{ label: "Try again", onClick: () => refetch() }}
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          <StatCard
            label="Subscribers"
            value={(overview?.total_subscribers ?? 0).toLocaleString()}
            icon={Users}
            href="/email-marketing/subscribers"
            isLoading={isLoading}
          />
          <StatCard
            label="Mailing lists"
            value={(overview?.total_mailing_lists ?? 0).toLocaleString()}
            icon={ListChecks}
            href="/email-marketing/mailing-lists"
            isLoading={isLoading}
          />
          <StatCard
            label="Sent in last 30 days"
            value={(overview?.campaigns_sent_last_30_days ?? 0).toLocaleString()}
            hint={`${(overview?.total_campaigns ?? 0).toLocaleString()} campaigns in total`}
            icon={Send}
            href="/email-marketing/campaigns"
            isLoading={isLoading}
          />
          <StatCard
            label="Open rate · last 30 days"
            value={rate(overview?.open_rate_last_30_days)}
            hint={
              overview?.open_rate_all_time !== null &&
              overview?.open_rate_all_time !== undefined
                ? `All time: ${rate(overview.open_rate_all_time)} of ${overview.delivered_all_time.toLocaleString()} delivered`
                : "No delivery data yet"
            }
            icon={MailOpen}
            isLoading={isLoading}
          />
        </Box>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 600 }}>
            Latest campaigns
          </Typography>
          <AppButton
            variantStyle="text"
            endIcon={<ArrowRight size={16} />}
            onClick={() => router.push("/email-marketing/campaigns")}
          >
            View all
          </AppButton>
        </Box>

        {isLoadingRecent ? (
          <Box sx={{ p: 3 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={44} />
            ))}
          </Box>
        ) : recent.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <EmptyState
              icon={Mail}
              title="No campaigns yet"
              description="Write your first campaign and send it to a mailing list."
              action={{
                label: "Add Campaign",
                onClick: () => router.push("/email-marketing/campaigns/new"),
                icon: <Plus size={16} />,
              }}
            />
          </Box>
        ) : (
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {recent.map((campaign) => (
              <Box
                key={campaign.id}
                component="li"
                sx={{
                  px: 3,
                  py: 1.75,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  "&:first-of-type": { borderTop: "none" },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {campaign.subject}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {campaign.sent_at
                      ? `Sent ${format(new Date(campaign.sent_at), "dd MMM yyyy, HH:mm")}`
                      : "Not sent yet"}
                    {" · "}
                    {(campaign.total_target ?? 0).toLocaleString()} recipients
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={campaign.status}
                  color={campaignStatusChipColor(campaign.status)}
                />
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </div>
  );
}
