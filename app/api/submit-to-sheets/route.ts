import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.review || !data.rating || !data.name || !data.mobile) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating range
    const rating = parseInt(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerClient();

    // Insert testimonial into Supabase
    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .insert({
        review_type: data.reviewType || 'Demo Feedback Review',
        review: data.review,
        rating: rating,
        name: data.name,
        mobile: data.mobile,
        published: true,
        source: 'web'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({
        success: false,
        message: 'Error saving testimonial to database',
        error: error.message
      }, { status: 500 });
    }

    console.log('=== FORM SUBMISSION RECEIVED AND SAVED TO SUPABASE ===');
    console.log('Testimonial ID:', testimonial.id);
    console.log('Date:', testimonial.date);
    console.log('Review Type:', testimonial.review_type);
    console.log('Review:', testimonial.review);
    console.log('Rating:', testimonial.rating);
    console.log('Name:', testimonial.name);
    console.log('Mobile:', testimonial.mobile);
    console.log('=====================================================');

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully!',
      data: {
        id: testimonial.id,
        date: testimonial.date,
        reviewType: testimonial.review_type,
        review: testimonial.review,
        rating: testimonial.rating,
        name: testimonial.name,
        mobile: testimonial.mobile
      }
    });
  } catch (error: unknown) {
    console.error('Error in /api/submit-to-sheets:', error);
    return NextResponse.json({
      success: false,
      message: 'Error submitting review: ' + (error instanceof Error ? error.message : 'Unknown error'),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
