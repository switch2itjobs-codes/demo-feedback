import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Script to sync new reviews from Google Sheets to Supabase
export async function POST() {
  try {
    const supabase = createServerClient();

    // Google Sheets CSV URL (from your config)
    const csvUrls = [
      'https://docs.google.com/spreadsheets/d/1R0k2V68QgATo6i030R-WO9nN7Ur5laxuZoZZw7a_nB4/export?format=csv&gid=0',
      'https://docs.google.com/spreadsheets/d/e/1R0k2V68QgATo6i030R-WO9nN7Ur5laxuZoZZw7a_nB4/pub?gid=0&single=true&output=csv',
    ];

    let csvData = '';
    let workingUrl = '';

    // Try to fetch from Google Sheets
    for (const url of csvUrls) {
      try {
        console.log('Trying CSV URL:', url);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/csv,application/csv,*/*'
          },
          cache: 'no-store'
        });
        
        if (response.ok) {
          csvData = await response.text();
          
          // Check if we got HTML instead of CSV
          if (csvData.trim().startsWith('<') || csvData.includes('<!DOCTYPE') || csvData.includes('<html')) {
            console.log('Received HTML instead of CSV from:', url);
            continue;
          }
          
          workingUrl = url;
          console.log('Successfully fetched CSV data from:', url);
          break;
        }
      } catch (error) {
        console.log('Error fetching from:', url, error);
      }
    }

    if (!csvData) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch data from Google Sheets. Please ensure the sheet is publicly accessible.',
        error: 'Google Sheets CSV export not accessible'
      }, { status: 500 });
    }

    // Robust CSV parsing
    function parseCSV(input: string): string[][] {
      const rows: string[][] = [];
      let currentRow: string[] = [];
      let currentField = '';
      let inQuotes = false;

      for (let i = 0; i < input.length; i++) {
        const char = input[i];
        const next = input[i + 1];

        if (char === '"') {
          if (inQuotes && next === '"') {
            currentField += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          currentRow.push(currentField);
          currentField = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
          if (char === '\r' && next === '\n') i++;
          currentRow.push(currentField);
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
        } else {
          currentField += char;
        }
      }
      if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
      }

      return rows.map(row => row.map(f => {
        let v = f.trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        return v;
      }));
    }

    const rows = parseCSV(csvData);
    if (rows.length <= 1) {
      return NextResponse.json({ success: false, message: 'CSV has no data rows' }, { status: 400 });
    }

    // Header
    const header = rows[0].map(h => h.toLowerCase());
    const idxDate = header.findIndex(h => h.includes('date'));
    const idxType = header.findIndex(h => h.includes('review type'));
    const idxReview = header.findIndex(h => {
      const lower = h.toLowerCase();
      return (lower === 'review' || (lower.includes('review') && !lower.includes('type')));
    });
    const idxRating = header.findIndex(h => h.includes('rating'));
    const idxName = header.findIndex(h => h === 'name');
    const idxMobile = header.findIndex(h => h.includes('mobile'));

    if (idxDate < 0 || idxType < 0 || idxReview < 0 || idxRating < 0 || idxName < 0) {
      return NextResponse.json({ success: false, message: 'CSV header missing required columns' }, { status: 400 });
    }

    function normalizeDate(input?: string): string | undefined {
      if (!input) return undefined;
      const s = input.trim();
      if (!s) return undefined;
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) {
        const dd = m[1].padStart(2, '0');
        const mm = m[2].padStart(2, '0');
        const yyyy = m[3];
        return `${yyyy}-${mm}-${dd}`;
      }
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      return undefined;
    }

    // Get all existing testimonials from Supabase to check for duplicates
    const { data: existingTestimonials, error: fetchError } = await supabase
      .from('testimonials')
      .select('name, date, rating, review, mobile');

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    // Create a set of existing testimonials for quick lookup
    // Use name + date + rating + review as unique identifier
    const existingSet = new Set<string>();
    (existingTestimonials || []).forEach(t => {
      const key = `${(t.name || '').toLowerCase().trim()}|${t.date || ''}|${t.rating || ''}|${(t.review || '').substring(0, 50).trim()}`;
      existingSet.add(key);
    });

    // Parse CSV and prepare new records
    const newRecords = [] as Array<{
      date?: string;
      review_type: string;
      review: string;
      rating: number;
      name: string;
      mobile: string;
      published: boolean;
      source: string;
    }>;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length === 0) continue;

      const dateRaw = r[idxDate] || '';
      const reviewType = r[idxType] || '';
      const review = r[idxReview] || '';
      const ratingStr = r[idxRating] || '0';
      const name = r[idxName] || '';
      const mobile = idxMobile >= 0 ? (r[idxMobile] || '') : '';

      if (!name) continue;

      const rating = parseInt(ratingStr, 10);
      const normalizedDate = normalizeDate(dateRaw);

      // Check if this testimonial already exists
      const key = `${name.toLowerCase().trim()}|${normalizedDate || dateRaw}|${rating}|${review.substring(0, 50).trim()}`;
      
      if (!existingSet.has(key)) {
        newRecords.push({
          date: normalizedDate,
          review_type: reviewType || 'Demo Feedback Review',
          review: review || '',
          rating: isNaN(rating) ? 0 : rating,
          name: name || '',
          mobile: mobile || '',
          published: true,
          source: 'google-sheets-sync'
        });
      }
    }

    if (newRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new reviews to sync',
        totalInSheets: rows.length - 1,
        totalInSupabase: existingTestimonials?.length || 0,
        newRecords: 0
      });
    }

    // Insert new records in batches
    const batchSize = 500;
    let inserted = 0;
    const errors: Array<{ index: number; message: string }> = [];

    for (let i = 0; i < newRecords.length; i += batchSize) {
      const batch = newRecords.slice(i, i + batchSize);
      const { error } = await supabase
        .from('testimonials')
        .insert(batch);

      if (error) {
        errors.push({ index: i, message: error.message });
      } else {
        inserted += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      totalInSheets: rows.length - 1,
      totalInSupabase: (existingTestimonials?.length || 0) + inserted,
      newRecordsFound: newRecords.length,
      inserted,
      errors: errors.length > 0 ? errors : undefined,
      workingUrl
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

