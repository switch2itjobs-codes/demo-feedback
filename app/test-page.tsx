"use client";
import React from "react";

export default function TestPage() {
  const [testimonials, setTestimonials] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        console.log("Starting to fetch testimonials...");
        const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-wMC9rUlK_9puyxAvZp0revilMFgeG8fgeGLA58mIjRHa7TKqHLL-5J3RM-4bKtvtiPLi4ZMurT65/pub?gid=0&single=true&output=csv';
        
        const response = await fetch(csvUrl);
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csv = await response.text();
        console.log("CSV data received:", csv.substring(0, 200));
        
        // Simple CSV parsing
        const lines = csv.split('\n');
        const data = lines.slice(1).map(line => {
          const [date, reviewType, review, rating, name] = line.split(',');
          return { date, reviewType, review, rating: Number(rating) || 0, name };
        }).filter(item => item.name && item.review);
        
        console.log("Parsed testimonials:", data.length);
        setTestimonials(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Testimonials...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Testimonials</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p>Check browser console for more details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Testimonials Test Page</h1>
      <p className="mb-4">Found {testimonials.length} testimonials</p>
      
      <div className="grid gap-4">
        {testimonials.slice(0, 3).map((testimonial, index) => (
          <div key={index} className="border p-4 rounded-lg bg-white shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                ))}
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                {testimonial.reviewType}
              </span>
            </div>
            <p className="text-gray-700 mb-2">{testimonial.review}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span className="font-medium">{testimonial.name}</span>
              <span>{testimonial.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
