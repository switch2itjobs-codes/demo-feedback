import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Disable caching - always fetch fresh data from Supabase
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('=== FETCHING LIVE TESTIMONIALS FROM SUPABASE (REAL-TIME) ===');
    
    // Create Supabase client
    const supabase = createServerClient();

    // Fetch ALL published testimonials from Supabase, sorted by date (fallback created_at) descending
    // No limit - fetch all testimonials dynamically
    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('id, date, review_type, review, rating, name, mobile, image, created_at')
      .eq('published', true)
      .order('date', { ascending: false, nullsLast: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch testimonials from database',
        error: error.message,
        testimonials: []
      }, { status: 500 });
    }

    // Transform Supabase data to match the expected format
    // Sort by date (latest first), using created_at as fallback
    const transformedTestimonials = (testimonials || [])
      .map((testimonial) => ({
        date: testimonial.date || testimonial.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        reviewType: testimonial.review_type || '',
        review: testimonial.review || '',
        rating: testimonial.rating || 0,
        name: testimonial.name || '',
        mobile: testimonial.mobile || '',
        image: testimonial.image || undefined,
        // Add sort key for client-side sorting if needed
        sortDate: testimonial.date || testimonial.created_at || new Date().toISOString()
      }))
      // Additional client-side sort to ensure latest first (in case DB sort isn't perfect)
      .sort((a, b) => {
        const dateA = new Date(a.sortDate).getTime();
        const dateB = new Date(b.sortDate).getTime();
        return dateB - dateA; // Descending (latest first)
      })
      .map(({ sortDate, ...rest }) => rest); // Remove sortDate from final output

    console.log(`Successfully fetched ${transformedTestimonials.length} testimonials from Supabase`);

    return NextResponse.json({
      success: true,
      testimonials: transformedTestimonials,
      source: 'supabase',
      count: transformedTestimonials.length,
      lastUpdated: new Date().toISOString()
    }, {
      headers: {
        // No caching - always fetch fresh data
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error('Error fetching live testimonials:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      testimonials: [],
      source: 'error'
    }, { status: 500 });
  }
}
