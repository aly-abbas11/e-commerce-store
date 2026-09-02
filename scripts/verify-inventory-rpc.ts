/* eslint-disable @typescript-eslint/no-unused-vars */
import * as fs from "fs";
import * as path from "path";

/**
 * Hard safety gate ensuring staging targets do not touch production.
 */
function ensureStagingTarget() {
  if (process.env.IS_STAGING !== "true") {
    console.error("REFUSED: Explicit STAGING/TEST environment flag (IS_STAGING=true) is required.");
    process.exit(1);
  }

  // Load .env.staging manually
  const envStagingPath = path.resolve(process.cwd(), ".env.staging");
  if (fs.existsSync(envStagingPath)) {
    const content = fs.readFileSync(envStagingPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...rest] = trimmed.split("=");
        if (key && rest.length > 0) {
          const value = rest.join("=").trim().replace(/^['"](.*)['"]$/, "$1");
          process.env[key.trim()] = value;
        }
      }
    }
  }

  // Read production env to compare
  let prodUrl = "";
  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  const envPath = path.resolve(process.cwd(), ".env");

  // Manual parsing for production check
  const parseEnv = (p: string) => {
    const content = fs.readFileSync(p, "utf8");
    const parsed: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...rest] = trimmed.split("=");
        if (key && rest.length > 0) {
          parsed[key.trim()] = rest.join("=").trim().replace(/^['"](.*)['"]$/, "$1");
        }
      }
    }
    return parsed;
  };

  if (fs.existsSync(envLocalPath)) {
    const parsed = parseEnv(envLocalPath);
    prodUrl = parsed.NEXT_PUBLIC_SUPABASE_URL || "";
  } else if (fs.existsSync(envPath)) {
    const parsed = parseEnv(envPath);
    prodUrl = parsed.NEXT_PUBLIC_SUPABASE_URL || "";
  }

  // Read staging env
  let stagingUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let stagingServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  let stagingAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (fs.existsSync(envStagingPath)) {
    const parsed = parseEnv(envStagingPath);
    if (parsed.NEXT_PUBLIC_SUPABASE_URL) stagingUrl = parsed.NEXT_PUBLIC_SUPABASE_URL;
    if (parsed.SUPABASE_SERVICE_ROLE_KEY) stagingServiceRole = parsed.SUPABASE_SERVICE_ROLE_KEY;
    if (parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY) stagingAnonKey = parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  if (!stagingUrl) {
    console.error("REFUSED: No staging Supabase URL provided.");
    process.exit(1);
  }

  if (prodUrl && stagingUrl === prodUrl) {
    console.error("REFUSED: staging Supabase target matches production.");
    process.exit(1);
  }

  if (!stagingServiceRole || !stagingAnonKey) {
    console.error("REFUSED: Missing staging keys.");
    process.exit(1);
  }

  console.log("Staging target verified safe.");
  return { stagingUrl, stagingServiceRole, stagingAnonKey };
}

// ---------------------------------------------------------
// TEST HARNESS (Do not execute during Phase 1C)
// ---------------------------------------------------------

async function runTests() {
  const { stagingUrl, stagingServiceRole, stagingAnonKey } = ensureStagingTarget();
  console.log("Preparing to run inventory verification tests...");
  
  // Implementation of tests using supabase-js
  const { createClient } = await import("@supabase/supabase-js");
  const adminClient = createClient(stagingUrl, stagingServiceRole);
  
  // A. Parent product decrement
  // B. Variant decrement
  // C. Exact-stock purchase
  // D. Insufficient stock
  // E. NULL inventory rejection
  // F. Multi-item rollback
  // G. Cancellation restoration
  // H. Repeated cancellation idempotency

  // I. Final-unit concurrency race
  async function testConcurrencyRace() {
    console.log("Running concurrency race test...");
    // Pre-requisite: Setup VG_TEST_INVENTORY_ product with quantity=1
    const pItems = [{ slug: "VG_TEST_INVENTORY_RACE", quantity: 1 }];
    
    // Attempt two overlapping checkouts
    const results = await Promise.all([
      adminClient.rpc("checkout_decrement_inventory", { p_order_id: "T1", p_items: pItems, p_customer: {}, p_payment: "cod", p_subtotal: 0, p_shipping: 0, p_total: 0, p_is_demo: false }),
      adminClient.rpc("checkout_decrement_inventory", { p_order_id: "T2", p_items: pItems, p_customer: {}, p_payment: "cod", p_subtotal: 0, p_shipping: 0, p_total: 0, p_is_demo: false })
    ]);

    const successes = results.filter(r => !r.error && r.data?.ok).length;
    const failures = results.filter(r => r.error).length;

    if (successes !== 1 || failures !== 1) {
      throw new Error(`Concurrency race failed: expected 1 success, 1 failure. Got ${successes} successes, ${failures} failures.`);
    }
    console.log("Concurrency race passed.");
  }

  // J. RPC permissions
  async function testPermissions() {
    console.log("Running permissions test...");
    const anonClient = createClient(stagingUrl, stagingAnonKey);
    // (Authenticated client would need a generated JWT or auth session)
    
    const anonRes = await anonClient.rpc("checkout_decrement_inventory", {});
    if (!anonRes.error) throw new Error("Anon role should have been denied execution.");
    
    // Service role is already verified by other tests passing
    console.log("Permissions test passed.");
  }

  // NOTE: Test execution is deferred until staging environment is approved 
  // and migrations applied.
  // Cleanup must strictly target VG_TEST_INVENTORY_ prefix only.
  
  console.log("Harness prepared. Exiting without execution.");
}

// Only execute if invoked directly
if (require.main === module) {
  runTests().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
