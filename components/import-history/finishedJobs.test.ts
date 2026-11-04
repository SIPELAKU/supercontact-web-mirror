import { describe, expect, it } from "vitest";
import { freshlyFinishedJobs } from "./finishedJobs";

describe("freshlyFinishedJobs", () => {
  it("the first snapshot only seeds: jobs finished before opening do not reload the list", () => {
    const res = freshlyFinishedJobs(null, [
      { id: "a", status: "Completed" },
      { id: "b", status: "Rolled Back" },
      { id: "c", status: "Processing" },
    ]);
    expect(res.finished).toEqual([]);
    expect([...res.seen].sort()).toEqual(["a:Completed", "b:Rolled Back"]);
  });

  it("a job that completes while watched is reported once", () => {
    const first = freshlyFinishedJobs(null, [{ id: "c", status: "Processing" }]);
    const second = freshlyFinishedJobs(first.seen, [{ id: "c", status: "Completed" }]);
    expect(second.finished).toEqual(["c"]);
    const third = freshlyFinishedJobs(second.seen, [{ id: "c", status: "Completed" }]);
    expect(third.finished).toEqual([]);
  });

  it("a completed job that is then rolled back is reported again", () => {
    const seeded = freshlyFinishedJobs(null, [{ id: "a", status: "Completed" }]);
    expect(freshlyFinishedJobs(seeded.seen, [{ id: "a", status: "Rolled Back" }]).finished).toEqual(["a"]);
  });

  it("stopped, failed and running jobs never count", () => {
    const seeded = freshlyFinishedJobs(null, []);
    const res = freshlyFinishedJobs(seeded.seen, [
      { id: "x", status: "Stopped" },
      { id: "y", status: "Failed" },
      { id: "z", status: "Uploading" },
    ]);
    expect(res.finished).toEqual([]);
  });
});
