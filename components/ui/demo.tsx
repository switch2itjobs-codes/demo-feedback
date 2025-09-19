"use client";
import React from "react";
import { TestimonialsColumn, Testimonial } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    console.log('Starting to fetch testimonials from Google Sheets...');
    
    // Use Google Sheets API route
    const res = await fetch('/api/testimonials');
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Testimonials loaded:', data.items.length);
    
    // Sort by date (latest first) and limit to 9
    const sortedTestimonials = data.items
      .sort((a: Testimonial, b: Testimonial) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 9);

    console.log('Processed testimonials:', sortedTestimonials.length);
    return sortedTestimonials;
  } catch (error) {
    console.error('Error fetching testimonials from Google Sheets:', error);
    
    // Return empty array instead of dummy data
    console.log('No testimonials available from Google Sheets');
    return [];
  }
}


// Simple client loader component
function useTestimonials() {
  const [items, setItems] = React.useState<Testimonial[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    console.log('useTestimonials: Starting to fetch...');
    fetchTestimonials()
      .then((data) => {
        console.log('useTestimonials: Data received:', data.length, 'items');
        setItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('useTestimonials: Error:', error);
        setItems([]);
        setLoading(false);
      });
  }, []);
  
  return { items, loading };
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
  const { items, loading } = useTestimonials();
  const testimonials = items ?? [];
  const allTypes = React.useMemo(
    () => Array.from(new Set(testimonials.map((t) => t.reviewType).filter(Boolean))),
    [testimonials],
  );

  type Selection = "ALL" | string;
  const [selected, setSelected] = React.useState<Selection>("ALL");
  const [mounted, setMounted] = React.useState(false);

  // Fix hydration issues
  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <section className="bg-white text-neutral-900 my-20 relative">
        <div className="container z-10 mx-auto">
          <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto">
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-xl font-bold mb-2">Loading Testimonials...</h2>
              <p className="text-neutral-600">Preparing content...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="bg-white text-neutral-900 my-20 relative">
        <div className="container z-10 mx-auto">
          <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto">
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-xl font-bold mb-2">Loading Testimonials...</h2>
              <p className="text-neutral-600">Fetching data from Google Sheets...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
            Our student experiences captured from demos, training, and ongoing support
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


