import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || '';
    const isAll = date === 'all';

    // ✅ FIX TIMEZONE: Selalu convert ke WIB (+07:00) sebelum filter tanggal
    let finalCondition: string;
    if (isAll) {
      finalCondition = '1=1';
    } else if (date) {
      // Filter tanggal spesifik dari date picker
      finalCondition = `DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = '${date}'`;
    } else {
      // Default: hari ini dalam WIB (bukan UTC!)
      finalCondition = `DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))`;
    }

    // 1. Hitung jumlah per grade
    const gradeCount: any = await executeQuery(`
      SELECT grade, COUNT(*) as count
      FROM telur
      WHERE ${finalCondition}
      GROUP BY grade
    `);

    const current = { grade_a: 0, grade_b: 0, grade_c: 0, tidak_layak: 0, total: 0 };

    gradeCount.forEach((row: any) => {
      switch (row.grade) {
        case 'A':  current.grade_a     = Number(row.count); break;
        case 'B':  current.grade_b     = Number(row.count); break;
        case 'C':  current.grade_c     = Number(row.count); break;
        case 'TL': current.tidak_layak = Number(row.count); break;
      }
    });
    current.total = current.grade_a + current.grade_b + current.grade_c + current.tidak_layak;

    // 2. History untuk chart — group by jam WIB
    let historyCondition: string;
    if (isAll) {
      historyCondition = 'created_at >= NOW() - INTERVAL 7 DAY';
    } else if (date) {
      historyCondition = `DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = '${date}'`;
    } else {
      historyCondition = `CONVERT_TZ(created_at, '+00:00', '+07:00') >= DATE_SUB(CONVERT_TZ(NOW(), '+00:00', '+07:00'), INTERVAL 12 HOUR)`;
    }

    const historyData: any = await executeQuery(`
      SELECT 
        DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+07:00'), '%H:%i') as time,
        grade,
        COUNT(*) as count
      FROM telur
      WHERE ${historyCondition}
      GROUP BY DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+07:00'), '%H:%i'), grade
      ORDER BY MIN(created_at) ASC
    `);

    const chartData = formatChartData(historyData);

    // 3. Pie chart
    const totalCount = current.total || 1;
    const pieData = [
      { name: 'Grade A',     value: current.grade_a,     percentage: ((current.grade_a / totalCount) * 100).toFixed(1) },
      { name: 'Grade B',     value: current.grade_b,     percentage: ((current.grade_b / totalCount) * 100).toFixed(1) },
      { name: 'Grade C',     value: current.grade_c,     percentage: ((current.grade_c / totalCount) * 100).toFixed(1) },
      { name: 'Tidak Layak', value: current.tidak_layak, percentage: ((current.tidak_layak / totalCount) * 100).toFixed(1) },
    ];

    const stats = {
      today: current.total,
      gradeAPercent: ((current.grade_a / totalCount) * 100).toFixed(1),
      lastUpdate: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      current,
      history: chartData,
      pieChart: pieData,
      stats,
      activeDate: isAll ? 'all' : (date || 'today')
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Database connection error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function formatChartData(data: any[]) {
  const grouped: any = {};
  data.forEach((row: any) => {
    const t = row.time;
    if (!grouped[t]) grouped[t] = { time: t, gradeA: 0, gradeB: 0, gradeC: 0, tidakLayak: 0 };
    switch (row.grade) {
      case 'A':  grouped[t].gradeA     = Number(row.count); break;
      case 'B':  grouped[t].gradeB     = Number(row.count); break;
      case 'C':  grouped[t].gradeC     = Number(row.count); break;
      case 'TL': grouped[t].tidakLayak = Number(row.count); break;
    }
  });
  return Object.values(grouped);
}