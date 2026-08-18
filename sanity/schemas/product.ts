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
