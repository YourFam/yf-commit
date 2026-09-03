import assert from "node:assert/strict";
import { test } from "node:test";
import {
  installHint,
  isGlobalNpmInstall,
  runPostinstall,
} from "../src/postinstall.js";

test("only npm_config_global=true is treated as -g", () => {
  assert.equal(isGlobalNpmInstall({ npm_config_global: "true" }), true);
  assert.equal(isGlobalNpmInstall({}), false);
  assert.equal(isGlobalNpmInstall({ npm_config_global: "false" }), false);
  assert.equal(isGlobalNpmInstall({ CI: "true" }), false);
});

test("runPostinstall writes hint only for -g", () => {
  const chunks = [];
  const write = (s) => chunks.push(s);
  assert.equal(runPostinstall({ npm_config_global: "true" }, write), true);
  assert.equal(chunks.join(""), `${installHint()}\n`);
  chunks.length = 0;
  assert.equal(runPostinstall({ npm_config_global: "false" }, write), false);
  assert.equal(chunks.length, 0);
});
