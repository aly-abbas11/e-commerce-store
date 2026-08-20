/**
 * Email delivery abstraction.
 *
 * Provider: Resend (https://resend.com). Set RESEND_API_KEY + FROM_EMAIL.
 * Without a key, emails are logged to the console (dev mode) so flows can be
 * developed and tested without a provider account.
 *
 * Swap provider by replacing `deliver()` with e.g. Mailchimp/Mailgun/Klaviyo.
 */

const BRAND_NAME = process.env.BRAND_NAME || "VoltGear";
const FROM_EMAIL =
  process.env.FROM_EMAIL || "VoltGear <no-reply@voltgear.store>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Format a price in Pakistani Rupees. */
function pkr(n: number): string {
  return `Rs ${n.toLocaleString("en-PK")}`;
}

/** Public order-tracking link for emails. */
function trackUrl(orderId: string, email: string): string {
  return `${SITE_URL}/track?orderId=${encodeURIComponent(
    orderId
  )}&email=${encodeURIComponent(email)}`;
}

function trackButton(orderId: string, email: string): string {
  return `<p style="margin-top:20px"><a href="${trackUrl(
    orderId,
    email
  )}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px">Track your order</a></p>`;
}

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

async function deliver(message: EmailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[email][dev] would send:", JSON.stringify(message, null, 2));
    return true;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });
  if (!res.ok) {
    console.error(
      `[email] send failed (${res.status}):`,
      await res.text().catch(() => "")
    );
    return false;
  }
  return true;
}

function shell({ title, body }: { title: string; body: string }): string {
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0b0f19;color:#e5e9f0;padding:24px;margin:0">
<div style="max-width:560px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:12px;padding:24px">
<h1 style="margin:0 0 4px;font-size:18px">${BRAND_NAME}</h1>
<p style="color:#8b93a7;margin:0 0 20px">${title}</p>
<div style="color:#e5e9f0;font-size:14px;line-height:1.6">${body}</div>
<p style="color:#8b93a7;font-size:12px;margin-top:24px">You received this email from ${BRAND_NAME}. ${BRAND_NAME}, all rights reserved.</p>
</div></body></html>`;
}

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
}

export const emailTemplates = {
  orderConfirmation(p: OrderEmailPayload): Omit<EmailMessage, "to"> {
    const rows = p.items
      .map(
        (i) =>
          `<tr><td style="padding:6px 0;border-bottom:1px solid #1f2937">${i.name}${
            i.variantName ? ` — ${i.variantName}` : ""
          } × ${i.quantity}</td><td style="text-align:right;color:#e5e9f0;white-space:nowrap">${pkr(
            i.price * i.quantity
          )}</td></tr>`
      )
      .join("");
    return {
      subject: `${BRAND_NAME} — Order ${p.orderId} confirmed`,
      text: `Hi ${p.name}, thanks for your order ${p.orderId}. Total: ${pkr(
        p.total
      )}. We'll email you tracking as soon as it ships.`,
      html: shell({
        title: "Order confirmed",
        body: `<p>Hi ${p.name}, thanks for your order!</p>
<table style="width:100%;border-collapse:collapse">${rows}
<tr><td style="padding-top:10px;font-weight:600">Total (paid on delivery)</td><td style="text-align:right;font-weight:600;white-space:nowrap">${pkr(p.total)}</td></tr></table>
<p>Order number: <strong>${p.orderId}</strong>. We'll email tracking updates as soon as it ships.</p>
${p.email ? trackButton(p.orderId, p.email) : ""}`,
      }),
    };
  },

  postPurchase(p: OrderEmailPayload): Omit<EmailMessage, "to"> {
    const first = p.items[0];
    const reviewUrl = `${
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }${first?.slug ? `/write-review?product=${first.slug}` : "/write-review"}`;
    return {
      subject: `How did ${first?.name ?? "your order"} work out?`,
      text: `Hi ${p.name}, we hope you're enjoying your order. We'd love your feedback — reviews help other shoppers decide with confidence.`,
      html: shell({
        title: "Share your experience",
        body: `<p>Hi ${p.name}, we hope you're enjoying your ${BRAND_NAME} order.</p>
<p>If you have a moment, please leave a review — real customer feedback is what helps other shoppers buy with confidence. You can even attach a photo of the product.</p>
<p style="margin-top:20px"><a href="${reviewUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px">Write a review</a></p>`,
      }),
    };
  },

  abandonedCart(p: {
    name?: string;
    items: { name: string; price: number; quantity: number }[];
    subtotal: number;
  }): Omit<EmailMessage, "to"> {
    const rows = p.items
      .map(
        (i) =>
          `<tr><td style="padding:4px 0;border-bottom:1px solid #1f2937">${i.name} × ${i.quantity}</td><td style="text-align:right;color:#e5e9f0;white-space:nowrap">${pkr(
            i.price * i.quantity
          )}</td></tr>`
      )
      .join("");
    return {
      subject: `Your ${BRAND_NAME} cart is waiting`,
      text: `Hi${p.name ? " " + p.name : ""}, you left items in your cart. Your order is ready whenever you are.`,
      html: shell({
        title: "You left something behind",
        body: `<p>Hi${p.name ? " " + p.name : ""}, your cart is still waiting for you.</p>
<table style="width:100%;border-collapse:collapse">${rows}
<tr><td style="padding-top:8px;font-weight:600">Subtotal</td><td style="text-align:right;font-weight:600;white-space:nowrap">${pkr(p.subtotal)}</td></tr></table>
<p style="margin-top:20px"><a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px">Complete your order</a></p>`,
      }),
    };
  },

  winback(p: { name?: string }): Omit<EmailMessage, "to"> {
    return {
      subject: `We miss you, ${p.name || "friend"}`,
      text: "It's been a while since your last order. New arrivals are in — and free shipping is waiting.",
      html: shell({
        title: "We miss you",
        body: `<p>Hi ${p.name || "there"}, it's been a while.</p>
<p>We've restocked and added new products since your last order. Come take a look.</p>
<p style="margin-top:20px"><a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/products" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px">Shop new arrivals</a></p>`,
      }),
    };
  },
};

export interface OrderStatusPayload {
  orderId: string;
  name: string;
  status: "new" | "processing" | "shipped" | "delivered" | "cancelled";
  note?: string;
  total?: number;
  email?: string;
}

const STATUS_COPY: Record<
  OrderStatusPayload["status"],
  { title: string; subject: string; body: string }
> = {
  new: {
    title: "Order received",
    subject: `Your order is confirmed`,
    body: `<p>Hi {name}, your order <strong>{orderId}</strong> is confirmed and we're on it.</p>`,
  },
  processing: {
    title: "We're preparing your order",
    subject: `We're preparing your order`,
    body: `<p>Hi {name}, your order <strong>{orderId}</strong> is being prepared and will ship shortly.</p>
<p>We'll email you again the moment it leaves our warehouse.</p>`,
  },
  shipped: {
    title: "Your order is on the way!",
    subject: `Your order is on the way!`,
    body: `<p>Hi {name}, great news — your order <strong>{orderId}</strong> has shipped.</p>
<p>It's on its way to your address and should arrive within the delivery window from your order confirmation.</p>`,
  },
  delivered: {
    title: "Your order has arrived",
    subject: `Your order has been delivered`,
    body: `<p>Hi {name}, your order <strong>{orderId}</strong> has been delivered.</p>
<p>We hope you love it. If anything isn't right, reply to this email and we'll make it right.</p>`,
  },
  cancelled: {
    title: "Your order was cancelled",
    subject: `Your order was cancelled`,
    body: `<p>Hi {name}, your order <strong>{orderId}</strong> has been cancelled.</p>
<p>As this was a cash-on-delivery order, no payment has been taken. If you cancelled by mistake or have any questions, reply to this email and we'll help.</p>`,
  },
};

export function buildOrderStatusEmail(
  p: OrderStatusPayload
): Omit<EmailMessage, "to"> {
  const copy = STATUS_COPY[p.status];
  const body = copy.body
    .replaceAll("{name}", p.name || "there")
    .replaceAll("{orderId}", p.orderId)
    .concat(
      p.note ? `<p style="margin-top:12px;padding:12px;border-left:3px solid #2563eb;background:rgba(37,99,235,0.08);border-radius:6px">${p.note}</p>` : ""
    )
    .concat(p.email ? trackButton(p.orderId, p.email) : "");

  return {
    subject: `${copy.subject} · ${p.orderId}`,
    text: `Hi ${p.name || "there"}, your order ${p.orderId} is now: ${p.status}.${
      p.note ? ` Note: ${p.note}` : ""
    }`,
    html: shell({ title: copy.title, body }),
  };
}

export async function sendOrderStatusUpdateEmail(
  to: string,
  payload: OrderStatusPayload
): Promise<boolean> {
  return deliver({ to, ...buildOrderStatusEmail({ ...payload, email: to }) });
}

export async function sendOrderConfirmationEmail(
  to: string,
  payload: OrderEmailPayload
): Promise<boolean> {
  return deliver({ to, ...emailTemplates.orderConfirmation({ ...payload, email: to }) });
}

export async function sendPostPurchaseEmail(
  to: string,
  payload: OrderEmailPayload
): Promise<boolean> {
  return deliver({ to, ...emailTemplates.postPurchase(payload) });
}

export async function sendAbandonedCartEmail(
  to: string,
  payload: { name?: string; items: OrderEmailPayload["items"]; subtotal: number }
): Promise<boolean> {
  return deliver({ to, ...emailTemplates.abandonedCart(payload) });
}

export async function sendWinbackEmail(
  to: string,
  payload: { name?: string }
): Promise<boolean> {
  return deliver({ to, ...emailTemplates.winback(payload) });
}
