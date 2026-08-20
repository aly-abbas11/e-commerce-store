import { TestimonialCard } from "@/components/sections/testimonial-card";
import type { Testimonial } from "@/lib/types";

export function TestimonialSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  if (!testimonials.length) return null;

  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Customer Stories
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          What Our Customers Say
        </h2>
      </div>

      {/* Horizontal scroll on mobile/tablet, grid on desktop */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:snap-none lg:grid-cols-3">
        {testimonials.slice(0, 6).map((testimonial) => (
          <div
            key={`${testimonial.customerName}-${testimonial.reviewText.slice(0, 16)}`}
            className="w-[85%] max-w-xs shrink-0 snap-center sm:w-[55%] md:w-auto md:max-w-none"
          >
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>
    </section>
  );
}
