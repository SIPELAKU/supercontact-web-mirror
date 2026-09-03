# Reusable Components Guide — Supercontact Web

Standard reference for the shared UI layer. All shared components live in `components/ui/`
and are built on **Material UI (MUI)** themed by `lib/theme.ts`, with layout utility
classes from Tailwind. Use these instead of hand-rolling per-page equivalents.

---

## 1. Theme tokens (`lib/theme.ts`)

Single source of truth for brand colors — never hard-code hex values in components.

| Token | Value | Use |
|---|---|---|
| `BRAND_PRIMARY` | `#5479EE` | Primary actions, active states, links |
| `BRAND_PRIMARY_HOVER` | `#3F66E0` | Primary hover / `palette.primary.dark` |
| `BRAND_PRIMARY_LIGHT` | `#DDE4FC` | Tints, selected backgrounds |
| `DANGER` | `#EF4444` | Destructive actions, errors |
| `DANGER_HOVER` | `#DC2626` | Danger hover |

The exported `theme` (MUI `createTheme`) wires these into `palette.primary` /
`palette.error`, so plain MUI `color="primary"` / `color="error"` already match the brand.

---

## 2. Language policy

**The authenticated app is English-only** — labels, buttons, empty states, error copy,
confirmation dialogs, table headers, toasts. Marketing/public pages may differ; anything
behind login must be English. Do not let MUI/MRT fall back to non-English defaults
(see `EmptyState` and SuperTable `errorMessage` below).

---

## 3. Form components

### `AppButton` (`components/ui/app-button.tsx`)
- `variantStyle`: `"primary" | "outline" | "danger" | "text" | "soft" | "white"`.
- `startIcon` / `endIcon`, MUI loading props supported.

```tsx
<AppButton variantStyle="outline" startIcon={<Plus size={18} />}>Add Item</AppButton>
<AppButton variantStyle="danger">Delete</AppButton>
```

### `AppInput` (`components/ui/app-input.tsx`)
- `label` — static label rendered above the field (AppSelect-style).
- `required` — renders the standard red asterisk after the label.
- `error` (boolean) — paints the field border red; `helperText` shows the message under
  the field (red while `error` is set). Mirrors `AppSelect`'s API.
- `type="password"` gets an automatic show/hide toggle; `type="checkbox"` renders the
  styled MUI checkbox variant.
- `startIcon` / `endIcon`, `isBgWhite` (white instead of the soft-ivory default background).

```tsx
<AppInput label="Email" required type="email"
  error={!!errors.email} helperText={errors.email} />
```

### `AppSelect`, `AppTextarea`, `AppAutocomplete`, `AppDatePicker`
Same conventions as `AppInput`: `label` + `required` + `error`/`helperText`.
`AppDatePicker` works with `DatePickerValue` (single date or range).

### `AppTabs` (`components/ui/app-tabs.tsx`)
Brand-standard underline tab bar: `value`, `onChange(value)`, `tabs: AppTabItem[]`
(`{ value, label, icon? }`). Not for segmented-pill surfaces or route-based tabs —
those are deliberately different patterns.

---

## 4. Feedback components

### `ConfirmationPopup` + `useConfirmationPopup` (`components/ui/confirmation-popup.tsx`)
All confirmations go through this — never `window.confirm` or ad-hoc dialogs.

- Variants: `"danger"` (destructive, confirm defaults to **Delete**), `"discard"`
  (unsaved-changes guard, defaults to **Discard**), `"warning"`, `"info"`.
- Declarative: render `<ConfirmationPopup isOpen onClose onConfirm title description … />`.
- Imperative one-off confirms:

```tsx
const { confirm, confirmationPopup } = useConfirmationPopup();
confirm({ title: "Delete contact?", description: "…", variant: "danger",
  onConfirm: async () => { await remove(id); } });
// render {confirmationPopup} anywhere in the tree
```

Async `onConfirm` gets automatic loading state; the popup won't close mid-flight.

### `EmptyState` (`components/ui/empty-state.tsx`)
Shared empty-state treatment (icon + title + description + optional CTA `action`) in a
dashed-border box. Pass through SuperTable's `renderEmptyState`, or render directly for
non-table empty surfaces. Prevents MRT's non-English fallback copy.

### Toasts — `notify` (`lib/notifications.tsx`)
Use `notify.success/error/…` for transient feedback; `AppAlert` for inline alerts.

---

## 5. Page scaffolding

### `PageHeader` (`components/ui/page-header.tsx`)
Every page starts with one: `title`, `description`, `breadcrumbs`
(`{ label, href? }[]`), and either `actions` (primary page buttons — takes precedence)
or a decorative `image`, never both.

---

## 6. SuperTable (`components/ui/super-table/`)

The standard data table (wraps Material React Table). Golden rules:

1. **`tableId` is required** whenever `features.urlSync`, `features.savedFilters`, or
   export are enabled — it namespaces URL query keys and storage keys. Use a stable,
   unique, kebab-case id per table (e.g. `"contacts-table"`).
2. **`renderEmptyState`** — always provide one, using `EmptyState`, with English copy.
3. **Error state** — pass `isError` + `errorMessage` (English) + `onRetry` so users get
   the standard error panel with a working Retry button, not a blank table.
4. **`getRowId`** — provide a stable id (`(row) => row.id`). Mandatory with
   `manualPagination`: without it MRT keys rows by index and selections "stick" to the
   wrong rows across pages.
5. **Server-side contract** — for server-driven tables set `manualPagination` +
   `manualSorting` + `manualFiltering`, supply `rowCount`, and translate
   `onStateChange(state)` into API params:
   - search: `state.globalFilter` → `search`
   - sort: `state.sorting[0]` → `sort_by` (column id) + `sort_order`
     (`"asc" | "desc"`)
   - pagination: `state.pagination.pageIndex/pageSize` → `page` / `limit`
   - filters: `state.filters` (flat object) — or `state.columnFilters` if the
     page already reads that shape
   Do **not** hand-roll "reset to page 1 when the search changed". SuperTable
   already does it for search, sort, filters and page size; a second copy of the
   rule in the page is how the two drift apart.
6. **Pagination is lazy by default.** No page numbers: rows accumulate as you
   scroll and the footer reads "Menampilkan 240 dari 12.431 kontak" with a
   *Muat lebih banyak* button beside it. What this asks of a caller:
   - Set `entityLabel` (the plural noun) and `searchPlaceholder` (what is
     actually searched) — the footer and search box are generic without them.
   - Keep `rowCount` accurate; it is the "dari 12.431".
   - **Never override the batch size on one side only.** SuperTable announces
     its state on mount so the page adopts its `limit`; if a page forces a
     different one, "load more" fetches the next batch at the wrong offset and
     silently skips rows.
   - `features.pagination: 'pages'` brings back the numbered paginator. Use it
     for small settings tables and anywhere a `?p=3` deep link matters — a lazy
     list deliberately keeps search/sort/filters in the URL but not a page
     number, because "page 7" alone does not reproduce the view.
   - `features.virtualize` is opt-in and read once at mount; it forces
     `layoutMode: 'grid'`, so give the columns a `size` first.
7. Loading: `isLoading` for first load (skeleton), `isFetching` for background
   refetch. In lazy mode the skeleton only replaces an *empty* table — once rows
   are on screen, loading the next batch must never blank them.
8. **Filters are declared as data.** Use the `filters` prop:

   ```tsx
   filters={[{ id: "status", label: "Status", type: "select", options }]}
   ```

   SuperTable renders one **Filters** button carrying the active count, a
   popover (bottom drawer under 720px), and one removable chip per active
   filter. Values land in both `state.filters` and `state.columnFilters`, so a
   page already reading the latter needs no change.
   - **Declare only filters the server can honour.** Three tables used to render
     filter boxes with `manualFiltering` on while the page never forwarded
     `columnFilters` — typing in them did nothing. A control that silently does
     nothing is worse than no control; check the endpoint first.
   - `features.columnFilters` (MRT's subheader row) is deprecated and ignored
     when `filters` is set.
   - Search and sort are permanent labelled toolbar controls, not icons that
     reveal something. Sort shows the column currently in use, which is the only
     way to know it once the header has scrolled away or on a phone.

9. Slots, and which of them survive a row selection:
   - `renderFilters` — legacy escape hatch for a page-owned filter control. Prefer
     `filters`. Never together with it, or with `features.columnFilters: true` —
     two filter affordances on one table is always a bug. Must **return** `null`
     when there is nothing to show.
   - `renderTopLeftToolbar` — Add/Import buttons. **Replaced wholesale** by the bulk
     bar while rows are selected, so never put a filter here.
   - `renderBulkActions` — shown while rows are selected.
   - `renderRowActions` — right-most actions column.
   - `renderDetailPanel`.

   Pair a page-owned filter with `resetPageKey`: changing it sends the table back to
   page 1 **and** clears the row selection, so the bulk bar can't keep counting rows
   the server no longer returns.

10. **Row actions**: prefer `rowActions` (an array of `SuperTableRowAction`, or a
   function of the row) over `renderRowActions`. Declaring them as data is what
   lets SuperTable render one kebab on desktop and a labelled 48px bottom sheet
   on a phone — written once, instead of per screen. `renderRowActions` stays
   supported with no end date, for genuinely odd cases such as a table nested
   inside a modal.
   - `disabled` may return a **string**: it disables the action *and* becomes the
     reason, shown as readable text under the label. Never put the reason in a
     tooltip on a disabled icon button — MUI lands the accessible name on a
     non-focusable `<span>` and the button leaves the tab order, so keyboard,
     screen-reader and touch users never see it.
     Prefer `disabled` over `hidden` when the user could plausibly expect the
     action: an explained absence teaches, a silent one confuses.
   - `placement: 'quick'` pins an action outside the menu. Spend it sparingly —
     every pinned icon puts back some of the noise the kebab just removed. It is
     earned by actions performed dozens of times a day on that screen (Delete on
     Subscribers, Contacts and WA Recipients qualifies; Delete elsewhere does not).
   - `destructive: true` colours it and moves it below a divider.

11. **The row opens the record — do not also ship a View icon.** Give the table a
   `primaryColumn` and the named column becomes a real `<a href>`: one tab stop
   per row, accessible name = the record's own title, and middle-click and
   open-in-new-tab work for free. Add `onRowClick` on top as a mouse
   convenience. Never put `role="link"` or `tabIndex` on the `<tr>` — it breaks
   the rowgroup>row>cell tree, collapses the whole row into one accessible name,
   and nests the selection checkbox inside a link.

   **Where the click goes — three classes.** The gesture is standard; the
   destination follows the record:
   - **A — scalar record, no detail route** (most screens): opens the existing
     edit modal. Do not build a page for 3-6 fields nobody asked for.
   - **B — a real `[id]` page exists**: routes there, and that page reads *and*
     edits in place.
   - **C — the editor is the page** (campaign composer, flow studio, template
     builder, smart-capture wizard): routes to the read surface, and the kebab
     carries the state-dependent call to action. Route by state where it helps —
     a Draft campaign goes to the composer, a sent one to its statistics.

   Anything inside `data-st-no-row-click` never triggers the row click; the
   actions cell carries it for you, so a caller does not need `stopPropagation`.

See `components/ui/super-table/README.md` and `types.ts` for the full API, and
`app/(app)/demo/super-table` (dev-only) for a live playground.

---

## 7. Naming & formatting conventions

- **Add buttons**: `Add <Noun>` — e.g. "Add Contact", "Add Department" (not "New",
  "Create", or bare "+").
- **Bulk delete**: `Delete (n)` with the selected count.
- **Actions column**: header text is exactly `Actions`.
- **Dates**: `dd MMM yyyy` (e.g. `19 Aug 2026`); with time: `dd MMM yyyy, HH:mm`
  (24-hour clock). Use one shared formatter, not per-page `toLocaleString` variants.
- **Table ids / storage keys**: kebab-case; permission strings mirror the API's
  `permissions_require(...)` values exactly (see `lib/constants/permissions.ts`).
- Sidebar entries are permission-gated with the same string the backing API endpoints
  enforce; if the API endpoint has no permission gate, the menu entry stays ungated with
  a comment explaining why (see `components/layout/Sidebar.tsx`).

---

## 8. Do / Don't

| Do | Don't |
|---|---|
| `AppInput` + `required`/`error` | Raw `<input>` or legacy `components/ui/input.tsx` in new code |
| `ConfirmationPopup` / `useConfirmationPopup` | `window.confirm`, bespoke delete modals |
| `EmptyState` via `renderEmptyState` | MRT default empty text |
| `errorMessage` + `onRetry` on SuperTable | Silent empty table on fetch failure |
| Theme tokens from `lib/theme.ts` | Hard-coded `#5479EE` etc. |
| English copy in the authenticated app | Mixed-language UI strings |
