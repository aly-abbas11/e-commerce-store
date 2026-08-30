/* eslint-disable @typescript-eslint/no-explicit-any */
export const heroSection = {
  name: "heroSection",
  title: "Hero Section",
  type: "document",
  fields: [
    {
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "subheadline",
      title: "Subheadline",
      type: "text",
      rows: 2,
    },
    {
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "backgroundVideo",
      title: "Background Video URL",
      type: "url",
      description:
        "Optional mp4 that plays muted & looped once the hero scrolls into view. Use a compressed file (ideally < 5MB) — it never blocks page load.",
    },
    {
      name: "primaryCta",
      title: "Primary CTA",
      type: "object",
      fields: [
        { name: "label", title: "Label", type: "string" },
        { name: "href", title: "Link", type: "string" },
      ],
    },
    {
      name: "secondaryCta",
      title: "Secondary CTA",
      type: "object",
      fields: [
        { name: "label", title: "Label", type: "string" },
        { name: "href", title: "Link", type: "string" },
      ],
    },
    {
      name: "stats",
      title: "Trust Stat Bar (3 numbers)",
      type: "array",
      of: [
        {
          type: "object",
          name: "stat",
          fields: [
            { name: "value", title: "Value", type: "string" },
            { name: "label", title: "Label", type: "string" },
          ],
        },
      ],
      validation: (Rule: any) => Rule.max(3),
      description:
        'Exactly 3 numbers shown under the headline, e.g. "12,000+" / "Happy Customers"',
    },
    {
      name: "featuredProduct",
      title: "Featured Product (floating card)",
      type: "reference",
      to: [{ type: "product" }],
    },
  ],
  preview: {
    select: { title: "headline" },
  },
};
