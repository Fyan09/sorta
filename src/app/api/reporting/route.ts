import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const grade = searchParams.get('grade') || '';
    const date = searchParams.get('date') || '';
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let where = 'WHERE 1=1';
    const params: any[] = [];

    if (grade) {
      where += ' AND grade = ?';
      params.push(grade);
    }

    if (date) {
      where += " AND DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = ?";
      params.push(date);
    }

    // Total count
    const countResult: any = await executeQuery(
      `SELECT COUNT(*) as total FROM telur ${where}`,
      params
    );
    const total = countResult[0].total;

    // Fetch data with pagination
    const rows: any = await executeQuery(
      `SELECT id, created_at, berat, grade
       FROM telur
       ${where}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    // Summary hari ini (WIB)
    const summary: any = await executeQuery(`
      SELECT grade, COUNT(*) as count
      FROM telur
      WHERE DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = CURDATE()
      GROUP BY grade
    `);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      summary
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Database error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}