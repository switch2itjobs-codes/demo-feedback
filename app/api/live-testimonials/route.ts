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
          
          // Check if we got HTML instead of CSV (indicates sheet not accessible)
          if (csvData.trim().startsWith('<') || csvData.includes('<!DOCTYPE') || csvData.includes('<html')) {
            console.log('Received HTML instead of CSV from:', url, '- Sheet may not be publicly accessible');
            continue;
          }
          
          workingUrl = url;
          console.log('Successfully fetched CSV data from:', url);
          console.log('CSV data length:', csvData.length, 'characters');
          console.log('First 200 chars:', csvData.substring(0, 200));
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

    // Log parsing stats
    console.log(`Total rows parsed from CSV: ${rows.length}`);
    console.log('First row (header):', rows[0]);
    
    // Expect header in first row; start from index 1
    let skippedCount = 0;
    let skippedReasons: { [key: string]: number } = {};
    
    for (let i = 1; i < rows.length; i++) {
      const fields = rows[i];
      
      // Skip empty rows
      if (!fields || fields.length === 0) {
        skippedCount++;
        skippedReasons['empty_row'] = (skippedReasons['empty_row'] || 0) + 1;
        continue;
      }
      
      // Log rows with unexpected field counts for debugging
      if (fields.length < 6) {
        skippedCount++;
        const reason = `fields_count_${fields.length}`;
        skippedReasons[reason] = (skippedReasons[reason] || 0) + 1;
        if (i <= 5) { // Log first 5 problematic rows for debugging
          console.log(`Row ${i} skipped - only ${fields.length} fields:`, fields);
        }
        continue;
      }

      const testimonial = {
        date: fields[0]?.trim() || '',
        reviewType: fields[1]?.trim() || '',
        review: fields[2]?.trim() || '',
        rating: parseInt(fields[3]?.trim() || '0') || 0,
        name: fields[4]?.trim() || '',
        mobile: fields[5]?.trim() || ''
      };

      // Include ALL reviews, even if review text is empty (might be valid entries)
      // But skip if ALL fields are empty
      const isEmpty = !testimonial.date && !testimonial.reviewType && !testimonial.review && 
                      !testimonial.name && !testimonial.mobile;
      
      if (!isEmpty) {
        testimonials.push(testimonial);
      } else {
        skippedCount++;
        skippedReasons['all_fields_empty'] = (skippedReasons['all_fields_empty'] || 0) + 1;
      }
    }
    
    console.log(`Processed ${testimonials.length} testimonials, skipped ${skippedCount} rows`);
    if (skippedCount > 0) {
      console.log('Skipped reasons:', skippedReasons);
    }

    console.log(`Successfully parsed ${testimonials.length} testimonials from Google Sheets`);
    console.log('Working URL:', workingUrl);

    return NextResponse.json({
      success: true,
      testimonials: testimonials,
      source: 'google-sheets',
      count: testimonials.length,
      totalRowsParsed: rows.length,
      skippedRows: skippedCount,
      skippedReasons: skippedCount > 0 ? skippedReasons : undefined,
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
