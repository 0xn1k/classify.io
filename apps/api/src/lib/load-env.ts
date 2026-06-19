import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The API reads the repo-root .env — the single source of truth shared with the Prisma CLI.
// Resolved from this module's location so it works regardless of the process cwd.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

try {
  process.loadEnvFile(resolve(repoRoot, ".env"));
} catch {
  // No .env on disk — env is provided by the platform (e.g. production).
}
