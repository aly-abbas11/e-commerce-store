export const testimonial = {
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  fields: [
    {
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "reviewText",
      title: "Review Text",
      type: "text",
      rows: 4,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "rating",
      title: "Rating (1-5)",
      type: "number",
      validation: (Rule: any) => Rule.required().min(1).max(5),
      initialValue: 5,
    },
    {
      name: "product",
      title: "Product Purchased",
      type: "string",
      description: "Optional: which product this review is about",
    },
    {
      name: "verified",
      title: "Verified Purchase",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "sortOrder",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first on the homepage",
    },
    {
      name: "isDemo",
      title: "Demo/Fixture Testimonial",
      type: "boolean",
      description:
        "Seeded demo content used for development and tests. Demo testimonials are NEVER shown on the production storefront (queries exclude them).",
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: "customerName",
      subtitle: "product",
    },
  },
};
