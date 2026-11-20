import { describe, expect, it } from "vitest";
import { applyStageRequests, diffStages, nextColor, type StageApi } from "./useStageDraft";
import { insertBeforeWon, moveRow, type StageDraftRow } from "./stageRules";

const row = (key: string, outcome: StageDraftRow["outcome"], extra: Partial<StageDraftRow> = {}): StageDraftRow => ({
  key,
  id: key,
  name: key,
  color: "#26C6F9",
  outcome,
  isLocked: outcome !== "open",
  isActive: true,
  dealCount: 0,
  ...extra,
});

const saved = () => [
  row("p", "entry", { name: "Prospect" }),
  row("q", "open", { name: "Qualified" }),
  row("n", "open", { name: "Negotiation" }),
  row("pr", "quotation", { name: "Proposal" }),
  row("w", "won", { name: "Closed - Won" }),
  row("l", "lost", { name: "Closed - Lost" }),
  row("old", "open", { name: "Old", isActive: false }),
];
const added = (key: string, name: string): StageDraftRow => ({ ...row(key, "open", { name }), id: null });

describe("diffStages", () => {
  it("nothing changed, nothing to send", () => {
    expect(diffStages(saved(), saved())).toEqual([]);
  });

  it("deletes, then creates, then updates, then one reorder", () => {
    let draft = saved().filter((r) => r.key !== "n");
    draft = draft.map((r) => (r.key === "q" ? { ...r, name: " Interested " } : r));
    draft = insertBeforeWon(draft, added("new-1", "Survey"));
    draft = moveRow(draft, "new-1", "q");
    expect(diffStages(saved(), draft)).toEqual([
      { kind: "delete", id: "n", name: "Negotiation" },
      { kind: "create", key: "new-1", name: "Survey", color: "#26C6F9" },
      { kind: "update", id: "q", name: "Interested" },
      { kind: "reorder", keys: ["p", "new-1", "q", "pr", "w", "l"] },
    ]);
  });

  it("the reorder holds active stages only", () => {
    const draft = moveRow(saved(), "pr", "q");
    const reorder = diffStages(saved(), draft).find((r) => r.kind === "reorder");
    expect(reorder).toEqual({ kind: "reorder", keys: ["p", "pr", "q", "n", "w", "l"] });
  });

  it("no reorder when the API puts a new stage there anyway (before Won)", () => {
    const draft = insertBeforeWon(saved(), added("new-1", "Survey"));
    expect(diffStages(saved(), draft).map((r) => r.kind)).toEqual(["create"]);
  });

  it("no reorder for a delete alone", () => {
    expect(diffStages(saved(), saved().filter((r) => r.key !== "n"))).toEqual([{ kind: "delete", id: "n", name: "Negotiation" }]);
  });

  it("colour only, case does not count as a change", () => {
    const draft = saved().map((r) => (r.key === "w" ? { ...r, color: "#ec4899" } : r.key === "p" ? { ...r, color: "#26c6f9" } : r));
    expect(diffStages(saved(), draft)).toEqual([{ kind: "update", id: "w", color: "#ec4899" }]);
  });
});

describe("applyStageRequests", () => {
  const fakeApi = (failOn?: string) => {
    const calls: string[] = [];
    const api: StageApi = {
      remove: async (id) => { calls.push(`delete ${id}`); },
      create: async ({ name }) => {
        calls.push(`create ${name}`);
        if (failOn === "create") throw new Error("Name already used");
        return `id-${name}`;
      },
      update: async (id, body) => { calls.push(`update ${id} ${JSON.stringify(body)}`); },
      reorder: async (ids) => { calls.push(`reorder ${ids.join(",")}`); },
    };
    return { api, calls };
  };

  it("in order, with the new stage's id in the reorder", async () => {
    const draft = moveRow(insertBeforeWon(saved().filter((r) => r.key !== "n"), added("new-1", "Survey")), "new-1", "q");
    const { api, calls } = fakeApi();
    await applyStageRequests(diffStages(saved(), draft), api, draft);
    expect(calls).toEqual(["delete n", "create Survey", "reorder p,id-Survey,q,pr,w,l"]);
  });

  it("stops at the first failure and throws it", async () => {
    const draft = moveRow(insertBeforeWon(saved().filter((r) => r.key !== "n"), added("new-1", "Survey")), "new-1", "q");
    const { api, calls } = fakeApi("create");
    await expect(applyStageRequests(diffStages(saved(), draft), api, draft)).rejects.toThrow("Name already used");
    expect(calls).toEqual(["delete n", "create Survey"]);
  });
});

describe("nextColor", () => {
  it("the first palette colour not in use, grey when all are", () => {
    expect(nextColor([row("a", "open", { color: "#26C6F9" })])).toBe("#FDB528");
    const all = ["#26C6F9", "#FDB528", "#72E128", "#6D788D", "#666CFF", "#EF4444", "#9CA3AF", "#F97316", "#EC4899", "#14B8A6"];
    expect(nextColor(all.map((color, i) => row(String(i), "open", { color })))).toBe("#9CA3AF");
  });
});
