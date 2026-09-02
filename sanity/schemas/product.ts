/* eslint-disable @typescript-eslint/no-explicit-any */
const categoryOptions = [
  { title: "Smartwatches", value: "smartwatch" },
  { title: "Power Banks", value: "power-bank" },
  { title: "Chargers & Adapters", value: "charger" },
  { title: "Earbuds & Handsfree", value: "earbuds" },
];

export const product = {
  name: "product",
  title: "Products",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule: any) => Rule.required().unique(),
    },
    {
      name: "brand",
      title: "Brand",
      type: "string",
      description: "Displayed next to the product name. Leave empty to hide (no default brand is assumed).",
    },
    {
      name: "sku",
      title: "SKU / Model Number",
      type: "string",
      description: "Optional product code. Shown only when set.",
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: { list: categoryOptions },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "price",
      title: "Price (USD)",
      type: "number",
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: "compareAtPrice",
      title: "Compare-at Price (USD)",
      type: "number",
      description: "Original price, shown struck-through when set",
    },
    {
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "Primary images. You can also add Cloudinary-hosted images below.",
    },
    {
      name: "cloudinaryImages",
      title: "Cloudinary Images (public IDs or URLs)",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Optional gallery entries hosted on Cloudinary (e.g. paste the public ID or image URL returned by the upload tool). Rendered auto-optimized (f_auto, q_auto, responsive widths).",
    },
    {
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      rows: 3,
    },
    {
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "features",
      title: "Key Features",
      type: "array",
      of: [{ type: "string" }],
      description: "Short factual bullet points shown in the Key Features section. Leave empty to hide the section.",
    },
    {
      name: "compatibility",
      title: "Compatibility",
      type: "array",
      of: [{ type: "string" }],
      description: "Factual compatibility notes, e.g. 'iPhone 15 Series' or 'USB-C laptops'. Only real, verified compatibility. Leave empty to hide the section.",
    },
    {
      name: "inTheBox",
      title: "What's in the Box",
      type: "array",
      of: [{ type: "string" }],
      description: "Included accessories, e.g. '1 x USB-C Cable' or '1 x User Guide'. Only genuinely included items. Leave empty to hide the section.",
    },
    {
      name: "productVideo",
      title: "Product Video",
      type: "object",
      description:
        "Optional product demonstration video. Only add a real video you have rights to use. The video section is hidden when empty.",
      fields: [
        {
          name: "url",
          title: "Video URL",
          type: "url",
          description: "Direct link to an MP4/webm file or a trusted video embed page.",
        },
        {
          name: "cloudinaryPublicId",
          title: "Cloudinary Video Public ID",
          type: "string",
          description: "Alternatively, the Cloudinary video public ID (e.g. products/demo.mp4).",
        },
        {
          name: "poster",
          title: "Poster Image",
          type: "image",
          description: "Poster frame shown while the video loads (recommended).",
        },
      ],
    },
    {
      name: "variants",
      title: "Variants (optional)",
      type: "array",
      description:
        "Optional variants such as colour, capacity, or connector. Add variants only for real options. The variant selector is hidden when no variants exist.",
      of: [
        {
          type: "object",
          name: "variant",
          fields: [
            { name: "name", title: "Variant Name", type: "string", description: "e.g. Black or 20,000mAh" },
            { name: "sku", title: "SKU (optional)", type: "string" },
            {
              name: "price",
              title: "Price (PKR) override",
              type: "number",
              description: "Leave empty to use the product's base price.",
              validation: (Rule: any) => Rule.min(0),
            },
            {
              name: "compareAtPrice",
              title: "Compare-at Price (PKR) override",
              type: "number",
              description: "Leave empty to use the product's compare-at price.",
              validation: (Rule: any) => Rule.min(0),
            },
            {
              name: "stockStatus",
              title: "Stock Status",
              type: "string",
              options: {
                list: [
                  { title: "In Stock", value: "in-stock" },
                  { title: "Low Stock", value: "low-stock" },
                  { title: "Out of Stock", value: "out-of-stock" },
                ],
              },
              initialValue: "in-stock",
            },
            {
              name: "image",
              title: "Variant Image (optional)",
              type: "image",
              description: "Shown in the gallery when this variant is selected.",
            },
            {
              name: "isDefault",
              title: "Default Variant",
              type: "boolean",
              description: "The variant selected by default. Only one should be marked default.",
              initialValue: false,
            },
          ],
        },
      ],
    },
    {
      name: "productFaq",
      title: "Product FAQ",
      type: "array",
      description: "Product-specific questions and answers. Only real, verifiable answers. Leave empty to hide the section.",
      of: [
        {
          type: "object",
          name: "faqItem",
          fields: [
            { name: "question", title: "Question", type: "string" },
            { name: "answer", title: "Answer", type: "text", rows: 4 },
          ],
        },
      ],
    },
    {
      name: "specifications",
      title: "Specifications",
      type: "array",
      of: [
        {
          type: "object",
          name: "spec",
          fields: [
            { name: "label", title: "Label", type: "string" },
            { name: "value", title: "Value", type: "string" },
          ],
        },
      ],
    },
    {
      name: "stockStatus",
      title: "Stock Status",
      type: "string",
      options: {
        list: [
          { title: "In Stock", value: "in-stock" },
          { title: "Low Stock", value: "low-stock" },
          { title: "Out of Stock", value: "out-of-stock" },
        ],
      },
      initialValue: "in-stock",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "rating",
      title: "Rating (0-5)",
      type: "number",
      validation: (Rule: any) => Rule.min(0).max(5),
      initialValue: 0,
    },
    {
      name: "reviewCount",
      title: "Review Count",
      type: "number",
      description: "Total number of reviews shown next to the rating",
      initialValue: 0,
    },
    {
      name: "reviews",
      title: "Customer Reviews",
      type: "array",
      of: [
        {
          type: "object",
          name: "review",
          fields: [
            { name: "name", title: "Customer Name", type: "string" },
            {
              name: "rating",
              title: "Rating (1-5)",
              type: "number",
              validation: (Rule: any) => Rule.min(1).max(5),
            },
            { name: "date", title: "Date", type: "datetime" },
            { name: "comment", title: "Comment", type: "text", rows: 4 },
            {
              name: "verified",
              title: "Verified Purchase",
              type: "boolean",
              description:
                "Show the verified-purchase badge. Set automatically when the reviewer's email matches an order.",
              initialValue: false,
            },
            {
              name: "isDemo",
              title: "Demo/Fixture Review",
              type: "boolean",
              description:
                "Seeded demo content used for development and tests. Demo reviews are NEVER shown on the production storefront (queries exclude them).",
              initialValue: false,
            },
          ],
        },
      ],
      description:
        "Reviews shown in the Reviews tab on the product page. Add/edit/delete freely — no code changes needed.",
    },
    {
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "badge",
      title: "Badge (e.g. New, Best Seller)",
      type: "string",
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "category",
      media: "images.0",
    },
  },
};
