import assert from "node:assert/strict";
import test from "node:test";
import { parsePagination } from "../src/lib/pagination";

test("pagination parser normalizes invalid values and caps limit", () => {
  assert.deepEqual(parsePagination(new URLSearchParams("page=bad&limit=999")), { page: 1, perPage: 100 });
  assert.deepEqual(parsePagination(new URLSearchParams("page=2.8&perPage=0")), { page: 2, perPage: 1 });
});
