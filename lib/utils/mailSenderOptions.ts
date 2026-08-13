import type { MailSender } from "@/lib/api/email-marketing/mail-senders";

export interface MailSenderOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const MY_IDENTITY_HEADER = "__mail_sender_group_mine__";
const TEAM_SENDERS_HEADER = "__mail_sender_group_team__";

/**
 * Groups mail senders into "My Identity" (personal senders owned by the
 * current user) and "Team Senders" (everything else - company-shared and
 * system senders) for display in a flat AppSelect, which has no native
 * optgroup support. Header rows are non-selectable (disabled) MenuItems.
 *
 * currentUserId=null (profile still loading) skips grouping entirely so
 * nothing is misclassified while userProfile is unavailable.
 *
 * currentValue: the sender id already attached to the resource being
 * edited (a campaign, a smart capture). The list this app fetches only
 * ever contains senders the viewer can pick (their own personal ones plus
 * shared/system ones) - if a resource already carries a teammate's
 * personal sender, that id won't be in `mailSenders` at all. Without a
 * synthetic entry AppSelect's renderValue can't resolve it and falls back
 * to displaying the raw UUID. Editing/saving the resource is unaffected
 * either way (the backend only re-validates ownership when the sender is
 * actually being changed) - this is purely about not showing a bare id.
 */
export function buildGroupedMailSenderOptions(
  mailSenders: MailSender[],
  currentUserId: string | null | undefined,
  currentValue?: string | null
): MailSenderOption[] {
  const toOption = (sender: MailSender): MailSenderOption => ({
    value: sender.id,
    label: `${sender.name} (${sender.email})`,
  });

  const withUnresolvedCurrent = (options: MailSenderOption[]): MailSenderOption[] => {
    if (
      !currentValue ||
      mailSenders.some((s) => s.id === currentValue) ||
      options.some((o) => o.value === currentValue)
    ) {
      return options;
    }
    return [
      ...options,
      { value: currentValue, label: "Sender set by another user", disabled: true },
    ];
  };

  if (!currentUserId) {
    return withUnresolvedCurrent(mailSenders.map(toOption));
  }

  const mine = mailSenders.filter((s) => s.user_id === currentUserId);
  const team = mailSenders.filter((s) => s.user_id !== currentUserId);

  if (mine.length === 0) {
    return withUnresolvedCurrent(team.map(toOption));
  }

  const options: MailSenderOption[] = [
    { value: MY_IDENTITY_HEADER, label: "My Identity", disabled: true },
    ...mine.map(toOption),
  ];
  if (team.length > 0) {
    options.push(
      { value: TEAM_SENDERS_HEADER, label: "Team Senders", disabled: true },
      ...team.map(toOption)
    );
  }
  return withUnresolvedCurrent(options);
}
