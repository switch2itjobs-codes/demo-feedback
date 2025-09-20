"use client";

import React from "react";
import { Star, Send } from "lucide-react";
import { TestimonialsColumn, Testimonial } from "@/components/ui/testimonials-columns-1";

async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    console.log('Fetching testimonials directly from Google Sheets...');
    
    // Fetch directly from Google Sheets CSV
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-wMC9rUlK_9puyxAvZp0revilMFgeG8fgeGLA58mIjRHa7TKqHLL-5J3RM-4bKtvtiPLi4ZMurT65/pub?gid=0&single=true&output=csv";
    
    const res = await fetch(csvUrl);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const csv = await res.text();
    console.log('CSV data received, length:', csv.length);
    
    // Parse CSV data - handle commas in review text properly
    const rows = csv.split('\n').filter(row => row.trim());
    const data = rows.slice(1).map(row => {
      // Split by comma but handle quoted fields properly
      const fields = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.trim()); // Add the last field
      
      // Remove quotes from each field
      const cleanFields = fields.map(field => field.replace(/^"|"$/g, ''));
      
      // Expected: Date, Review Type, Review, Rating, Name, Mobile Number
      const [date, reviewType, review, rating, name, mobile] = cleanFields;
      
      return {
        date: date || '',
        reviewType: reviewType || '',
        review: review || '',
        rating: Number(rating) || 0,
        name: name || ''
      };
    }).filter(item => item.name && item.review);
    
    console.log('Parsed testimonials:', data.length);
    
    // Sort by date (latest first) and limit to 9
    const allTestimonials = data
      .sort((a: Testimonial, b: Testimonial) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 9);

    return allTestimonials;
  } catch (error) {
    console.error('Error fetching testimonials from Google Sheets:', error);
    
    // Return empty array instead of dummy data
    return [];
  }
}

function useTestimonials() {
  const [items, setItems] = React.useState<Testimonial[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    fetchTestimonials()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setItems([]);
        setLoading(false);
      });
  }, []);
  
  return { items, loading };
}

export default function DemoFeedbackPage() {
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
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form
    setRating(0);
    setReview("");
    setName("");
    setMobile("");
    setIsSubmitting(false);
    
    alert("Thank you for your feedback! Your review has been submitted.");
  };

  const firstColumn = testimonials.slice(0, 5);
  const secondColumn = testimonials.slice(5, 9);

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
      {/* Main Content */}
      <div className="w-full px-2 py-2">
        <div className="flex flex-col lg:grid lg:grid-cols-[60%_40%] gap-4 lg:gap-8 max-w-7xl mx-auto">
          
          {/* Review Form - First on mobile, Right side on desktop */}
          <div className="flex items-center justify-center order-1 lg:order-2 mb-4 lg:mb-0">
            <div className="relative w-full max-w-[95vw] sm:max-w-md overflow-hidden rounded-2xl shadow-xl">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/80 via-blue-800/90 to-black/95" />
              </div>

              <div className="relative z-10 px-8 pt-8 pb-8 sm:px-12 sm:py-[50px]">
                <div className="text-center mb-5 -mt-2">
                  {/* SIT Logo */}
                  <div className="mb-3 flex justify-center">
                    <img 
                      src="/sit-logo.png" 
                      alt="SIT Logo" 
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                <h1 className="text-2xl font-semibold text-white mb-2 tracking-tighter">Share Your Experience</h1>
                <p className="text-white/70 text-xs leading-relaxed">
                  Help us improve by sharing your <span className="text-white">feedback</span>
                </p>
                <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating */}
                <div>
                  <label className="review-form-label">
                    How would you rate your demo experience? *
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

                {/* Review Text */}
                <div>
                  <label htmlFor="review" className="review-form-label">
                    Tell us about your demo experience *
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

                {/* Name and Mobile Number - 50% each */}
                <div className="flex gap-4">
                  <div className="w-1/2">
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
                  <div className="w-1/2">
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0 || !review.trim() || !name.trim() || !mobile.trim()}
                  className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg border border-gray-200 disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <Send className="h-4 w-4" />
                      Submit Review
                    </div>
                  )}
                </button>
              </form>

              {/* Additional Info */}
              <div className="mt-5 text-center">
                <p className="text-white/50 text-xs leading-relaxed">
                  By submitting, you agree to our{" "}
                  <a 
                    href="https://switch2itjobs.com/terms-conditions/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white underline transition-colors"
                  >
                    Terms of Service
                  </a>
                  {" "}&{" "}
                  <a 
                    href="https://switch2itjobs.com/privacy-policy-2/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white underline transition-colors"
                  >
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

          {/* Testimonials - Second on mobile, Left side on desktop */}
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
                <TestimonialsColumn testimonials={firstColumn} duration={15} paused={paused} className="w-full max-w-[90vw] sm:max-w-[280px]" />
                <TestimonialsColumn testimonials={secondColumn} className="hidden sm:block w-full max-w-[280px]" duration={19} paused={paused} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
