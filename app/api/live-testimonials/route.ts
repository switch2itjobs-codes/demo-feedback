import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== FETCHING LIVE TESTIMONIALS (trigger) ===');
    
    // Try multiple CSV URL formats
    const csvUrls = [
      'https://docs.google.com/spreadsheets/d/1R0k2V68QgATo6i030R-WO9nN7Ur5laxuZoZZw7a_nB4/export?format=csv&gid=0',
      'https://docs.google.com/spreadsheets/d/e/1R0k2V68QgATo6i030R-WO9nN7Ur5laxuZoZZw7a_nB4/pub?gid=0&single=true&output=csv',
      'https://docs.google.com/spreadsheets/d/1R0k2V68QgATo6i030R-WO9nN7Ur5laxuZoZZw7a_nB4/export?format=csv',
      // Try with different parameters to bypass caching
      'https://docs.google.com/spreadsheets/d/1R0k2V68QgATo6i030R-WO9nN7Ur5laxuZoZZw7a_nB4/export?format=csv&gid=0&t=' + Date.now()
    ];

    let csvData = '';
    let workingUrl = '';

    // Try each URL until one works
    for (const url of csvUrls) {
      try {
        console.log('Trying CSV URL:', url);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/csv,application/csv,*/*'
          },
          cache: 'no-store' // Always fetch fresh data
        });
        
        if (response.ok) {
          csvData = await response.text();
          workingUrl = url;
          console.log('Successfully fetched data from:', url);
          break;
        } else {
          console.log('Failed to fetch from:', url, 'Status:', response.status);
        }
      } catch (error) {
        console.log('Error fetching from:', url, error);
      }
    }

    // NO FALLBACK DATA - Only return data from Google Sheets
    if (!csvData) {
      console.error('All CSV URLs failed - Google Sheets not accessible');
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch data from Google Sheets',
        error: 'Google Sheets CSV export not accessible',
        testimonials: []
      }, { status: 500 });
    }

    // Robust CSV parsing that supports quoted commas and newlines
    function parseCSV(input: string): string[][] {
      const rows: string[][] = [];
      let currentRow: string[] = [];
      let currentField = '';
      let inQuotes = false;

      for (let i = 0; i < input.length; i++) {
        const char = input[i];
        const next = input[i + 1];

        if (char === '"') {
          // Handle escaped double quotes within quoted fields
          if (inQuotes && next === '"') {
            currentField += '"';
            i++; // skip the escaped quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          currentRow.push(currentField);
          currentField = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
          // End of row (support CRLF)
          if (char === '\r' && next === '\n') {
            i++; // skip LF in CRLF
          }
          currentRow.push(currentField);
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
        } else {
          currentField += char;
        }
      }
      // Push the last field/row if any
      if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
      }

      // Trim surrounding quotes and whitespace for each field
      return rows.map((row) =>
        row.map((field) => {
          let f = field;
          if (f.startsWith('"') && f.endsWith('"')) {
            f = f.slice(1, -1);
          }
          return f.trim();
        })
      );
    }

    const rows = parseCSV(csvData);
    const testimonials = [] as Array<{
      date: string;
      reviewType: string;
      review: string;
      rating: number;
      name: string;
      mobile: string;
    }>;

    // Expect header in first row; start from index 1
    for (let i = 1; i < rows.length; i++) {
      const fields = rows[i];
      if (!fields || fields.length < 6) continue;

      const testimonial = {
        date: fields[0] || '',
        reviewType: fields[1] || '',
        review: fields[2] || '',
        rating: parseInt(fields[3]) || 0,
        name: fields[4] || '',
        mobile: fields[5] || ''
      };

      if (testimonial.review && testimonial.review.trim() !== '') {
        testimonials.push(testimonial);
      }
    }

    console.log(`Successfully parsed ${testimonials.length} testimonials from Google Sheets`);
    console.log('Working URL:', workingUrl);

    return NextResponse.json({
      success: true,
      testimonials: testimonials,
      source: 'google-sheets',
      count: testimonials.length,
      lastUpdated: new Date().toISOString(),
      workingUrl: workingUrl
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
