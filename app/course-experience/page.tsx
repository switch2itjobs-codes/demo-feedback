"use client";

import React from "react";
import { Star, Send } from "lucide-react";
import { TestimonialsColumn, Testimonial } from "@/components/ui/testimonials-columns-1";

async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    console.log('Fetching live testimonials from API...');
    
    const res = await fetch('/api/live-testimonials', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.success && data.testimonials) {
      console.log(`Successfully fetched ${data.testimonials.length} live testimonials from ${data.source}`);
      
      // Show all testimonials (not filtered by type)
      const allTestimonials = data.testimonials
        .sort((a: Testimonial, b: Testimonial) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log('Processed all testimonials:', allTestimonials.length);
      return allTestimonials;
    } else {
      console.error('API returned error:', data.error);
      return [];
    }
    
  } catch (error) {
    console.error('Error fetching live testimonials:', error);
    return [];
  }
}

function useTestimonials() {
  const [items, setItems] = React.useState<Testimonial[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [lastFetch, setLastFetch] = React.useState<Date | null>(null);
  
  const fetchData = React.useCallback(async () => {
    try {
      console.log('Refreshing testimonials data...');
      const data = await fetchTestimonials();
      setItems(data);
      setLastFetch(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setItems([]);
      setLoading(false);
    }
  }, []);
  
  React.useEffect(() => {
    fetchData();
    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      console.log('Auto-refreshing testimonials (real-time)...');
      fetchData();
    }, 30 * 1000); // 30 seconds for near real-time updates
    return () => clearInterval(interval);
  }, [fetchData]);
  
  React.useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing testimonials...');
      fetchData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData]);
  
  return { items, loading, lastFetch, refresh: fetchData };
}

export default function CourseExperiencePage() {
  const { items, loading } = useTestimonials();
  const testimonials = items ?? [];
  
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [review, setReview] = React.useState("");
  const [name, setName] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/google-sheets-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review, rating, name, mobile,
          reviewType: 'Course Experience'
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to submit review');
      }
      
      console.log('Review submitted successfully:', result);
      setRating(0); setReview(""); setName(""); setMobile("");
      alert("Thank you for sharing your feedback!");
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert("Sorry, there was an error submitting your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemsPerColumn = Math.ceil(testimonials.length / 2);
  const firstColumn = testimonials.slice(0, itemsPerColumn);
  const secondColumn = testimonials.slice(itemsPerColumn);
  const [paused, setPaused] = React.useState(false);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="w-full px-2 py-2">
        <div className="flex flex-col lg:grid lg:grid-cols-[60%_40%] gap-4 lg:gap-8 max-w-7xl mx-auto">
          
          <div className="flex items-center justify-center order-1 lg:order-2 mb-4 lg:mb-0">
            <div className="relative w-full max-w-[95vw] sm:max-w-md overflow-hidden rounded-2xl shadow-xl">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/80 via-blue-800/90 to-black/95" />
              </div>

              <div className="relative z-10 px-8 pt-8 pb-8 sm:px-12 sm:py-[50px]">
                <div className="text-center mb-5 -mt-2">
                  <div className="mb-3 flex justify-center">
                    <img src="/sit-logo.png" alt="SIT Logo" className="w-16 h-16 object-contain" />
                  </div>
                <h1 className="text-2xl font-semibold text-white mb-2 tracking-tighter">Share Your Course Experience</h1>
                <p className="text-white/70 text-xs leading-relaxed">
                  Help us improve by sharing your <span className="text-white">course experience</span>
                </p>
                <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="review-form-label">
                    How would you rate your course experience? *
                  </label>
                  <div className="flex items-center justify-start gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i + 1)}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform duration-200 hover:scale-110"
                      >
                        <Star
                          className={`h-5 w-5 transition-colors ${
                            i < (hoverRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-white/40 hover:text-yellow-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-left mt-1">
                    <span className="text-white/60 text-xs">
                      {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : ''}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="review" className="review-form-label">
                    Tell us about your course experience *
                  </label>
                  <textarea
                    id="review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={3}
                    className="review-form-input"
                    placeholder=""
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label htmlFor="name" className="review-form-label">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="review-form-input"
                      placeholder=""
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="mobile" className="review-form-label">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="review-form-input"
                      placeholder=""
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="w-full bg-white text-black py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Review
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white/60 text-xs">
                  By submitting, you agree to our{' '}
                  <a href="#" className="text-white underline hover:text-gray-200">
                    Privacy Policy
                  </a>
                </p>
                <p className="text-white/60 text-xs mt-1">
                  Your review will be published after moderation
                </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:space-y-6 order-2 lg:order-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <h2 className="text-xl font-bold mb-2">Loading Testimonials...</h2>
              </div>
            ) : (
              <div
                className={`flex justify-center items-center gap-1 sm:gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] h-[40vh] sm:h-[90vh] ${paused ? "overflow-y-auto" : "overflow-hidden"}`}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                <TestimonialsColumn testimonials={firstColumn} paused={paused} className="w-full max-w-[90vw] sm:max-w-[280px]" />
                <TestimonialsColumn testimonials={secondColumn} className="hidden sm:block w-full max-w-[280px]" paused={paused} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
