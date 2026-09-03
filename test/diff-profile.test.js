import assert from "node:assert/strict";
import { test } from "node:test";
import {
  countDiff,
  diffProfile,
  lengthInstruction,
} from "../src/diff-profile.js";

function unified({ path = "src/a.js", plus = 0, minus = 0 }) {
  const body = [
    `diff --git a/${path} b/${path}`,
    `--- a/${path}`,
    `+++ b/${path}`,
    "@@ -1,1 +1,1 @@",
    ...Array.from({ length: minus }, () => "-old"),
    ...Array.from({ length: plus }, () => "+new"),
  ];
  return body.join("\n");
}

function multi(files, plusEach = 1) {
  return files.map((path) => unified({ path, plus: plusEach })).join("\n");
}

test("countDiff ignores +++ --- headers", () => {
  const diff = unified({ plus: 3, minus: 2 });
  const { loc, files } = countDiff(diff);
  assert.equal(loc, 5);
  assert.equal(files, 1);
});

test("LOC buckets", () => {
  assert.equal(diffProfile(unified({ plus: 10 })).id, "tiny");
  assert.equal(diffProfile(unified({ plus: 20 })).id, "tiny");
  assert.equal(diffProfile(unified({ plus: 21 })).id, "small");
  assert.equal(diffProfile(unified({ plus: 80 })).id, "small");
  assert.equal(diffProfile(unified({ plus: 81 })).id, "medium");
  assert.equal(diffProfile(unified({ plus: 300 })).id, "medium");
  assert.equal(diffProfile(unified({ plus: 301 })).id, "large");
  assert.equal(diffProfile(unified({ plus: 800 })).id, "large");
  assert.equal(diffProfile(unified({ plus: 801 })).id, "xl");
});

test("many files bump tiny up to small", () => {
  const names = Array.from({ length: 8 }, (_, i) => `f${i}.js`);
  const p = diffProfile(multi(names, 1));
  assert.equal(p.loc, 8);
  assert.equal(p.files, 8);
  assert.equal(p.id, "small");
});

test("20 files bump at least medium", () => {
  const names = Array.from({ length: 20 }, (_, i) => `f${i}.js`);
  const p = diffProfile(multi(names, 1));
  assert.equal(p.id, "medium");
});

test("lengthInstruction is numeric and names the profile", () => {
  const p = diffProfile(unified({ plus: 5 }));
  const text = lengthInstruction(p);
  assert.match(text, /Profile: tiny/);
  assert.match(text, /WHY: exactly 1 bullet/);
  assert.match(text, /WHAT CHANGED: exactly 1 bullet/);
  assert.match(text, /5 line/);
  assert.match(text, /Never write "Updated N files\."/);
});
