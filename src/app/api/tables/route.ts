import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { TableData } from '@/types/table';

const DATA_FILE = path.join(process.cwd(), 'data', 'tables.json');

async function ensureDataFile() {
  try {
    await fs.access(path.dirname(DATA_FILE));
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  }
  
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
  }
}

export async function GET() {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return NextResponse.json(JSON.parse(data));
}

export async function POST(request: Request) {
  const body = await request.json();
  await ensureDataFile();
  
  const tables: TableData[] = body;
  await fs.writeFile(DATA_FILE, JSON.stringify(tables, null, 2));
  
  return NextResponse.json({ success: true });
} 