import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test data that matches what you have in Google Sheets
    const testData = [
      {
        date: '20/09/2025',
        reviewType: 'Demo Feedback Review',
        review: 'Test review for CORRECT spreadsheet',
        rating: 5,
        name: 'Test User',
        mobile: '9876543210'
      },
      {
        date: '20/09/2025',
        reviewType: 'Demo Feedback Review',
        review: 'Test from curl - checking if Google Apps Script works',
        rating: 5,
        name: 'Test User',
        mobile: '9876543210'
      },
      {
        date: '21/09/2025',
        reviewType: 'Demo Feedback Review',
        review: 'sdfdjknf',
        rating: 5,
        name: 'Santosh',
        mobile: '8522952923'
      }
    ];

    return NextResponse.json({
      success: true,
      testimonials: testData,
      source: 'test-data',
      count: testData.length,
      message: 'This is test data matching your Google Sheets'
    });

  } catch (error) {
    console.error('Error in test data API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
