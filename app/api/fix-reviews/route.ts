import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

// Script to fix reviews that have review_type instead of actual review text
export async function POST() {
  try {
    const supabase = createServerClient();

    // Read the CSV file to get correct review text
    const filePath = path.join(process.cwd(), 'Feedback System - Sheet1.csv');
    const csvRaw = await fs.readFile(filePath, 'utf8');

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

    const rows = parseCSV(csvRaw);
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

    function normalizeDateForMatching(input?: string): string {
      if (!input) return '';
      const s = input.trim();
      if (!s) return '';
      // If already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      // If DD/MM/YYYY -> YYYY-MM-DD
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) {
        const dd = m[1].padStart(2, '0');
        const mm = m[2].padStart(2, '0');
        const yyyy = m[3];
        return `${yyyy}-${mm}-${dd}`;
      }
      return s; // return as-is if can't parse
    }

    // Build a map of correct reviews by name+date+rating (unique identifier)
    const reviewMap = new Map<string, string>();
    
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length === 0) continue;

      const dateRaw = r[idxDate] || '';
      const reviewType = r[idxType] || '';
      const review = r[idxReview] || '';
      const ratingStr = r[idxRating] || '0';
      const name = r[idxName] || '';
      
      if (!name) continue;
      
      // Normalize date for matching
      const normalizedDate = normalizeDateForMatching(dateRaw);
      
      // Create multiple keys to handle different date formats
      const nameLower = name.toLowerCase().trim();
      const rating = ratingStr.trim();
      const reviewText = review.trim();
      
      // Primary key with normalized date
      const key1 = `${nameLower}|${normalizedDate}|${rating}`;
      reviewMap.set(key1, reviewText);
      
      // Also add with original date format
      const key2 = `${nameLower}|${dateRaw.trim()}|${rating}`;
      reviewMap.set(key2, reviewText);
    }

    // Fetch all testimonials from Supabase
    const { data: testimonials, error: fetchError } = await supabase
      .from('testimonials')
      .select('id, name, date, rating, review, review_type')
      .eq('source', 'import-csv');

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    let updated = 0;
    let skipped = 0;
    const errors: Array<{ id: string; error: string }> = [];

    // Update each testimonial
    for (const testimonial of testimonials || []) {
      const nameLower = (testimonial.name?.toLowerCase().trim() || '');
      const date = testimonial.date || '';
      const rating = String(testimonial.rating || '');
      
      // Try multiple key formats
      const key1 = `${nameLower}|${date}|${rating}`;
      const key2 = `${nameLower}|${normalizeDateForMatching(date)}|${rating}`;
      
      const correctReview = reviewMap.get(key1) || reviewMap.get(key2);

      // Update if review text is missing, empty, or matches review_type (indicating wrong import)
      if (correctReview && correctReview.trim() !== '' && correctReview !== testimonial.review_type) {
        const currentReview = (testimonial.review || '').trim();
        
        // Force update if review is wrong
        if (!currentReview || currentReview === testimonial.review_type || currentReview === '') {
          const { error: updateError } = await supabase
            .from('testimonials')
            .update({ review: correctReview })
            .eq('id', testimonial.id);

          if (updateError) {
            errors.push({ id: testimonial.id, error: updateError.message });
          } else {
            updated++;
          }
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Review fix completed',
      total: testimonials?.length || 0,
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Fix error:', error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

