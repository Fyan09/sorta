import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// POST - Test koneksi database dengan config yang dikirim
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { host, port, user, password, database } = body;

    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
      connectTimeout: 5000
    });

    await connection.ping();
    await connection.end();

    return NextResponse.json({
      success: true,
      message: `Koneksi ke ${host}:${port}/${database} berhasil!`
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Koneksi gagal: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}