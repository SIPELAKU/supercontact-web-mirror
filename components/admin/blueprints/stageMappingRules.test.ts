import { describe, expect, it } from "vitest";
import {
  allowedTargets,
  checkPlan,
  chooseAction,
  createBlockReason,
  describePlan,
  freeTargets,
  initialPlan,
  planIsValid,
  readBlueprintStages,
  renameCount,
  renderStageName,
  resultPipeline,
  rowUsing,
  stagesAfterInstall,
  type ExistingStage,
} from "./stageMappingRules";
import type { BlueprintStage } from "@/lib/types/IndustryBlueprint";

const stage = (id: string, outcome: ExistingStage["outcome"], extra: Partial<ExistingStage> = {}): ExistingStage => ({
  id,
  name: id,
  outcome,
  isActive: true,
  isLocked: outcome !== "open",
  dealCount: 0,
  color: "#26C6F9",
  ...extra,
});

/** The default six. */
const company = () => [
  stage("Prospect", "entry"),
  stage("Qualified", "open"),
  stage("Negotiation", "open"),
  stage("Proposal", "quotation"),
  stage("Closed - Won", "won"),
  stage("Closed - Lost", "lost"),
];

/** Multi Financing as API 1.171.2 marks it: an entry and a quotation stage too. */
const blueprint: BlueprintStage[] = [
  { name: "Prospek", outcome: "entry" },
  { name: "Kunjungan / Survei", outcome: "open" },
  { name: "Simulasi & Pengajuan", outcome: "quotation" },
  { name: "Proses Persetujuan", outcome: "open" },
  { name: "Akad / Serah Terima", outcome: "won" },
  { name: "Batal", outcome: "lost" },
];

describe("readBlueprintStages", () => {
  it("objects and bare names, in manifest order; entry/quotation/won/lost kept, anything else open", () => {
    expect(
      readBlueprintStages([
        { name: "Prospek", outcome: "entry", color: "#26C6F9", default_probability: 10 },
        "Kunjungan",
        { name: "Penawaran Harga", outcome: "quotation" },
        { name: "Akad", outcome: "won" },
        { name: "Batal", outcome: "lost" },
        { name: "Aneh", outcome: "strange" },
        null,
      ]),
    ).toEqual([
      { name: "Prospek", outcome: "entry", color: "#26C6F9", default_probability: 10 },
      { name: "Kunjungan", outcome: "open" },
      { name: "Penawaran Harga", outcome: "quotation", color: null, default_probability: null },
      { name: "Akad", outcome: "won", color: null, default_probability: null },
      { name: "Batal", outcome: "lost", color: null, default_probability: null },
      { name: "Aneh", outcome: "open", color: null, default_probability: null },
      { name: "", outcome: "open", color: null, default_probability: null },
    ]);
  });

  it("no list from the API", () => {
    expect(readBlueprintStages(undefined)).toBeNull();
    expect(readBlueprintStages({ pipeline_stages: [] })).toBeNull();
  });
});

describe("renderStageName (same rule as the BE)", () => {
  it("fills {{KEY}}, keys in any case, spaces inside the braces", () => {
    expect(renderStageName("Demo {{PRODUK}}", { PRODUK: "Mobil" })).toBe("Demo Mobil");
    expect(renderStageName("Demo {{ produk }}", { produk: "Motor" })).toBe("Demo Motor");
  });

  it("an empty or unknown variable stays visible", () => {
    expect(renderStageName("Demo {{PRODUK}}", { PRODUK: "" })).toBe("Demo {{PRODUK}}");
    expect(renderStageName("Demo {{X}}", {})).toBe("Demo {{X}}");
  });
});

describe("initialPlan", () => {
  it("by job: entry → Prospect, quotation → Proposal, won → Won, lost → Lost; the rest added up to 8", () => {
    const plan = initialPlan(blueprint, company(), {});
    expect(plan.map((r) => [r.action, r.stage_id])).toEqual([
      ["assign", "Prospect"],
      ["create", null],
      ["assign", "Proposal"],
      ["create", null],
      ["assign", "Closed - Won"],
      ["assign", "Closed - Lost"],
    ]);
    expect(stagesAfterInstall(plan, company())).toBe(8);
  });

  it("by job, not position", () => {
    const plan = initialPlan(
      [{ name: "Lead" }, { name: "Pendaftaran Vendor", outcome: "entry" }, { name: "Penawaran Harga", outcome: "quotation" }],
      company(),
      {},
    );
    expect(plan.map((r) => [r.action, r.stage_id])).toEqual([
      ["create", null],
      ["assign", "Prospect"],
      ["assign", "Proposal"],
    ]);
  });

  it("an open first stage never takes Prospect (the API refuses it)", () => {
    expect(initialPlan([{ name: "Lead" }], company(), {})[0]).toEqual({ index: 0, action: "create", stage_id: null });
  });

  it("inactive stages count towards 8", () => {
    const withInactive = [...company(), stage("Old", "open", { isActive: false })];
    const plan = initialPlan(blueprint, withInactive, {});
    expect(plan.filter((r) => r.action === "create")).toHaveLength(1);
  });

  it("a stage the company already has by that name is taken over, not added again", () => {
    const existing = [...company().slice(0, 2), stage("Kunjungan / Survei", "open"), ...company().slice(2)];
    const plan = initialPlan(blueprint, existing, {});
    expect(plan[1]).toEqual({ index: 1, action: "assign", stage_id: "Kunjungan / Survei" });
  });

  it("an inactive namesake can't be taken over or duplicated: left out, even with room", () => {
    const existing = [...company(), stage("Proses Persetujuan", "open", { isActive: false })];
    expect(initialPlan(blueprint, existing, {})[3].action).toBe("skip");
    const roomy = initialPlan([{ name: "Prospek", outcome: "entry" }, { name: "Proses Persetujuan" }], existing, {});
    expect(roomy[1].action).toBe("skip");
  });

  it("a company already at 8 gets no new stages", () => {
    const full = [...company(), stage("A", "open"), stage("B", "open")];
    expect(initialPlan(blueprint, full, {}).some((r) => r.action === "create")).toBe(false);
  });

  it("names are compared after the variables are filled", () => {
    const existing = [...company(), stage("Demo Mobil", "open")];
    const plan = initialPlan([{ name: "Demo {{PRODUK}}" }], existing, { PRODUK: "Mobil" });
    expect(plan[0]).toEqual({ index: 0, action: "assign", stage_id: "Demo Mobil" });
  });
});

describe("targets", () => {
  it("entry/quotation/won/lost only to the stage with the same job; open ones to any active open stage", () => {
    expect(allowedTargets(blueprint[0], company()).map((s) => s.id)).toEqual(["Prospect"]);
    expect(allowedTargets(blueprint[2], company()).map((s) => s.id)).toEqual(["Proposal"]);
    expect(allowedTargets(blueprint[4], company()).map((s) => s.id)).toEqual(["Closed - Won"]);
    expect(allowedTargets(blueprint[5], company()).map((s) => s.id)).toEqual(["Closed - Lost"]);
    expect(allowedTargets(blueprint[1], [...company(), stage("Old", "open", { isActive: false })]).map((s) => s.id)).toEqual([
      "Qualified",
      "Negotiation",
    ]);
  });

  it("why a stage can't be added", () => {
    expect(createBlockReason(blueprint[0], company())).toBe("Pipeline hanya punya satu tahapan awal.");
    expect(createBlockReason(blueprint[2], company())).toBe("Pipeline hanya punya satu tahapan quotation.");
    expect(createBlockReason(blueprint[4], company())).toBe("Pipeline hanya punya satu tahapan menang.");
    expect(createBlockReason(blueprint[5], company())).toBe("Pipeline hanya punya satu tahapan kalah.");
    expect(createBlockReason(blueprint[1], [...company(), stage("A", "open"), stage("B", "open")])).toBe(
      "Perusahaan ini sudah punya 8 tahapan (maksimal 8).",
    );
    expect(createBlockReason(blueprint[1], company())).toBeNull();
  });
});

describe("checkPlan", () => {
  it("the starting plan is valid", () => {
    expect(planIsValid(checkPlan(initialPlan(blueprint, company(), {}), blueprint, company(), {}))).toBe(true);
  });

  it("more than 8 blocks the preview", () => {
    const seven = [...company(), stage("Demo", "open")];
    const plan = initialPlan(blueprint, seven, {});
    expect(plan[3].action).toBe("skip");
    plan[3] = chooseAction(3, "create");
    const check = checkPlan(plan, blueprint, seven, {});
    expect(check.total).toBe(9);
    expect(check.blocking).toBe("Maksimal 8 tahapan, termasuk yang non-aktif. Ubah beberapa jadi ganti nama atau jangan dipasang.");
  });

  it("a company already above 8 may still rename and skip", () => {
    const many = [...company(), stage("A", "open"), stage("B", "open"), stage("C", "open")];
    const plan = initialPlan(blueprint, many, {});
    const check = checkPlan(plan, blueprint, many, {});
    expect(check.blocking).toBeNull();
    expect(planIsValid(check)).toBe(true);
  });

  it("one stage can't be picked twice", () => {
    const plan = initialPlan(blueprint, company(), {});
    plan[1] = chooseAction(1, "assign", "Qualified");
    plan[3] = chooseAction(3, "assign", "Qualified");
    expect(checkPlan(plan, blueprint, company(), {}).rowErrors[3]).toBe("“Qualified” sudah dipilih di baris lain.");
  });

  it("an open stage can't take Prospect or Proposal; entry/quotation can't be added", () => {
    const plan = initialPlan(blueprint, company(), {});
    plan[1] = chooseAction(1, "assign", "Proposal");
    plan[0] = chooseAction(0, "create");
    plan[2] = chooseAction(2, "create");
    const check = checkPlan(plan, blueprint, company(), {});
    expect(check.rowErrors[1]).toBe("Tahapan ini tidak bisa diganti dengan tahapan dari template ini.");
    expect(check.rowErrors[0]).toBe("Pipeline hanya punya satu tahapan awal.");
    expect(check.rowErrors[2]).toBe("Pipeline hanya punya satu tahapan quotation.");
  });

  it("won/lost can't go elsewhere or be added", () => {
    const plan = initialPlan(blueprint, company(), {});
    plan[4] = chooseAction(4, "assign", "Qualified");
    plan[5] = chooseAction(5, "create");
    const check = checkPlan(plan, blueprint, company(), {});
    expect(check.rowErrors[4]).toBe("Tahapan ini tidak bisa diganti dengan tahapan dari template ini.");
    expect(check.rowErrors[5]).toBe("Pipeline hanya punya satu tahapan kalah.");
  });

  it("a stage that is gone (changed after the preview) is flagged", () => {
    const plan = initialPlan(blueprint, company(), {});
    const without = company().filter((s) => s.id !== "Prospect");
    expect(checkPlan(plan, blueprint, without, {}).rowErrors[0]).toBe("Tahapan tujuan sudah tidak ada. Pilih lagi.");
  });

  it("two stages ending up with the same name", () => {
    const plan = initialPlan(blueprint, company(), {});
    plan[1] = chooseAction(1, "assign", "Qualified");
    const clash = blueprint.map((s, i) => (i === 1 ? { ...s, name: "Negotiation" } : s));
    expect(checkPlan(plan, clash, company(), {}).rowErrors[1]).toBe("Nama “Negotiation” sudah dipakai tahapan lain.");
  });

  it("a renamed stage frees its old name for a new one", () => {
    const stages: BlueprintStage[] = [{ name: "Prospek", outcome: "entry" }, { name: "Prospect" }];
    const plan = [chooseAction(0, "assign", "Prospect"), chooseAction(1, "create")];
    expect(checkPlan(plan, stages, company(), {}).rowErrors).toEqual({});
  });

  it("an empty name after the variables", () => {
    const plan = [chooseAction(0, "create")];
    expect(checkPlan(plan, [{ name: "{{X}}" }].map((s) => ({ name: s.name.replace("{{X}}", " ") })), company(), {}).rowErrors[0]).toBe(
      "Nama tahapan kosong. Isi datanya di atas.",
    );
  });
});

describe("freeTargets / rowUsing", () => {
  it("what a row can still rename: not taken elsewhere, same name first", () => {
    const plan = initialPlan(blueprint, company(), {});
    // Row 1 (Kunjungan, open): only the open stages, Prospect/Proposal belong to their pairs.
    expect(freeTargets(1, plan, blueprint, company(), {}).map((s) => s.id)).toEqual(["Qualified", "Negotiation"]);
    // Row 0 keeps its own target.
    expect(freeTargets(0, plan, blueprint, company(), {})[0].id).toBe("Prospect");
    const named = [...company(), stage("Kunjungan / Survei", "open")];
    expect(freeTargets(1, initialPlan(blueprint, named, {}).map((r) => (r.index === 1 ? chooseAction(1, "skip") : r)), blueprint, named, {})[0].id).toBe(
      "Kunjungan / Survei",
    );
    expect(rowUsing(plan, "Prospect")).toBe(0);
    expect(rowUsing(plan, "Qualified")).toBeNull();
  });
});

describe("resultPipeline", () => {
  it("renamed in place, new ones before Won in template order, kept ones as they are", () => {
    const plan = initialPlan(blueprint, company(), {});
    const result = resultPipeline(plan, blueprint, company(), {});
    expect(result.stages.map((s) => [s.name, s.kind, s.previousName ?? ""])).toEqual([
      ["Prospek", "renamed", "Prospect"],
      ["Qualified", "kept", ""],
      ["Negotiation", "kept", ""],
      ["Simulasi & Pengajuan", "renamed", "Proposal"],
      ["Kunjungan / Survei", "new", ""],
      ["Proses Persetujuan", "new", ""],
      ["Akad / Serah Terima", "renamed", "Closed - Won"],
      ["Batal", "renamed", "Closed - Lost"],
    ]);
    expect(result.total).toBe(8);
    // Renamed and kept stages keep their colour; new ones get the API's default grey.
    expect(result.stages[0].color).toBe("#26C6F9");
    expect(result.stages[4].color).toBe("#9CA3AF");
  });

  it("inactive stages are not on the board but count", () => {
    const withInactive = [...company(), stage("Old", "open", { isActive: false })];
    const result = resultPipeline([], blueprint, withInactive, {});
    expect(result.stages).toHaveLength(6);
    expect(result).toMatchObject({ inactive: 1, total: 7 });
  });

  it("a rename to the same name is kept", () => {
    const result = resultPipeline([chooseAction(0, "assign", "Prospect")], [{ name: "prospect" }], company(), {});
    expect(result.stages[0]).toMatchObject({ kind: "kept", name: "prospect" });
  });
});

describe("summary and preview", () => {
  it("one line per blueprint stage", () => {
    const plan = initialPlan(blueprint, company(), {});
    expect(describePlan(plan, blueprint, company(), {})).toEqual([
      { index: 0, kind: "rename", text: "Prospect → Prospek" },
      { index: 1, kind: "create", text: "Kunjungan / Survei" },
      { index: 2, kind: "rename", text: "Proposal → Simulasi & Pengajuan" },
      { index: 3, kind: "create", text: "Proses Persetujuan" },
      { index: 4, kind: "rename", text: "Closed - Won → Akad / Serah Terima" },
      { index: 5, kind: "rename", text: "Closed - Lost → Batal" },
    ]);
    expect(renameCount(plan, blueprint, company(), {})).toBe(4);
  });

  it("a rename to the same name is not a change", () => {
    const plan = [chooseAction(0, "assign", "Prospect")];
    expect(describePlan(plan, [{ name: "prospect" }], company(), {})[0].kind).toBe("keep");
    expect(renameCount(plan, [{ name: "prospect" }], company(), {})).toBe(0);
  });
});
