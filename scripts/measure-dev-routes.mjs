/**
 * Measures dev route compile times. Run while `npm run dev` is active.
 * Usage: node scripts/measure-dev-routes.mjs [baseUrl]
 */
const baseUrl = process.argv[2] ?? "http://localhost:3000";

const routes = [
  "/onboarding",
  "/dashboard",
  "/learn/vpc-networking",
  "/assessment/vpc-networking",
];

async function measureRoute(path) {
  const url = `${baseUrl}${path}`;
  const start = performance.now();
  const response = await fetch(url, { redirect: "follow" });
  const elapsed = Math.round(performance.now() - start);
  return { path, status: response.status, ms: elapsed };
}

async function main() {
  console.log(`Measuring routes against ${baseUrl}`);
  for (const path of routes) {
    try {
      const result = await measureRoute(path);
      console.log(`${result.path}: ${result.ms}ms (HTTP ${result.status})`);
    } catch (error) {
      console.log(`${path}: failed — ${error instanceof Error ? error.message : error}`);
    }
  }
}

main();
