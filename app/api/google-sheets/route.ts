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

    // For now, we'll use a simple approach - create a CSV line that you can copy
    const csvLine = rowData.map(field => `"${field}"`).join(',');
    
    console.log('=== GOOGLE SHEETS INTEGRATION ===');
    console.log('CSV Line to add to your Google Sheet:');
    console.log(csvLine);
    console.log('');
    console.log('Instructions:');
    console.log('1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1R0k2V68QgATo6i030R-WO9nN7Ur5laxuZoZZw7a_nB4/edit');
    console.log('2. Find the next empty row');
    console.log('3. Copy the CSV line above and paste it');
    console.log('4. The data will automatically separate into columns');
    console.log('================================');

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully! Check console for Google Sheets instructions.',
      data: {
        date: rowData[0],
        reviewType: rowData[1],
        review: rowData[2],
        rating: rowData[3],
        name: rowData[4],
        mobile: rowData[5]
      },
      csvLine: csvLine,
      instructions: {
        message: "Copy the CSV line from console and paste into your Google Sheet",
        spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1R0k2V68QgATo6i030R-WO9nN7Ur5laxuZoZZw7a_nB4/edit",
        csvLine: csvLine
      }
    });
  } catch (error: unknown) {
    console.error('Error in /api/google-sheets:', error);
    return NextResponse.json({
      success: false,
      message: 'Error submitting review: ' + (error instanceof Error ? error.message : 'Unknown error'),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
