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

    console.log('=== GOOGLE SHEETS DATA FOR MANUAL ENTRY ===');
    console.log('Copy this data and paste it into your Google Sheet:');
    console.log('https://docs.google.com/spreadsheets/d/1R0k2V68QgATo6i030R-WO9nN7Ur5laxuZoZZw7a_nB4/edit');
    console.log('');
    console.log('Row data (copy this entire line):');
    console.log(rowData.join('\t'));
    console.log('');
    console.log('Or add each value separately:');
    console.log(`Date: ${rowData[0]}`);
    console.log(`Review Type: ${rowData[1]}`);
    console.log(`Review: ${rowData[2]}`);
    console.log(`Rating: ${rowData[3]}`);
    console.log(`Name: ${rowData[4]}`);
    console.log(`Mobile: ${rowData[5]}`);
    console.log('==========================================');

    return NextResponse.json({
      success: true,
      message: 'Data ready for Google Sheets! Check console for copy-paste instructions.',
      data: {
        date: rowData[0],
        reviewType: rowData[1],
        review: rowData[2],
        rating: rowData[3],
        name: rowData[4],
        mobile: rowData[5]
      },
      instructions: {
        message: "Copy the data from console and paste into your Google Sheet",
        spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1R0k2V68QgATo6i030R-WO9nN7Ur5laxuZoZZw7a_nB4/edit",
        rowData: rowData
      }
    });
  } catch (error: unknown) {
    console.error('Error in /api/add-to-sheet:', error);
    return NextResponse.json({
      success: false,
      message: 'Error preparing data: ' + (error instanceof Error ? error.message : 'Unknown error'),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
