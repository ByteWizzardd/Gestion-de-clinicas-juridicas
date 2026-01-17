
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/pool';

export async function GET() {
    try {
        await pool.query('CREATE EXTENSION IF NOT EXISTS unaccent');
        return NextResponse.json({ success: true, message: 'Extension enabled' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
