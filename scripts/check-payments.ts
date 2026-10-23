import {
  paymentSetupChecks,
  type SetupCheck,
} from "../server/payments/readiness.js";
import { paymentDatabaseChecks } from "../server/payments/readiness-database.js";

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== "--database")) {
    console.error("Usage: pnpm payments:check [--database]");
    process.exitCode = 1;
    return;
  }
  const checks = paymentSetupChecks();
  if (args.includes("--database") && checks.every(check => check.ok)) {
    checks.push(
      ...(await paymentDatabaseChecks(
        process.env.PAYMENTS_SUPABASE_URL!,
        process.env.PAYMENTS_SUPABASE_SECRET_KEY!
      ))
    );
  } else if (args.includes("--database")) {
    console.log("Database checks skipped because configuration checks failed.");
  }
  for (const check of checks) print(check);
  if (checks.some(check => !check.ok)) process.exitCode = 1;
  console.log(
    process.env.PAYMENTS_ENABLED === "true"
      ? "Collection flag: enabled."
      : "Collection flag: disabled."
  );
  console.log(
    "No payments created. This checks configuration" +
      (args.includes("--database")
        ? " and database reads only."
        : " only; database checks were not requested.")
  );
  console.log(
    "Still verify deployed login, checkout, callback, signed webhook, and settlement separately."
  );
}
function print(check: SetupCheck) {
  console.log(
    `${check.ok ? "PASS" : "FAIL"} ${check.name}${check.ok ? "" : `: ${check.message}`}`
  );
}
main().catch(() => {
  console.error(
    "Setup check failed. Check connectivity and configuration; no secret values were logged."
  );
  process.exitCode = 1;
});
