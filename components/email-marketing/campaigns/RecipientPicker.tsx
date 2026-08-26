"use client";

// components/email-marketing/campaigns/RecipientPicker.tsx
//
// Extracted verbatim-in-behaviour from AddCampaignModal / EditCampaignModal,
// which each carried their own ~250-line copy of this picker. One copy means a
// fix here lands in both create and edit.

import { useMemo, useState } from "react";
import {
  Box,
  Checkbox,
  CircularProgress,
  Grid,
  Pagination,
  Paper,
  Typography,
} from "@mui/material";
import { CheckCircle2, Search, User, Users } from "lucide-react";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { useMailingLists } from "@/lib/hooks/useMailingLists";
import { useSubscribers } from "@/lib/hooks/useSubscribers";
import { BRAND_PRIMARY } from "@/lib/theme";
import RecipientSourceSelector from "./RecipientSourceSelector";

export type RecipientSource = "mailing_list" | "subscriber";

interface RecipientPickerProps {
  source: RecipientSource;
  onSourceChange: (source: RecipientSource) => void;
  selectedMailingLists: string[];
  onMailingListsChange: (ids: string[]) => void;
  selectedSubscribers: string[];
  onSubscribersChange: (ids: string[]) => void;
  error?: string;
}

const SUBSCRIBER_PAGE_SIZE = 10;

export function RecipientPicker({
  source,
  onSourceChange,
  selectedMailingLists,
  onMailingListsChange,
  selectedSubscribers,
  onSubscribersChange,
  error,
}: RecipientPickerProps) {
  const [mailingListSearch, setMailingListSearch] = useState("");
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [subscriberPage, setSubscriberPage] = useState(1);

  const { data: mailingListsData } = useMailingLists(1, 100);
  const { data: subscribersData, isLoading: isLoadingSubscribers } = useSubscribers(
    subscriberPage,
    SUBSCRIBER_PAGE_SIZE,
    subscriberSearch
  );

  const mailingLists = mailingListsData?.data?.mailing_lists || [];
  const subscribers = subscribersData?.data?.contacts || [];
  const totalSubscribers = subscribersData?.data?.total || 0;
  const totalSubscriberPages = Math.ceil(totalSubscribers / SUBSCRIBER_PAGE_SIZE);

  const filteredMailingLists = useMemo(() => {
    if (!mailingListSearch.trim()) return mailingLists;
    const q = mailingListSearch.toLowerCase();
    return mailingLists.filter((list) => list.name.toLowerCase().includes(q));
  }, [mailingLists, mailingListSearch]);

  const toggle = (ids: string[], id: string, apply: (next: string[]) => void) =>
    apply(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);

  const allListsSelected =
    filteredMailingLists.length > 0 &&
    filteredMailingLists.every((l) => selectedMailingLists.includes(l.id));
  const allSubscribersSelected =
    subscribers.length > 0 &&
    subscribers.every((s) => selectedSubscribers.includes(s.id));

  const selectedCount =
    source === "mailing_list" ? selectedMailingLists.length : selectedSubscribers.length;

  return (
    <Box>
      <RecipientSourceSelector
        value={source}
        onChange={(value) => {
          onSourceChange(value);
          onMailingListsChange([]);
          onSubscribersChange([]);
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          mb: 1.5,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {source === "mailing_list" ? "Mailing lists" : "Subscribers"}
          {selectedCount > 0 && (
            <Typography component="span" variant="body2" sx={{ color: "text.secondary", ml: 1 }}>
              {selectedCount} selected
            </Typography>
          )}
        </Typography>
        {(source === "mailing_list" ? filteredMailingLists.length : subscribers.length) > 0 && (
          <AppButton
            variantStyle="text"
            onClick={() => {
              if (source === "mailing_list") {
                onMailingListsChange(
                  allListsSelected ? [] : filteredMailingLists.map((l) => l.id)
                );
              } else {
                onSubscribersChange(
                  allSubscribersSelected ? [] : subscribers.map((s) => s.id)
                );
              }
            }}
          >
            {(source === "mailing_list" ? allListsSelected : allSubscribersSelected)
              ? "Deselect all"
              : "Select all"}
          </AppButton>
        )}
      </Box>

      {source === "mailing_list" ? (
        <>
          {mailingLists.length > 0 && (
            <AppInput
              fullWidth
              placeholder="Search mailing lists…"
              value={mailingListSearch}
              onChange={(e) => setMailingListSearch(e.target.value)}
              sx={{ mb: 2 }}
              isBgWhite
              startIcon={<Search className="w-4 h-4 text-gray-400" />}
            />
          )}

          {mailingLists.length === 0 ? (
            <EmptyBox text="No mailing lists yet. Create one first." />
          ) : filteredMailingLists.length === 0 ? (
            <EmptyBox text={`No mailing lists match "${mailingListSearch}".`} />
          ) : (
            <Box sx={{ maxHeight: 320, overflowY: "auto", pr: 0.5 }}>
              <Grid container spacing={1.5}>
                {filteredMailingLists.map((list) => (
                  <Grid item xs={12} sm={6} key={list.id}>
                    <SelectableCard
                      selected={selectedMailingLists.includes(list.id)}
                      onToggle={() =>
                        toggle(selectedMailingLists, list.id, onMailingListsChange)
                      }
                      title={list.name}
                      subtitle={`${list.subscriber_count.toLocaleString()} subscribers`}
                      icon={<Users className="w-3 h-3 text-gray-400" />}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      ) : (
        <>
          <AppInput
            fullWidth
            placeholder="Search subscribers by email or name…"
            value={subscriberSearch}
            onChange={(e) => {
              setSubscriberSearch(e.target.value);
              setSubscriberPage(1);
            }}
            sx={{ mb: 2 }}
            isBgWhite
            startIcon={<Search className="w-4 h-4 text-gray-400" />}
          />
          {isLoadingSubscribers ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : subscribers.length === 0 ? (
            <EmptyBox
              text={
                subscriberSearch
                  ? `No subscribers match "${subscriberSearch}".`
                  : "No subscribers yet. Add some first."
              }
            />
          ) : (
            <>
              <Box sx={{ maxHeight: 320, overflowY: "auto", pr: 0.5 }}>
                <Grid container spacing={1.5}>
                  {subscribers.map((subscriber) => (
                    <Grid item xs={12} sm={6} key={subscriber.id}>
                      <SelectableCard
                        selected={selectedSubscribers.includes(subscriber.id)}
                        onToggle={() =>
                          toggle(selectedSubscribers, subscriber.id, onSubscribersChange)
                        }
                        title={subscriber.email}
                        subtitle={subscriber.name || undefined}
                        icon={<User className="w-3 h-3 text-gray-400" />}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
              {totalSubscriberPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Pagination
                    count={totalSubscriberPages}
                    page={subscriberPage}
                    onChange={(_, page) => setSubscriberPage(page)}
                    color="primary"
                    size="small"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
              {/* Selecting across pages is easy to lose track of, so say it out loud. */}
              {selectedSubscribers.length > 0 && totalSubscriberPages > 1 && (
                <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
                  {selectedSubscribers.length} subscriber(s) selected across all pages.
                </Typography>
              )}
            </>
          )}
        </>
      )}

      {error && (
        <Typography variant="body2" sx={{ color: "error.main", mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, textAlign: "center", bgcolor: "#f9fafb", borderStyle: "dashed" }}
    >
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Paper>
  );
}

function SelectableCard({
  selected,
  onToggle,
  title,
  subtitle,
  icon,
}: {
  selected: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      onClick={onToggle}
      sx={{
        p: 1.5,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        transition: "all 0.2s",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? "primary.light" : "background.paper",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-1px)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        },
      }}
    >
      <Checkbox
        size="small"
        checked={selected}
        sx={{ p: 0 }}
        onClick={(e) => e.stopPropagation()}
        onChange={onToggle}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {subtitle && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
            {icon}
            <Typography variant="caption" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          </Box>
        )}
      </Box>
      {selected && <CheckCircle2 className="w-4 h-4" color={BRAND_PRIMARY} />}
    </Paper>
  );
}

export default RecipientPicker;
