import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    const rowData = [
      formattedDate,
      'Demo Feedback Review',
      data.review || '',
      data.rating || 0,
      data.name || '',
      data.mobile || ''
    ];

    // For now, we'll log the data and return success
    // In production, you would integrate with Google Sheets API here
    console.log('=== FORM SUBMISSION RECEIVED ===');
    console.log('Date:', rowData[0]);
    console.log('Review Type:', rowData[1]);
    console.log('Review:', rowData[2]);
    console.log('Rating:', rowData[3]);
    console.log('Name:', rowData[4]);
    console.log('Mobile:', rowData[5]);
    console.log('===============================');

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully!',
      data: {
        date: rowData[0],
        reviewType: rowData[1],
        review: rowData[2],
        rating: rowData[3],
        name: rowData[4],
        mobile: rowData[5]
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
