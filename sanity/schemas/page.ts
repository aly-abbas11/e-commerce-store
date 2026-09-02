/* eslint-disable @typescript-eslint/no-explicit-any */
export const page = {
  name: "page",
  title: "Pages (About, Contact, Blog…)",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Page Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule: any) => Rule.required().unique(),
    },
    {
      name: "pageType",
      title: "Page Type",
      type: "string",
      options: {
        list: [
          { title: "Static Page (About etc.)", value: "static" },
          { title: "Blog Post", value: "blog" },
        ],
      },
      initialValue: "static",
    },
    {
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 2,
      description: "Short summary shown in blog cards",
    },
    {
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    },
    {
      name: "author",
      title: "Author",
      type: "string",
    },
    {
      name: "sections",
      title: "Content Blocks",
      type: "array",
      of: [
        {
          type: "object",
          name: "heading",
          title: "Heading",
          fields: [
            { name: "text", title: "Text", type: "string" },
            {
              name: "level",
              title: "Level",
              type: "string",
              options: { list: ["h2", "h3", "h4"] },
            },
          ],
        },
        {
          type: "object",
          name: "paragraph",
          title: "Paragraph",
          fields: [{ name: "text", title: "Text", type: "text" }],
        },
        {
          type: "object",
          name: "list",
          title: "List",
          fields: [
            {
              name: "type",
              title: "List type",
              type: "string",
              options: {
                list: [
                  { title: "Bulleted", value: "bullet" },
                  { title: "Numbered", value: "number" },
                ],
              },
              initialValue: "bullet",
            },
            {
              name: "items",
              title: "Items",
              type: "array",
              of: [{ type: "string" }],
              validation: (Rule: any) => Rule.required().min(1),
            },
          ],
        },
        {
          type: "object",
          name: "callout",
          title: "Callout / Tip Box",
          fields: [
            { name: "title", title: "Title (optional)", type: "string" },
            { name: "text", title: "Text", type: "text" },
          ],
          description:
            "Highlighted box — great for pro tips, warnings or key takeaways.",
        },
        {
          type: "object",
          name: "relatedProducts",
          title: "Related Products",
          fields: [
            {
              name: "heading",
              title: "Heading (optional)",
              type: "string",
            },
            {
              name: "products",
              title: "Products",
              type: "array",
              of: [{ type: "reference", to: [{ type: "product" }] }],
              description:
                "Show product cards inside the post to tie content back to the store.",
            },
          ],
        },
        {
          type: "object",
          name: "faq",
          title: "FAQ Items",
          description:
            "Expandable question/answer pairs — perfect for a FAQ page.",
          fields: [
            {
              name: "items",
              title: "Questions",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "item",
                  fields: [
                    {
                      name: "question",
                      title: "Question",
                      type: "string",
                      validation: (Rule: any) => Rule.required(),
                    },
                    {
                      name: "answer",
                      title: "Answer",
                      type: "text",
                      rows: 3,
                      validation: (Rule: any) => Rule.required(),
                    },
                  ],
                },
              ],
              validation: (Rule: any) => Rule.required().min(1),
            },
          ],
        },
        {
          type: "object",
          name: "inlineImage",
          title: "Image",
          description:
            "Member is named inlineImage (not image) to avoid colliding with Sanity's built-in image type.",
          fields: [{ name: "image", title: "Image", type: "image" }],
        },
        {
          type: "object",
          name: "quote",
          title: "Quote",
          fields: [{ name: "text", title: "Text", type: "text" }],
        },
        {
          type: "object",
          name: "cta",
          title: "Call to Action",
          fields: [
            { name: "label", title: "Label", type: "string" },
            { name: "href", title: "Link", type: "string" },
          ],
        },
        {
          type: "object",
          name: "contactForm",
          title: "Contact Form",
          fields: [{ name: "heading", title: "Heading", type: "string" }],
        },
      ],
    },
    {
      name: "keywords",
      title: "SEO Keywords",
      type: "array",
      of: [{ type: "string" }],
      description: "Comma-separated topics this post targets (used in meta).",
    },
    {
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        { name: "title", title: "Meta Title", type: "string" },
        { name: "description", title: "Meta Description", type: "text", rows: 2 },
      ],
    },
  ],
  preview: {
    select: { title: "title" },
  },
};
