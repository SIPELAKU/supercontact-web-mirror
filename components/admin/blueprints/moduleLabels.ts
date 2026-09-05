/** Human labels for the installer's module keys, plus which ones change how the
 *  system BEHAVES. The distinction matters: behaviour modules land switched off
 *  and the wizard has to say so, or a tenant walks away thinking their SLA is
 *  running when it is not. */
export const MODULE_LABELS: Record<string, string> = {
    ticket_categories: "Kategori tiket",
    ticket_tags: "Tag tiket",
    agent_skills: "Keahlian agen",
    ticket_custom_fields: "Field khusus tiket",
    ticket_macros: "Macro tiket",
    canned_replies: "Balasan siap pakai",
    knowledge_base: "Artikel Knowledge Base",
    pipeline_stages: "Tahapan penjualan",
    // Catalogue taxonomy (Phase 1): inert, installed before the sample
    // products, and auto-included by the server whenever `products` is.
    product_categories: "Kategori produk",
    units: "Satuan produk",
    products: "Produk contoh",
    // Phase 2. Deliberately NOT in BEHAVIOUR_MODULES below: the seeded lists
    // arrive `status='active'`, merely unassigned and with no product prices on
    // the default one, so the amber "mati" chip would tell the tenant something
    // untrue. The server keeps `price_lists` in its own BEHAVIOR_MODULES for
    // INSTALL ORDERING only - the two sets are not the same concept.
    price_lists: "Daftar harga",
    // Phase 3. Deliberately NOT in BEHAVIOUR_MODULES either: the seeded types
    // arrive `status='active'` and no contact carries one on a fresh tenant, so
    // the install is inert in substance without being switched off (spec A22).
    customer_types: "Tipe pelanggan",
    business_hours: "Jam operasional",
    conversation_queues: "Antrean percakapan",
    ticket_sla_policies: "SLA tiket",
    conversation_sla_policies: "SLA percakapan",
    ticket_automation_rules: "Automation tiket",
    qa_scorecards: "Scorecard QA",
    widget_quick_actions: "Tombol cepat widget",
    flows: "Alur percakapan (triage)",
};

/** Installed switched OFF / as draft, because turning them on retroactively
 *  affects tickets and conversations that are already open. */
export const BEHAVIOUR_MODULES = new Set([
    "business_hours",
    "conversation_queues",
    "ticket_sla_policies",
    "conversation_sla_policies",
    "ticket_automation_rules",
    "qa_scorecards",
    "widget_quick_actions",
    "flows",
    "pipeline_stages",
]);

export function moduleLabel(key: string): string {
    return MODULE_LABELS[key] ?? key.replace(/_/g, " ");
}
