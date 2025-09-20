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

    // Format the date as DD/MM/YYYY
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB'); // DD/MM/YYYY format

    // Prepare the row data for Google Sheets
    const rowData = [
      formattedDate,           // Column A: Date (DD/MM/YYYY)
      'Demo Feedback Review',  // Column B: Review Type
      review,                  // Column C: Review
      rating,                  // Column D: Rating
      name,                    // Column E: Name
      mobile                   // Column F: Mobile Number
    ];

    // For now, we'll log the data and return success
    // In production, you would use Google Sheets API here
    console.log('=== GOOGLE SHEETS DATA ===');
    console.log('Date:', formattedDate);
    console.log('Review Type: Demo Feedback Review');
    console.log('Review:', review);
    console.log('Rating:', rating);
    console.log('Name:', name);
    console.log('Mobile:', mobile);
    console.log('========================');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully! Data ready for Google Sheets.',
      data: {
        date: formattedDate,
        reviewType: 'Demo Feedback Review',
        review,
        rating,
        name,
        mobile
      },
      instructions: {
        message: 'To add this data to your Google Sheet, manually add this row:',
        rowData: rowData,
        columns: ['A: Date', 'B: Review Type', 'C: Review', 'D: Rating', 'E: Name', 'F: Mobile']
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
