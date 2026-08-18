import { groq } from "next-sanity";

export const productFields = groq`
  _id,
  name,
  "slug": slug.current,
  category,
  price,
  compareAtPrice,
  images,
  cloudinaryImages,
  shortDescription,
  features,
  specifications,
  stockStatus,
  rating,
  reviewCount,
  reviews,
  featured,
  badge,
  description[]{
    ...,
    _type == "image" => {
      ...,
      asset->,
      "dimensions": asset->metadata.dimensions
    }
  }
`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    brandName,
    tagline,
    logo,
    primaryColor,
    secondaryColor,
    theme,
    headingFont,
    bodyFont,
    currency,
    email,
    phone,
    address,
    socialLinks,
    freeShippingThreshold,
    shippingFee,
    returnPolicy,
    warrantyInfo,
    seo
  }
`;

export const heroQuery = groq`
  *[_type == "heroSection"][0]{
    headline,
    subheadline,
    backgroundImage,
    backgroundVideo,
    primaryCta,
    secondaryCta,
    stats[]{
      value,
      label
    },
    "featuredProduct": featuredProduct->{
      ${productFields}
    }
  }
`;

export const productsQuery = groq`
  *[_type == "product"] | order(_createdAt desc){
    ${productFields}
  }
`;

export const featuredProductsQuery = groq`
  *[_type == "product" && featured == true] | order(_createdAt desc)[0..7]{
    ${productFields}
  }
`;

export const productsByCategoryQuery = groq`
  *[_type == "product" && category == $category] | order(_createdAt desc){
    ${productFields}
  }
`;

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0]{
    ${productFields}
  }
`;

export const productSlugsQuery = groq`
  *[_type == "product"]{ "slug": slug.current }
`;

export const searchProductsQuery = groq`
  *[_type == "product" && (name match $q || category match $q || badge match $q)]
    | order(_createdAt desc){
    ${productFields}
  }
`;

export const searchSuggestionsQuery = groq`
  *[_type == "product" && name match $q] | order(_createdAt desc)[0..5]{
    _id,
    "slug": slug.current,
    name,
    price,
    images,
    cloudinaryImages
  }
`;

export const ordersQuery = groq`
  *[_type == "order"] | order(_createdAt asc){
    _id,
    orderId,
    customer,
    items,
    payment,
    subtotal,
    shipping,
    total,
    status,
    "createdAt": _createdAt
  }
`;

export const ordersByEmailQuery = groq`
  *[_type == "order" && customer.email == $email] | order(_createdAt desc){
    _id,
    orderId,
    customer,
    items,
    payment,
    subtotal,
    shipping,
    total,
    status,
    "createdAt": _createdAt
  }
`;

export const pendingEmailEventsQuery = groq`
  *[_type == "emailEvent" && !defined(sentAt) && dueAt <= $now] | order(dueAt asc){
    _id,
    kind,
    email,
    data,
    dueAt
  }
`;

export const recentWinbackQuery = groq`
  *[_type == "emailEvent" && kind == "win-back" && email == $email && _createdAt > $since][0]._id
`;

export const categoriesQuery = groq`
  array::unique(*[_type == "product"].category)
`;

export const testimonialsQuery = groq`
  *[_type == "testimonial"] | order(sortOrder asc, _createdAt desc){
    customerName,
    reviewText,
    rating,
    product,
    verified,
    sortOrder
  }
`;

/** Approved customer reviews for a product (surfaced on the product page). */
export const approvedReviewsQuery = groq`
  *[_type == "reviewSubmission" && product._ref == $productId && status == "approved"] | order(_createdAt desc){
    name,
    rating,
    comment,
    "date": _createdAt,
    verified,
    image,
    productName
  }
`;

/** Lightweight product list for the write-a-review picker. */
export const reviewProductsQuery = groq`
  *[_type == "product"] | order(name asc){
    _id,
    "slug": slug.current,
    name,
    category,
    "image": image.asset->url
  }
`;

export const pagesQuery = groq`
  *[_type == "page" && pageType == "static"] | order(title asc){
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    sections,
    seo
  }
`;

export const pageSectionsQuery = groq`
  sections[]{
    ...,
    _type == "relatedProducts" => {
      ...,
      products[]->{
        ${productFields}
      }
    },
    _type == "image" => {
      ...,
      asset->,
      "dimensions": asset->metadata.dimensions
    }
  }
`;

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    pageType,
    excerpt,
    coverImage,
    publishedAt,
    author,
    keywords,
    sections[]{
      ...,
      _type == "relatedProducts" => {
        ...,
        products[]->{
          ${productFields}
        }
      },
      _type == "image" => {
        ...,
        asset->,
        "dimensions": asset->metadata.dimensions
      }
    },
    seo
  }
`;

export const blogPostsQuery = groq`
  *[_type == "page" && pageType == "blog"] | order(publishedAt desc){
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    publishedAt,
    author,
    seo
  }
`;

export const pageSlugsQuery = groq`
  *[_type == "page"]{ "slug": slug.current }
`;
