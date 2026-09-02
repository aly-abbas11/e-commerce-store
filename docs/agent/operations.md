# VoltGear Operations Reference

## Merchant objective

Admin should help the operator understand what needs action and execute common workflows with minimal ambiguity.

## Order lifecycle

Respect the current code-defined lifecycle and transitions. Do not introduce new statuses casually. Customer/admin status changes must preserve inventory/order side effects and authorization.

## Inventory

Treat current numeric inventory/RPC architecture as authoritative when active. Never invent quantities. Concurrency/idempotency matter for checkout and cancellation.

## Homepage merchandising

Hero and homepage sections are structured merchant-controlled CMS surfaces. Admin ordering and visibility should deterministically control storefront presentation. Removing a relationship must not delete core products/media unless explicitly intended by existing media lifecycle.

## Support and policies

Customer-facing contact/shipping/returns/warranty information should route to real configured details/pages. Do not create trust copy without source-of-truth configuration.
