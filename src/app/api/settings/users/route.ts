import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Ambil semua user
export async function GET() {
  try {
    const users: any = await executeQuery(
      `SELECT id, nama, username, role, created_at FROM users ORDER BY id ASC`
    );
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}

// POST - Tambah user baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, username, password, role } = body;

    if (!nama || !username || !password) {
      return NextResponse.json({ success: false, message: 'Nama, username, dan password wajib diisi' }, { status: 400 });
    }

    // Cek username sudah ada
    const existing: any = await executeQuery(
      `SELECT id FROM users WHERE username = ?`, [username]
    );
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Username sudah digunakan' }, { status: 400 });
    }

    await executeQuery(
      `INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)`,
      [nama, username, password, role || 'operator']
    );

    return NextResponse.json({ success: true, message: 'User berhasil ditambahkan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}

// PUT - Update user (nama, role, atau ganti password)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nama, role, password } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID user wajib diisi' }, { status: 400 });
    }

    if (password) {
      await executeQuery(
        `UPDATE users SET nama = ?, role = ?, password = ?, updated_at = NOW() WHERE id = ?`,
        [nama, role, password, id]
      );
    } else {
      await executeQuery(
        `UPDATE users SET nama = ?, role = ?, updated_at = NOW() WHERE id = ?`,
        [nama, role, id]
      );
    }

    return NextResponse.json({ success: true, message: 'User berhasil diupdate' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}

// DELETE - Hapus user
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID user wajib diisi' }, { status: 400 });
    }

    await executeQuery(`DELETE FROM users WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}