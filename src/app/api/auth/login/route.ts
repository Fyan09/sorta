import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const users: any = await executeQuery(
      `SELECT id, nama, username, password, role FROM users WHERE username = ? AND password = ?`,
      [username, password]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Username atau password salah!' },
        { status: 401 }
      );
    }

    const user = users[0];
    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: { id: user.id, nama: user.nama, username: user.username, role: user.role }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}