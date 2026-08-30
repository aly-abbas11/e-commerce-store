# VoltGear Staging Setup

1. **Create a separate Supabase project** for VoltGear staging.
2. **Obtain staging credentials**:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon/publishable key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Service-role key (`SUPABASE_SERVICE_ROLE_KEY`)
3. **Store them only in `.env.staging`** (or the project's approved local staging env mechanism).
4. **Never commit the real `.env.staging` file**.
5. **Run the staging-target safety check** before running staging verification to ensure it differs from production.
6. **Only then apply migrations** to the staging database.
7. **Use synthetic product/order records** for testing (e.g., prefixing them with `VG_TEST_INVENTORY_`).
8. **Never point concurrency/destructive tests at production.**
