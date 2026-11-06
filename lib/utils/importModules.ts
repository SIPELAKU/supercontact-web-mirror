// lib/utils/importModules.ts
//
// Everything that differs between the imports (T2): one entry per page that can
// import. A module can have several: Subscribers also imports into a Mailing
// List, Recipients into a Group, each with its own Import History view. The
// import modal, the dock and the pages read this; none of them knows a module.

import type { ImportModule } from "@/lib/api/import-jobs";
import type { ImportFileRules } from "./importFileDuplicates";
import type { ImportTemplateConfig } from "./importTemplate";
import {
  CONTACT_FILE_RULES,
  CONTACT_IMPORT_RULES,
  CONTACT_IMPORT_TEMPLATE,
  RECIPIENT_FILE_RULES,
  RECIPIENT_IMPORT_RULES,
  RECIPIENT_IMPORT_TEMPLATE,
  SUBSCRIBER_FILE_RULES,
  SUBSCRIBER_IMPORT_RULES,
  SUBSCRIBER_IMPORT_TEMPLATE,
  type ImportFieldRule,
  type ImportRow,
} from "./importRules";

export type ImportView = "contacts" | "subscribers" | "mailing_list" | "recipients" | "broadcast_group";

export interface ImportHistoryView {
  // Which imports the view lists, as in "Import History: Subscribers".
  label: string;
  targetFilter: string[];
  // localStorage key of the view's Auto-refresh choice.
  storageKey: string;
}

export interface RequiredMapping {
  // Mapping one of these columns is enough.
  anyOf: string[];
  message: string;
}

export interface ImportViewConfig {
  view: ImportView;
  module: ImportModule;
  // Body key of the rows.
  rowsKey: "contacts" | "new_contacts";
  // Body `target`; Contacts has only one, so the API takes none.
  target?: string;
  // Body key of the list or group the rows go into.
  groupIdsKey?: "mailing_list_ids" | "broadcast_group_ids";
  // "contact", as in "Map your file columns to contact fields".
  noun: string;
  // "Contact", as in "Contact import started".
  label: string;
  title: string;
  rules: ImportFieldRule[];
  fileRules: ImportFileRules<ImportRow>;
  template: ImportTemplateConfig;
  requiredMappings: RequiredMapping[];
  history: ImportHistoryView;
}

const NAME_MAPPING: RequiredMapping = {
  anyOf: ["name"],
  message: 'Please map at least one column to "Name" (required field).',
};

type ImportModuleBase = Omit<ImportViewConfig, "view" | "target" | "groupIdsKey" | "history">;

const SUBSCRIBER_BASE: ImportModuleBase = {
  module: "subscribers",
  rowsKey: "new_contacts",
  noun: "subscriber",
  label: "Subscriber",
  title: "Import Subscribers",
  rules: SUBSCRIBER_IMPORT_RULES,
  fileRules: SUBSCRIBER_FILE_RULES,
  template: SUBSCRIBER_IMPORT_TEMPLATE,
  requiredMappings: [NAME_MAPPING, { anyOf: ["email"], message: 'Please map a column to "Email" (required field).' }],
};

const RECIPIENT_BASE: ImportModuleBase = {
  module: "recipients",
  rowsKey: "new_contacts",
  noun: "recipient",
  label: "Recipient",
  title: "Import Recipients",
  rules: RECIPIENT_IMPORT_RULES,
  fileRules: RECIPIENT_FILE_RULES,
  template: RECIPIENT_IMPORT_TEMPLATE,
  requiredMappings: [
    NAME_MAPPING,
    { anyOf: ["phone_number"], message: 'Please map a column to "Phone Number" (required field).' },
  ],
};

export const IMPORT_VIEWS: Record<ImportView, ImportViewConfig> = {
  contacts: {
    view: "contacts",
    module: "contacts",
    rowsKey: "contacts",
    noun: "contact",
    label: "Contact",
    title: "Import Contact",
    rules: CONTACT_IMPORT_RULES,
    fileRules: CONTACT_FILE_RULES,
    template: CONTACT_IMPORT_TEMPLATE,
    requiredMappings: [
      NAME_MAPPING,
      {
        anyOf: ["email", "phone_number"],
        message: 'Please map a column to "Email" or "Phone Number". Rows without both are skipped.',
      },
    ],
    history: { label: "Contacts", targetFilter: ["contact"], storageKey: "import_interval_contact" },
  },
  subscribers: {
    ...SUBSCRIBER_BASE,
    view: "subscribers",
    target: "subscriber",
    // Subscriber jobs only (FE-6): Contact imports have their own history.
    history: { label: "Subscribers", targetFilter: ["subscriber"], storageKey: "import_interval_subscriber" },
  },
  mailing_list: {
    ...SUBSCRIBER_BASE,
    view: "mailing_list",
    target: "mailing_list",
    groupIdsKey: "mailing_list_ids",
    history: { label: "Mailing Lists", targetFilter: ["mailing_list"], storageKey: "import_interval_mailing_list" },
  },
  recipients: {
    ...RECIPIENT_BASE,
    view: "recipients",
    target: "recipient",
    history: { label: "Recipients", targetFilter: ["recipient", "broadcast_group"], storageKey: "import_interval_recipient" },
  },
  broadcast_group: {
    ...RECIPIENT_BASE,
    view: "broadcast_group",
    target: "broadcast_group",
    groupIdsKey: "broadcast_group_ids",
    // GET /recipients/bulk cannot filter by group, so this lists the imports
    // into every group.
    history: { label: "Groups", targetFilter: ["broadcast_group"], storageKey: "import_interval_broadcast_group" },
  },
};

const MODULE_NOUN: Record<ImportModule, string> = {
  contacts: "contact",
  subscribers: "subscriber",
  recipients: "recipient",
};

/** "subscriber", as in "Duplicate subscriber found". */
export const importModuleNoun = (module: ImportModule) => MODULE_NOUN[module];

/** What every part of the file sends besides its rows. */
export function importJobBody(config: ImportViewConfig, groupIds: string[] = []): Record<string, unknown> {
  return {
    ...(config.target ? { target: config.target } : {}),
    ...(config.groupIdsKey ? { [config.groupIdsKey]: groupIds } : {}),
  };
}

/** What still has to be mapped before the file can go to the Check step. */
export function missingMappings(config: ImportViewConfig, mappedFields: (string | null)[]): string[] {
  return config.requiredMappings
    .filter(({ anyOf }) => !anyOf.some((field) => mappedFields.includes(field)))
    .map(({ message }) => message);
}

export interface ImportFieldOption {
  value: string | null;
  label: string;
  isCustom?: boolean;
}

/** The Maps To choices of the Mapping step. */
export function importFieldOptions(rules: ImportFieldRule[]): ImportFieldOption[] {
  return [
    { value: null, label: "-- Skip this column --" },
    ...rules.map((rule) => ({
      value: rule.field,
      label: rule.required === "Yes" ? `${rule.column} (required)` : rule.column,
    })),
  ];
}
