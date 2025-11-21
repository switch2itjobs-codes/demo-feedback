import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { review, rating, name, mobile, reviewType } = body;

    // Validate required fields
    if (!review || !rating || !name || !mobile) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating range
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
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
        review_type: reviewType || 'Demo Feedback Review',
        review: review,
        rating: ratingNum,
        name: name,
        mobile: mobile,
        published: true,
        source: 'web'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error saving testimonial to database',
          error: error.message 
        },
        { status: 500 }
      );
    }

    console.log('Review submitted successfully to Supabase:', testimonial.id);

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully!',
      data: {
        id: testimonial.id,
        review: testimonial.review,
        rating: testimonial.rating,
        name: testimonial.name,
        mobile: testimonial.mobile,
        date: testimonial.date || new Date().toLocaleDateString('en-GB'),
        reviewType: testimonial.review_type
      }
    });

  } catch (error) {
    console.error('Error processing review submission:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
