"use client";
import React from "react";
import { TestimonialsColumn, Testimonial } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    console.log('Starting to fetch testimonials...');
    
    // Use static JSON file for reliable deployment
    const res = await fetch('/testimonials.json');
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const testimonials = await res.json();
    console.log('Testimonials loaded:', testimonials.length);
    
    // Sort by date (latest first) and limit to 9
    const sortedTestimonials = testimonials
      .sort((a: Testimonial, b: Testimonial) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 9);

    console.log('Processed testimonials:', sortedTestimonials.length);
    return sortedTestimonials;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    
    // Return fallback data for testing
    console.log('Using fallback data...');
    return [
      {
        date: "2024-01-15",
        reviewType: "Demo Feedback Review",
        review: "This is a sample testimonial to test the widget functionality. The design should look exactly like the React version.",
        rating: 5,
        name: "John Doe"
      },
      {
        date: "2024-01-14",
        reviewType: "Sales Review",
        review: "Another sample testimonial to demonstrate the scrolling animation and responsive design.",
        rating: 4,
        name: "Jane Smith"
      },
      {
        date: "2024-01-13",
        reviewType: "Support Review",
        review: "This testimonial shows how the widget handles different review types with proper styling.",
        rating: 5,
        name: "Mike Johnson"
      },
      {
        date: "2024-01-12",
        reviewType: "Course Review",
        review: "Sample data to test the widget while we resolve the CORS issue with Google Sheets.",
        rating: 4,
        name: "Sarah Wilson"
      },
      {
        date: "2024-01-11",
        reviewType: "Demo Feedback Review",
        review: "This is another sample testimonial to fill the columns and test the scrolling animation.",
        rating: 5,
        name: "David Brown"
      },
      {
        date: "2024-01-10",
        reviewType: "Sales Review",
        review: "More sample data to test the responsive design and hover functionality.",
        rating: 4,
        name: "Lisa Davis"
      },
      {
        date: "2024-01-09",
        reviewType: "Support Review",
        review: "Additional testimonial to ensure we have enough content for all three columns on desktop.",
        rating: 5,
        name: "Alex Chen"
      },
      {
        date: "2024-01-08",
        reviewType: "Course Review",
        review: "This testimonial demonstrates the course review category with proper styling and formatting.",
        rating: 4,
        name: "Maria Garcia"
      },
      {
        date: "2024-01-07",
        reviewType: "Demo Feedback Review",
        review: "Final testimonial to complete the set and test the full functionality of the widget.",
        rating: 5,
        name: "Robert Taylor"
      }
    ];
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


