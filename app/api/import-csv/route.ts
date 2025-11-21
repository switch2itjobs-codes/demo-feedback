import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

// IMPORTANT: This is a one-time importer. Remove or protect after use.
export async function POST() {
  try {
    const supabase = createServerClient();

    // Try common filenames
    const candidateFiles = [
      'Feedback System - Sheet1.csv',
      'Feedback.csv'
    ];

    // Resolve the first existing file
    let filePath: string | null = null;
    for (const name of candidateFiles) {
      const p = path.join(process.cwd(), name);
      try {
        await fs.access(p);
        filePath = p;
        break;
      } catch {
        // continue
      }
    }

    if (!filePath) {
      return NextResponse.json({ success: false, message: 'CSV file not found in project root', tried: candidateFiles }, { status: 404 });
    }

    const csvRaw = await fs.readFile(filePath, 'utf8');

    // Robust CSV parsing supporting quoted commas and newlines
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

      // Trim outer quotes and whitespace
      return rows.map(row => row.map(f => {
        let v = f.trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        return v;
      }));
    }

    const rows = parseCSV(csvRaw);
    if (rows.length <= 1) {
      return NextResponse.json({ success: false, message: 'CSV has no data rows' }, { status: 400 });
    }

    // Header
    const header = rows[0].map(h => h.toLowerCase());
    // Expected columns: Date, Review Type, Review, Rating, Name, Mobile Number
    const idxDate = header.findIndex(h => h.includes('date'));
    const idxType = header.findIndex(h => h.includes('review type'));
    // Find Review column - must be exactly 'review' or include 'review' but NOT 'review type'
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
      // If already looks like YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      // If DD/MM/YYYY -> YYYY-MM-DD
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) {
        const dd = m[1].padStart(2, '0');
        const mm = m[2].padStart(2, '0');
        const yyyy = m[3];
        return `${yyyy}-${mm}-${dd}`;
      }
      // Try Date parsing as fallback
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      return undefined; // leave undefined if unrecognized
    }

    // Transform into DB rows
    const records = [] as Array<{
      date?: string;
      review_type: string;
      review: string;
      rating: number;
      name: string;
      mobile?: string;
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

      // Skip rows that have neither name nor review
      if (!name && !review) continue;

      const rating = parseInt(ratingStr, 10);
      const normalizedDate = normalizeDate(dateRaw);

      records.push({
        date: normalizedDate,
        review_type: reviewType || 'Demo Feedback Review',
        review: review || '',
        rating: isNaN(rating) ? 0 : rating,
        name: name || '',
        mobile: mobile || '',
        published: true,
        source: 'import-csv'
      });
    }

    if (records.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid rows to import' }, { status: 400 });
    }

    // Batch insert to Supabase
    const batchSize = 500; // safe large batch
    let inserted = 0;
    const errors: Array<{ index: number; message: string }> = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
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
      message: 'Import completed',
      file: path.basename(filePath),
      totalParsed: rows.length - 1,
      totalPrepared: records.length,
      inserted,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
