import { runPostinstall } from "./postinstall.js";

try {
  runPostinstall();
} catch {
  // Never fail install.
}
