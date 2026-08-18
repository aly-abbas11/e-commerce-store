export const siteSettings = {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    {
      name: "brandName",
      title: "Brand Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "tagline",
      title: "Tagline",
      type: "string",
    },
    {
      name: "logo",
      title: "Logo",
      type: "image",
      description: "Recommended: transparent PNG, square",
    },
    {
      name: "primaryColor",
      title: "Primary Brand Color (hex)",
      type: "string",
      description: "e.g. #2563eb — used for buttons and accents",
    },
    {
      name: "secondaryColor",
      title: "Secondary Brand Color (hex)",
      type: "string",
      description: "e.g. #0ea5e9",
    },
    {
      name: "theme",
      title: "Color Theme",
      type: "string",
      options: {
        list: [
          {
            title: "Dark Premium (electric blue accents)",
            value: "dark",
          },
          {
            title: "Light Minimal (white/black)",
            value: "light",
          },
        ],
        layout: "radio",
      },
      initialValue: "dark",
      description:
        "Base theme. Brand colors above override the accent color on top of it. Visitors can switch dark/bright from the navbar toggle; this is the default for first-time visitors.",
    },
    {
      name: "headingFont",
      title: "Heading Font",
      type: "string",
      options: {
        list: [
          { title: "Space Grotesk (techy, geometric)", value: "space-grotesk" },
          { title: "Sora (bold, modern)", value: "sora" },
          { title: "System Sans", value: "system" },
        ],
        layout: "radio",
      },
      initialValue: "sora",
    },
    {
      name: "bodyFont",
      title: "Body Font",
      type: "string",
      options: {
        list: [
          { title: "Plus Jakarta Sans (friendly, readable)", value: "jakarta" },
          { title: "Inter (clean, readable)", value: "inter" },
          { title: "Manrope (friendly, readable)", value: "manrope" },
          { title: "System Sans", value: "system" },
        ],
        layout: "radio",
      },
      initialValue: "jakarta",
    },
    {
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "PKR",
      options: {
        list: ["PKR", "USD"],
      },
    },
    {
      name: "email",
      title: "Contact Email",
      type: "string",
    },
    {
      name: "phone",
      title: "Phone",
      type: "string",
    },
    {
      name: "address",
      title: "Address",
      type: "text",
      rows: 2,
    },
    {
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [
        {
          type: "object",
          name: "social",
          fields: [
            { name: "platform", title: "Platform", type: "string",
              description: "Icons are shown for: Facebook, Instagram, X (Twitter), TikTok, YouTube, LinkedIn, WhatsApp, Pinterest, GitHub, Website. Other values fall back to a globe icon.",
              options: {
                list: ["facebook", "instagram", "x", "youtube", "tiktok", "linkedin", "whatsapp", "pinterest", "github", "website"],
                allowCustomValue: true,
              },
            },
            { name: "url", title: "URL", type: "url" },
          ],
        },
      ],
    },
    {
      name: "freeShippingThreshold",
      title: "Free Shipping Threshold (PKR)",
      type: "number",
      description: "Orders above this amount ship free",
    },
    {
      name: "shippingFee",
      title: "Standard Shipping Fee (PKR)",
      type: "number",
      description: "Flat fee charged below the free-shipping threshold",
    },
    {
      name: "returnPolicy",
      title: "Return Policy (short summary)",
      type: "string",
      description: "Shown on every product page and in the cart, e.g. 'Free returns within 7 days'",
    },
    {
      name: "warrantyInfo",
      title: "Warranty Info (short summary)",
      type: "string",
      description: "Shown on every product page, e.g. '2-year warranty included'",
    },
    {
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        { name: "title", title: "Default Meta Title", type: "string" },
        {
          name: "description",
          title: "Default Meta Description",
          type: "text",
          rows: 2,
        },
      ],
    },
  ],
  preview: {
    select: { title: "brandName" },
  },
};
