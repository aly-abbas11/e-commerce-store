# Performance & SEO Rule

Protect ecommerce performance and discoverability.

Prefer server rendering and existing RSC boundaries where appropriate. Avoid moving whole pages client-side for convenience. Avoid unnecessary dependencies and browser data waterfalls.

Use `next/image` correctly, accurate `sizes`, stable dimensions, priority only for genuine above-the-fold/LCP media and lazy loading below the fold.

Target good Core Web Vitals: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 where realistically measurable.

Preserve/add correct metadata, canonicals and structured data only when backed by real product/review/business information. Never emit fake aggregate-rating schema.
