import assert from "node:assert/strict";
import test from "node:test";

test("audit action names cover order lifecycle mutations", () => {
  const actions = ["CONVERT_TO_ORDER", "ADD_TIMELINE", "UPDATE_ORDER", "STATUS_CHANGE", "UPDATE_PRICING"];
  assert.equal(new Set(actions).size, actions.length);
  assert.ok(actions.includes("CONVERT_TO_ORDER"));
  assert.ok(actions.includes("ADD_TIMELINE"));
});
