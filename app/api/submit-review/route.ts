import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { review, rating, name, mobile } = body;

    // Validate required fields
    if (!review || !rating || !name || !mobile) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, we'll simulate success
    // In production, this would call your Google Apps Script
    console.log('Review submission received:', {
      review,
      rating,
      name,
      mobile,
      timestamp: new Date().toISOString()
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully!',
      data: {
        review,
        rating,
        name,
        mobile,
        date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY format
        reviewType: 'Demo Feedback Review'
      }
    });

  } catch (error) {
    console.error('Error processing review submission:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
