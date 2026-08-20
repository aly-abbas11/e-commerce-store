import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";

export function CategoryPills({
  basePath = "/products",
  selected,
  counts,
}: {
  basePath?: string;
  selected?: string | null;
  counts: Record<string, number>;
}) {
  return (
    <nav
      aria-label="Product categories"
      className="mb-6 flex flex-wrap items-center gap-2"
    >
      <Button asChild variant={selected ? "outline" : "default"}>
        <Link href={basePath}>All Products</Link>
      </Button>
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.slug}
          asChild
          variant={selected === cat.slug ? "default" : "outline"}
        >
          <Link href={`${basePath}/${cat.slug}`}>
            {cat.label} <span className="ml-1 text-xs opacity-60">({counts[cat.slug] ?? 0})</span>
          </Link>
        </Button>
      ))}
    </nav>
  );
}
