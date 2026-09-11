import assert from "node:assert/strict";
import { test } from "node:test";
import pc from "picocolors";
import {
  formatReceipt,
  formatStats,
  parseShortstat,
} from "../src/receipt.js";

const plain = pc.createColors(false);
const color = pc.createColors(true);

test("parseShortstat reads files, insertions, deletions", () => {
  assert.deepEqual(
    parseShortstat(" 2 files changed, 87 insertions(+), 12 deletions(-)\n"),
    { files: 2, insertions: 87, deletions: 12 },
  );
});

test("parseShortstat handles singular and missing sides", () => {
  assert.deepEqual(parseShortstat(" 1 file changed, 1 insertion(+)"), {
    files: 1,
    insertions: 1,
    deletions: 0,
  });
  assert.deepEqual(parseShortstat(" 1 file changed, 12 deletions(-)"), {
    files: 1,
    insertions: 0,
    deletions: 12,
  });
  assert.deepEqual(parseShortstat(" 3 files changed"), {
    files: 3,
    insertions: 0,
    deletions: 0,
  });
  assert.deepEqual(parseShortstat(""), {
    files: 0,
    insertions: 0,
    deletions: 0,
  });
});

test("formatStats uses unicode minus and file plural", () => {
  assert.equal(formatStats({ files: 2, insertions: 87, deletions: 12 }), "2 files, +87\u221212");
  assert.equal(formatStats({ files: 1, insertions: 1, deletions: 0 }), "1 file, +1\u22120");
});

test("formatReceipt is a single line: short sha, branch, stats", () => {
  const line = formatReceipt(
    {
      shortSha: "9f3a1c2",
      branch: "vitnus/IAP",
      shortstat: " 2 files changed, 87 insertions(+), 12 deletions(-)",
    },
    plain,
  );
  assert.equal(line, "committed  9f3a1c2  vitnus/IAP  2 files, +87\u221212");
});

test("formatReceipt labels detached HEAD when branch is empty", () => {
  const line = formatReceipt(
    {
      shortSha: "abc1234",
      branch: "",
      shortstat: " 1 file changed, 4 insertions(+)",
    },
    plain,
  );
  assert.equal(line, "committed  abc1234  (detached HEAD)  1 file, +4\u22120");
});

test("formatReceipt applies mild colors when enabled", () => {
  const line = formatReceipt(
    {
      shortSha: "9f3a1c2",
      branch: "vitnus/IAP",
      shortstat: " 2 files changed, 87 insertions(+), 12 deletions(-)",
    },
    color,
  );
  assert.match(line, /\x1b\[32mcommitted\x1b\[39m/);
  assert.match(line, /\x1b\[36m/);
  assert.match(line, /\x1b\[1m9f3a1c2\x1b\[22m/);
  assert.match(line, /\x1b\[35mvitnus\/IAP\x1b\[39m/);
  assert.match(line, /\x1b\[2m2 files, \+87\u221212\x1b\[22m/);
  assert.doesNotMatch(line, /[0-9a-f]{40}/);
});
