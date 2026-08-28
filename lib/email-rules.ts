import type { OrderStatus } from "./types";

import { publicSiteUrl } from "./deploy-rules";

const BRAND_NAME = process.env.BRAND_NAME || "VoltGear";

export interface OrderEmailPayload {
  orderId: string;
  name: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    slug?: string;
    variantName?: string;
  }[];
  total: number;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal?: string;
}

export interface OrderStatusEmailPayload {
  orderId: string;
  name: string;
  status: OrderStatus;
  note?: string;
  total?: number;
  email?: string;
  phone?: string;
  address?: string;
}

export interface BuiltEmail {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pkr(n: number): string {
  return `Rs ${n.toLocaleString("en-PK")}`;
}

export function trackUrl(orderId: string, email: string): string {
  return `${publicSiteUrl()}/track?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`;
}

function trackButton(orderId: string, email: string): string {
  return `<p style="margin:24px 0 0"><a href="${trackUrl(
    orderId,
    email
  )}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-size:14px;font-weight:600">Track your order</a></p>`;
}

export function orderShell({ title, body }: { title: string; body: string }): string {
  return `<!doctype html>
<html><body style="margin:0;padding:16px;background:#f4f4f5;color:#18181b;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:24px">
<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#71717a">${escapeHtml(
    BRAND_NAME
  )}</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">${title}</h1>
<div style="font-size:15px;line-height:1.6;color:#27272a">${body}</div>
<p style="margin:28px 0 0;font-size:12px;color:#71717a">You received this email from ${escapeHtml(
    BRAND_NAME
  )} because you placed an order.</p>
</div></body></html>`;
}

export function bccList(to: string, notifyEmail?: string | null): string[] {
  const notify = (notifyEmail ?? "").trim();
  if (!notify) return [];
  if (notify.toLowerCase() === to.trim().toLowerCase()) return [];
  return [notify];
}

export function buildOrderConfirmationEmail(p: OrderEmailPayload): BuiltEmail {
  const name = escapeHtml(p.name || "there");
  const rows = p.items
    .map((i) => {
      const label = `${escapeHtml(i.name ?? "")}${
        i.variantName ? ` — ${escapeHtml(i.variantName)}` : ""
      } × ${i.quantity}`;
      return `<tr><td style="padding:8px 0;border-bottom:1px solid #e4e4e7">${label}</td><td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;white-space:nowrap">${pkr(
        (i.price ?? 0) * (i.quantity ?? 1)
      )}</td></tr>`;
    })
    .join("");

  const addressBits = [p.address, [p.city, p.postal].filter(Boolean).join(" "), p.phone].filter(
    (part) => Boolean(part && String(part).trim())
  ) as string[];
  const addressHtml = addressBits.length
    ? `<p style="margin:16px 0 4px;color:#71717a;font-size:13px">Deliver to</p>
<p style="margin:0">${addressBits.map((b) => escapeHtml(b)).join("<br>")}</p>`
    : "";

  const body = `<p style="margin:0 0 12px">Hi ${name}, thanks — we have your order.</p>
<p style="margin:0 0 16px">Pay <strong>cash on delivery</strong> when it arrives. Please check the address below.</p>
<p style="margin:0 0 8px;font-size:13px;color:#71717a">Order <strong style="color:#18181b">${escapeHtml(
    p.orderId
  )}</strong></p>
<table style="width:100%;border-collapse:collapse">${rows}
<tr><td style="padding-top:12px;font-weight:600">Total</td><td style="padding-top:12px;font-weight:600;text-align:right;white-space:nowrap">${pkr(
    p.total
  )}</td></tr></table>
${addressHtml}
${p.email ? trackButton(p.orderId, p.email) : ""}`;

  return {
    subject: `${BRAND_NAME} — Order ${p.orderId} confirmed`,
    text: `Hi ${p.name || "there"}, we have your order ${p.orderId}. Total ${pkr(
      p.total
    )}. Pay cash on delivery. Track: ${p.email ? trackUrl(p.orderId, p.email) : ""}`,
    html: orderShell({ title: "Order confirmed", body }),
  };
}

const STATUS_COPY: Record<
  OrderStatus,
  { title: string; subject: string; body: string }
> = {
  new: {
    title: "Order received",
    subject: "Your order is confirmed",
    body: `<p style="margin:0 0 12px">Hi {name}, your order <strong>{orderId}</strong> is confirmed.</p>`,
  },
  processing: {
    title: "We're packing your order",
    subject: "We're packing your order",
    body: `<p style="margin:0 0 12px">Hi {name}, your order <strong>{orderId}</strong> is being packed.</p>
<p style="margin:0">We'll email you again when it ships.</p>`,
  },
  shipped: {
    title: "Your order is on the way",
    subject: "Your order is on the way",
    body: `<p style="margin:0 0 12px">Hi {name}, your order <strong>{orderId}</strong> has shipped.</p>
<p style="margin:0">It's on its way to the address you gave at checkout.</p>`,
  },
  delivered: {
    title: "Your order has arrived",
    subject: "Your order has been delivered",
    body: `<p style="margin:0 0 12px">Hi {name}, your order <strong>{orderId}</strong> has been delivered.</p>
<p style="margin:0">If anything isn't right, reply to this email and we'll help.</p>`,
  },
  cancelled: {
    title: "Your order was cancelled",
    subject: "Your order was cancelled",
    body: `<p style="margin:0 0 12px">Hi {name}, your order <strong>{orderId}</strong> has been cancelled.</p>
<p style="margin:0">This was cash on delivery, so nothing was charged. If this was a mistake, reply to this email.</p>`,
  },
};

export function buildOrderStatusEmail(p: OrderStatusEmailPayload): BuiltEmail {
  const copy = STATUS_COPY[p.status];
  const note = p.note?.trim();
  let body = copy.body
    .replaceAll("{name}", escapeHtml(p.name || "there"))
    .replaceAll("{orderId}", escapeHtml(p.orderId));
  if (note) {
    body += `<p style="margin:16px 0 0;padding:12px;border-left:3px solid #18181b;background:#f4f4f5;border-radius:6px">${escapeHtml(
      note
    )}</p>`;
  }
  if (p.email) body += trackButton(p.orderId, p.email);

  return {
    subject: `${copy.subject} · ${p.orderId}`,
    text: `Hi ${p.name || "there"}, your order ${p.orderId} is now: ${p.status}.${
      note ? ` Note: ${note}` : ""
    }${p.email ? ` Track: ${trackUrl(p.orderId, p.email)}` : ""}`,
    html: orderShell({ title: copy.title, body }),
  };
}
