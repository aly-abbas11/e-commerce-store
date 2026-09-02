/* eslint-disable @typescript-eslint/no-explicit-any */
export const reviewSubmission = {
  name: "reviewSubmission",
  title: "Review Submissions",
  type: "document",
  fields: [
    {
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (Rule: any) => Rule.required(),
    },
    { name: "name", title: "Customer Name", type: "string" },
    { name: "email", title: "Email", type: "string" },
    {
      name: "rating",
      title: "Rating (1-5)",
      type: "number",
      validation: (Rule: any) => Rule.required().min(1).max(5),
    },
    { name: "comment", title: "Comment", type: "text", rows: 4 },
    {
      name: "image",
      title: "Photo",
      type: "string",
      description: "URL of a photo the customer attached with the review (shown on the product page).",
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      description: "Category the customer selected when writing the review.",
    },
    {
      name: "productName",
      title: "Product Name",
      type: "string",
      description: "Denormalized product name shown in the moderation queue.",
    },
    {
      name: "verified",
      title: "Verified Purchase",
      type: "boolean",
      description:
        "True when the submitter's email matches a paid order for this product. Approve and copy into the product's reviews.",
      initialValue: false,
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending",
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "product.name",
      rating: "rating",
    },
    prepare: ({ title, subtitle, rating }: any) => ({
      title: title || "Anonymous",
      subtitle: `${subtitle ?? "?"} · ${rating ?? "?"}★`,
    }),
  },
};

export const order = {
  name: "order",
  title: "Orders",
  type: "document",
  fields: [
    {
      name: "orderId",
      title: "Order ID",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "customer",
      title: "Customer",
      type: "object",
      fields: [
        { name: "name", title: "Name", type: "string" },
        { name: "email", title: "Email", type: "string" },
        { name: "phone", title: "Phone", type: "string" },
        { name: "address", title: "Address", type: "string" },
        { name: "city", title: "City", type: "string" },
        { name: "postal", title: "Postal Code", type: "string" },
      ],
    },
    {
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "slug", title: "Slug", type: "string" },
            { name: "name", title: "Name", type: "string" },
            { name: "price", title: "Unit Price", type: "number" },
            { name: "quantity", title: "Quantity", type: "number" },
            { name: "variantKey", title: "Variant Key", type: "string" },
            { name: "variantName", title: "Variant Name", type: "string" },
            { name: "variantSku", title: "Variant SKU", type: "string" },
            { name: "lineTotal", title: "Line Total", type: "number" },
          ],
        },
      ],
    },
    {
      name: "payment",
      title: "Payment Method",
      type: "string",
      initialValue: "cod",
    },
    {
      name: "subtotal",
      title: "Subtotal",
      type: "number",
    },
    {
      name: "shipping",
      title: "Shipping",
      type: "number",
    },
    {
      name: "total",
      title: "Total",
      type: "number",
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "new",
      description:
        "Changing this via POST /api/orders/:orderId/status emails the customer automatically.",
    },
    {
      name: "statusUpdatedAt",
      title: "Status Updated At",
      type: "datetime",
      readOnly: true,
    },
    {
      name: "statusHistory",
      title: "Status History",
      type: "array",
      readOnly: true,
      of: [
        {
          type: "object",
          fields: [
            {
              name: "status",
              title: "Status",
              type: "string",
              options: {
                list: [
                  { title: "New", value: "new" },
                  { title: "Processing", value: "processing" },
                  { title: "Shipped", value: "shipped" },
                  { title: "Delivered", value: "delivered" },
                  { title: "Cancelled", value: "cancelled" },
                ],
              },
            },
            { name: "note", title: "Note", type: "string" },
            { name: "at", title: "At", type: "datetime" },
          ],
        },
      ],
    },
  ],
  preview: {
    select: { title: "orderId", subtitle: "customer.email" },
  },
};

export const emailEvent = {
  name: "emailEvent",
  title: "Email Flow Queue",
  type: "document",
  fields: [
    {
      name: "kind",
      title: "Flow",
      type: "string",
      options: {
        list: [
          { title: "Order confirmation", value: "order-confirmation" },
          { title: "Post-purchase (review request)", value: "post-purchase" },
          { title: "Abandoned cart", value: "abandoned-cart" },
          { title: "Win-back", value: "win-back" },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    { name: "email", title: "Recipient", type: "string" },
    { name: "data", title: "Payload (JSON)", type: "string" },
    {
      name: "dueAt",
      title: "Send After",
      type: "datetime",
      description: "Only sent once now() is past this timestamp",
    },
    {
      name: "sentAt",
      title: "Sent At",
      type: "datetime",
      description: "Set when the email has been delivered",
    },
  ],
  preview: {
    select: { title: "kind", subtitle: "email" },
  },
};

export const messageCampaign = {
  name: "messageCampaign",
  title: "Message Campaigns",
  type: "document",
  fields: [
    { name: "name", title: "Campaign Name", type: "string" },
    {
      name: "text",
      title: "Message",
      type: "text",
      rows: 4,
      description:
        "Plain text sent to each recipient. {name} is replaced with the customer's name.",
    },
    {
      name: "recipients",
      title: "Recipients & Delivery Report",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "phone", title: "Phone", type: "string" },
            { name: "name", title: "Name", type: "string" },
            {
              name: "status",
              title: "Status",
              type: "string",
              options: {
                list: [
                  { title: "Queued", value: "queued" },
                  { title: "Sent", value: "sent" },
                  { title: "Failed", value: "failed" },
                ],
              },
            },
            { name: "messageId", title: "Provider Message ID", type: "string" },
            { name: "sentAt", title: "Sent At", type: "datetime" },
            { name: "error", title: "Error", type: "string" },
          ],
        },
      ],
    },
    { name: "sent", title: "Sent Count", type: "number", initialValue: 0 },
    { name: "failed", title: "Failed Count", type: "number", initialValue: 0 },
    { name: "queued", title: "Queued Count", type: "number", initialValue: 0 },
  ],
  preview: {
    select: { title: "name", subtitle: "text" },
  },
};

export const broadcastSettings = {
  name: "broadcastSettings",
  title: "Broadcast Contacts",
  type: "document",
  fields: [
    {
      name: "manual",
      title: "Manually Added Numbers",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "id", title: "ID", type: "string" },
            { name: "phone", title: "Phone (+92…)", type: "string" },
            { name: "name", title: "Name", type: "string" },
            { name: "city", title: "City", type: "string" },
            { name: "note", title: "Note", type: "string" },
          ],
        },
      ],
    },
    {
      name: "suppressed",
      title: "Suppressed Numbers (won't receive broadcasts)",
      type: "array",
      of: [{ type: "string" }],
    },
  ],
};
