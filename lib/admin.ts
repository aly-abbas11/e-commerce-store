/**
 * Shared Bearer-token guard for admin-only API routes.
 * Accepts ADMIN_TOKEN, falling back to REVALIDATION_TOKEN and finally the
 * demo default so localhost demos work out of the box. Set ADMIN_TOKEN to a
 * real value in production.
 */
export function isAdminRequest(request: Request): boolean {
  const token =
    process.env.ADMIN_TOKEN ||
    process.env.REVALIDATION_TOKEN ||
    "voltgear-demo-revalidate";
  const auth = request.headers.get("authorization") || "";
  const provided = auth.replace(/^Bearer\s+/i, "");
  return Boolean(provided) && provided === token;
}
