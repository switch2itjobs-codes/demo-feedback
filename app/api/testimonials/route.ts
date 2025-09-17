import { NextResponse } from "next/server";

// Revalidate this route every 5 minutes
export const revalidate = 300;

type SheetRow = {
  date: string; // Column A
  reviewType: string; // Column B
  review: string; // Column C
  rating: number; // Column D
  name: string; // Column E
};

function csvToRows(csv: string): string[][] {
  // Simple CSV parser that supports quoted fields and commas
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        current.push(field.trim());
        field = "";
      } else if (char === '\n') {
        current.push(field.trim());
        rows.push(current);
        current = [];
        field = "";
      } else if (char === '\r') {
        // ignore
      } else {
        field += char;
      }
    }
  }

  if (field.length > 0 || current.length > 0) {
    current.push(field.trim());
    rows.push(current);
  }

  return rows;
}

export async function GET() {
  try {
    // Convert provided pubhtml link to CSV endpoint
    const csvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-wMC9rUlK_9puyxAvZp0revilMFgeG8fgeGLA58mIjRHa7TKqHLL-5J3RM-4bKtvtiPLi4ZMurT65/pub?gid=0&single=true&output=csv";

    const res = await fetch(csvUrl, { next: { revalidate } });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch sheet" }, { status: 502 });
    }
    const csv = await res.text();
    const rows = csvToRows(csv).filter((r) => r.length > 0);

    // Assume first row is headers; map columns: A Date, B Review Type, C Review, D Rating, E Name
    const data: SheetRow[] = rows
      .slice(1)
      .filter((r) => r[0] || r[1] || r[2] || r[3] || r[4])
      .map((r) => ({
        date: r[0] ?? "",
        reviewType: r[1] ?? "",
        review: r[2] ?? "",
        rating: Number(r[3] ?? 0) || 0,
        name: r[4] ?? "",
      }));

    return NextResponse.json({ items: data }, {
      headers: {
        // Cache at edge/browsers for 5 minutes as well
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}


