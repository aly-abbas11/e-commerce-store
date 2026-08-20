#!/usr/bin/env node
/**
 * The 6 trust/legal pages (About, Contact, Privacy, Terms, Shipping & Returns, FAQ)
 * as plain data, reused by both seed-pages.mjs and seed-demo.mjs.
 *
 * Each page keeps stable non-dotted `_id` (the slug) so re-seeding upserts
 * in place — and so the docs stay publicly readable (dotted IDs are private).
 * Everything stays fully editable afterwards in Sanity Studio → Pages.
 */
let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const h = (level, text) => ({ _key: key(), _type: "heading", level, text });
const p = (text) => ({ _key: key(), _type: "paragraph", text });
const list = (type, items) => ({ _key: key(), _type: "list", type, items });
const callout = (title, text) => ({ _key: key(), _type: "callout", title, text });
const quote = (text) => ({ _key: key(), _type: "quote", text });
const cta = (label, href) => ({ _key: key(), _type: "cta", label, href });
const form = (heading = "Send us a Message") => ({ _key: key(), _type: "contactForm", heading });
const faq = (items) => ({
  _key: key(),
  _type: "faq",
  items: items.map(([question, answer]) => ({
    _key: key(),
    question,
    answer,
  })),
});

const pages = [
  {
    slug: "about",
    title: "About Us",
    excerpt:
      "Who we are, what we stand for, and why we started building smarter electronics accessories.",
    sections: [
      p(
        "VoltGear started with a simple frustration: decent accessories for phones, laptops and everyday electronics were either cheap and unreliable, or premium and wildly overpriced. We set out to build a middle ground — products that are genuinely well-engineered, honestly priced, and backed by a team you can actually reach."
      ),
      h("h2", "What we do"),
      p(
        "We design and curate a focused range of electronics accessories: power banks, chargers and cables, wireless earbuds, smartwatches and the accessories that keep them all working. Every product in our store has been tested by our team before it ships — we don't list anything we wouldn't use ourselves."
      ),
      h("h2", "What we stand for"),
      list("bullet", [
        "Honesty — real specs, real photos, real reviews. No inflated mAh numbers.",
        "Quality control — every batch is sample-tested before we sell it.",
        "Customer-first support — real humans answer every message.",
        "Fair prices — we skip middlemen and pass the difference on to you.",
      ]),
      callout(
        "Our promise",
        "If something you buy from us doesn't work as described, we'll make it right — with a replacement, a repair, or a full refund. No endless back-and-forth."
      ),
      h("h2", "Our story"),
      p(
        "We launched as a two-person operation selling a single power bank model. Word of mouth grew the store faster than any advertising we could have bought, because every unit that shipped worked, and every customer who wrote in got a straight answer."
      ),
      p(
        "Today we serve customers across the country with a small, focused catalog. We intend to keep it that way: fewer products, each one right, rather than thousands of items we can't stand behind."
      ),
      quote(
        "The best marketing is a product that works and support that answers."
      ),
      cta("Browse the store", "/products"),
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    excerpt:
      "Questions about an order, a product, or anything else? Send us a message and we'll help.",
    sections: [
      p(
        "Whether you need help with an order, a product question, or something else entirely, we'd love to hear from you. Send us a message and we'll help out."
      ),
      form(),
      h("h2", "Prefer to reach us directly?"),
      list("bullet", [
        "Email: support@voltgear.store — for order issues and returns",
        "Business hours: Monday – Saturday, 9:00 AM – 6:00 PM (PKT)",
        "Response: every message is read and answered",
      ]),
      callout(
        "Order support",
        "Have an order number handy? Including it in your message helps us resolve your query twice as fast."
      ),
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    excerpt:
      "What information we collect, why we collect it, and how we protect it.",
    sections: [
      p(
        "Last updated: August 2026. This Privacy Policy explains what information VoltGear collects when you visit our store, why we collect it, and the choices you have. By using our website you agree to the practices described here."
      ),
      h("h2", "Information we collect"),
      p("We collect only the information needed to run the store:"),
      list("bullet", [
        "Account information — name, email address and password (if you create an account).",
        "Order information — delivery address, phone number and order history.",
        "Payment information — for Cash on Delivery orders we record the order total and delivery details; no card details are involved.",
        "Contact messages — name, email and message content you submit through our contact form.",
        "Usage data — pages visited and device type, used in aggregate to improve the site.",
      ]),
      h("h2", "How we use your information"),
      list("bullet", [
        "To process and deliver your orders.",
        "To answer your questions and support requests.",
        "To send order updates and, only with your consent, occasional offers.",
        "To improve our products and website experience.",
        "To meet legal and accounting requirements.",
      ]),
      h("h2", "Cookies and similar technologies"),
      p(
        "We use essential cookies to keep your shopping cart working and to remember your preferences. Any advertising or analytics cookies are used only with your consent, and you can withdraw it at any time in your browser settings."
      ),
      h("h2", "Who we share data with"),
      p(
        "We never sell your personal information. We share it only with the service providers needed to operate the store — shipping carriers, payment processors, and our hosting and CMS providers (Sanity, Cloudinary, and the web analytics we use) — each bound by their own data-processing agreements."
      ),
      h("h2", "How long we keep it"),
      p(
        "Order records are kept for the period required by law and for warranty support. Contact messages are kept for 24 months so we can follow up. You can ask us to delete your data at any time."
      ),
      h("h2", "Your rights"),
      p(
        "You have the right to access, correct, export, or delete the personal data we hold about you, and to object to or restrict certain processing. To exercise any of these rights, contact us at support@voltgear.store — we respond within 30 days."
      ),
      h("h2", "Children's privacy"),
      p(
        "Our store is not directed at children under 13, and we do not knowingly collect information from them. If you believe a child has provided us personal data, contact us and we will delete it."
      ),
      h("h2", "Changes to this policy"),
      p(
        "If we change this policy, we will update the date at the top of this page and, for significant changes, notify you by email."
      ),
      h("h2", "Contact us"),
      p(
        "Questions about this policy? Email support@voltgear.store or use the contact page — we're happy to help."
      ),
      cta("Contact us", "/contact"),
    ],
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    excerpt:
      "The terms that apply when you shop with us — orders, pricing, returns and more.",
    sections: [
      p(
        "Last updated: August 2026. These Terms of Service govern your use of the VoltGear store and any purchases you make. By placing an order, you agree to these terms. If you have questions, contact us before ordering."
      ),
      h("h2", "Products and pricing"),
      p(
        "We make every effort to display product information, images and prices accurately. Prices are shown in your local currency and may change at any time; the price at checkout is the price you pay. In the rare case of a pricing error, we will contact you before processing the order."
      ),
      h("h2", "Orders and acceptance"),
      p(
        "Placing an order is an offer to purchase. We confirm acceptance when we send your order confirmation. We reserve the right to decline or cancel any order — for example if an item is out of stock, payment fails, or we suspect fraud — and we will refund any amount paid for cancelled orders."
      ),
      h("h2", "Payments"),
      p(
        "We accept the payment methods shown at checkout, including Cash on Delivery. Payment is due at checkout (or on delivery for COD orders). By providing payment details you confirm you are authorized to use them."
      ),
      h("h2", "Shipping and returns"),
      p(
        "Delivery costs and how returns work are described on the Shipping & Returns page, which is part of these terms. Return eligibility is confirmed per order — see that page for details."
      ),
      h("h2", "Warranty"),
      p(
        "Products come with the warranty stated on their product page. The warranty covers manufacturing defects under normal use and does not cover misuse, accidents, or unauthorized modification."
      ),
      h("h2", "Acceptable use"),
      list("bullet", [
        "Use the site only for lawful purposes.",
        "Do not attempt to interfere with the site's security or operation.",
        "Do not misuse our content, images, or product data — we hold the rights to them.",
      ]),
      h("h2", "Limitation of liability"),
      p(
        "To the maximum extent permitted by law, VoltGear's total liability for any claim related to a purchase is limited to the amount you paid for that purchase. We are not liable for indirect or consequential losses, including lost profits or data."
      ),
      h("h2", "Governing law"),
      p(
        "These terms are governed by the laws of Pakistan, and any disputes will be subject to the jurisdiction of its courts. We always try to resolve issues directly and amicably first — please give us the chance before any formal process."
      ),
      h("h2", "Changes to these terms"),
      p(
        "We may update these terms from time to time. The latest version is always on this page, with the date shown at the top. Continued use of the site after changes constitutes acceptance."
      ),
      h("h2", "Contact"),
      p(
        "Questions about these terms? Email support@voltgear.store or use the contact page."
      ),
      cta("Contact us", "/contact"),
    ],
  },
  {
    slug: "shipping-returns",
    title: "Shipping & Returns",
    excerpt:
      "Delivery costs, tracking, and how returns work — all in one place.",
    sections: [
      h("h2", "Shipping"),
      p(
        "We dispatch orders from our warehouse as quickly as possible after confirmation. You'll always get a tracking link by email as soon as your order ships."
      ),
      list("bullet", [
        "Standard delivery — PKR 199 flat rate.",
        "Free standard delivery on all orders over PKR 5,000.",
        "Cash on Delivery is available — pay when your order arrives.",
      ]),
      h("h2", "Tracking"),
      p(
        "As soon as your order ships, we email you a tracking link. You can also reply to any order email and we'll look it up for you."
      ),
      callout(
        "Delivery issues",
        "If your order hasn't arrived when you'd expect, contact us and we'll open a trace with the courier."
      ),
      h("h2", "Returns"),
      p(
        "If you're not happy with your order, contact us and we'll make it right. Returned items must be unused and in their original packaging, with all accessories included."
      ),
      h("h2", "How to return"),
      list("number", [
        "Email support@voltgear.store with your order number and the reason for the return.",
        "We'll confirm the return and tell you how to send the item back.",
        "Pack the item securely with its original packaging and hand it to the courier.",
        "Once we receive and check the item, your refund is processed.",
      ]),
      h("h2", "Refunds"),
      list("bullet", [
        "COD orders are refunded via bank transfer.",
        "You'll receive the refund details with your return confirmation.",
      ]),
      h("h2", "Damaged or faulty items"),
      p(
        "Received something damaged, or a product that stops working? Contact us right away with a photo or video, and we'll arrange a replacement or refund."
      ),
      h("h2", "Warranty"),
      p(
        "Every product carries the warranty stated on its product page where applicable. Contact us with your order number and we'll handle it."
      ),
      callout(
        "Questions?",
        "Not sure if an item qualifies for return? Just ask — we'd rather make it easy than lose a customer."
      ),
      cta("Start a return", "/contact"),
    ],
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    excerpt:
      "Answers to the questions we get most: shipping, returns, payments, warranty and more.",
    sections: [
      p(
        "Quick answers to the questions we hear most. Can't find yours? Send us a message and a real human will reply."
      ),
      faq([
        [
          "How long does delivery take?",
          "Orders are dispatched once confirmed, and you'll get a tracking link by email as soon as your order ships. Delivery times vary by courier and destination.",
        ],
        [
          "Do you offer Cash on Delivery?",
          "Yes, cash on delivery is available. A store representative may call to confirm larger orders before dispatch.",
        ],
        [
          "Do you deliver outside major cities?",
          "Yes — our courier network covers all major cities and most smaller towns. Enter your address at checkout and we'll confirm availability for your area.",
        ],
        [
          "What is your return policy?",
          "If you're not happy with your order, contact us and we'll make it right. See the Shipping & Returns page for the full process.",
        ],
        [
          "How long do refunds take?",
          "Once we receive and check the returned item, we'll process your refund. COD orders are refunded via bank transfer.",
        ],
        [
          "Are your products genuine?",
          "Every product is sample-tested by our team before we list it. If an item is ever not as described, contact us and we'll make it right.",
        ],
        [
          "Is my payment information secure?",
          "Yes. Orders are paid by cash on delivery, so no card details are ever involved.",
        ],
        [
          "What warranty comes with my purchase?",
          "Every product carries the warranty stated on its product page where applicable, covering manufacturing defects under normal use. Contact us with your order number and we'll handle it.",
        ],
        [
          "What if I receive a damaged item?",
          "Contact us with a photo or video and we'll arrange a replacement or refund.",
        ],
        [
          "Can I change or cancel my order?",
          "As long as your order hasn't shipped, yes — contact us and we'll update or cancel it free of charge. Once it's with the courier, you can refuse the package at delivery or start a return.",
        ],
        [
          "How do I track my order?",
          "A tracking link is emailed to you as soon as your order ships. You can also reply to any of our order emails and we'll check the status for you.",
        ],
        [
          "Do you ship internationally?",
          "We currently ship within Pakistan. If you're outside Pakistan, contact us and we'll let you know as soon as international shipping becomes available.",
        ],
      ]),
      callout(
        "Still have a question?",
        "Email support@voltgear.store or use the contact form — we answer every message."
      ),
      cta("Contact us", "/contact"),
    ],
  },
];

export { key, h, p, list, callout, quote, cta, form, faq };

export const TRUST_PAGES = pages.map((page) => ({
  _id: page.slug,
  _type: "page",
  title: page.title,
  slug: { _type: "slug", current: page.slug },
  pageType: "static",
  excerpt: page.excerpt,
  sections: page.sections,
  seo: {
    title: `${page.title} | VoltGear`,
    description: page.excerpt,
  },
}));
