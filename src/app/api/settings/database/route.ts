import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_PATH = path.join(process.cwd(), '.env.local');

// GET - Baca konfigurasi dari .env.local
export async function GET() {
  try {
    const content = fs.readFileSync(ENV_PATH, 'utf-8');
    const lines = content.split('\n');
    const config: Record<string, string> = {};

    lines.forEach(line => {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) config[key.trim()] = rest.join('=').trim();
    });

    return NextResponse.json({
      success: true,
      data: {
        host: config['DB_HOST'] || '',
        port: config['DB_PORT'] || '3306',
        user: config['DB_USER'] || '',
        password: config['DB_PASSWORD'] || '',
        database: config['DB_NAME'] || '',
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal membaca konfigurasi' }, { status: 500 });
  }
}

// POST - Simpan konfigurasi ke .env.local
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { host, port, user, password, database } = body;

    const content = `DB_HOST=${host}
DB_PORT=${port}
DB_USER=${user}
DB_PASSWORD=${password}
DB_NAME=${database}
`;

    fs.writeFileSync(ENV_PATH, content, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Konfigurasi berhasil disimpan. Restart server untuk menerapkan perubahan.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menyimpan konfigurasi' }, { status: 500 });
  }
}