"use client";
import React from "react";
import { TestimonialsColumn, Testimonial } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await fetch("/api/testimonials", { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.items as Testimonial[];
}

// Simple client loader component
function useTestimonials() {
  const [items, setItems] = React.useState<Testimonial[] | null>(null);
  React.useEffect(() => {
    fetchTestimonials().then(setItems).catch(() => setItems([]));
  }, []);
  return items;
}

function badgeClass(type?: string): string {
  const t = (type || "").toLowerCase();
  if (t.includes("demo")) return "bg-green-50 text-green-800 border-green-200";
  if (t.includes("sales")) return "bg-yellow-50 text-yellow-800 border-yellow-200";
  if (t.includes("support")) return "bg-blue-50 text-blue-800 border-blue-200";
  if (t.includes("course")) return "bg-orange-50 text-orange-800 border-orange-200";
  return "bg-neutral-50 text-neutral-700 border-neutral-200";
}

const Testimonials: React.FC = () => {
  const items = useTestimonials();
  const testimonials = items ?? [];
  const allTypes = React.useMemo(
    () => Array.from(new Set(testimonials.map((t) => t.reviewType).filter(Boolean))),
    [testimonials],
  );

  type Selection = "ALL" | string;
  const [selected, setSelected] = React.useState<Selection>("ALL");

  const filtered = React.useMemo(() => {
    let result = testimonials;
    
    // Filter by review type if not "ALL"
    if (selected !== "ALL") {
      result = result.filter((t) => t.reviewType === selected);
    }
    
    // Sort by date (latest first)
    return result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Descending order (latest first)
    });
  }, [testimonials, selected]);

  const firstColumn = filtered.slice(0, 3);
  const secondColumn = filtered.slice(3, 6);
  const thirdColumn = filtered.slice(6, 9);

  const [paused, setPaused] = React.useState(false);

  return (
    <section className="bg-white text-neutral-900 my-20 relative">
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-neutral-200 bg-white text-neutral-700 py-1 px-4 rounded-lg">
              Testimonials
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5">
            What our users say
          </h2>
          <p className="text-center mt-5 text-neutral-600 whitespace-nowrap overflow-hidden text-ellipsis text-sm sm:text-base">
            Our Student experiences captured from demos, training, and ongoing support
          </p>
        </motion.div>

        {/* Filters */}
        {allTypes.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => setSelected("ALL")}
              aria-pressed={selected === "ALL"}
              className={`inline-flex items-center rounded-full border px-[0.6rem] py-[0.325rem] text-sm font-semibold tracking-tight leading-none ${
                selected === "ALL"
                  ? "ring-2 ring-black/20 shadow-sm"
                  : "opacity-70 hover:opacity-100"
              } ${badgeClass("all")}`}
            >
              All
            </button>
            {allTypes.map((t) => {
              const active = selected === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(t)}
                  className={`inline-flex items-center rounded-full border px-[0.6rem] py-[0.325rem] text-sm font-semibold tracking-tight leading-none ${
                    active
                      ? "ring-2 ring-black/20 shadow-sm"
                      : "opacity-70 hover:opacity-100"
                  } ${badgeClass(t)}`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}

        <div
          className={`flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] ${paused ? "overflow-y-auto" : "overflow-hidden"}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} paused={paused} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} paused={paused} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} paused={paused} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;


