import { createClient } from 'redis';
import { NextResponse } from 'next/server';
import { TableData } from '@/types/table';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.error('Redis Client Error', err));

async function getRedisClient() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

export async function GET() {
  try {
    const client = await getRedisClient();
    const data = await client.get('tables');
    return NextResponse.json(data ? JSON.parse(data) : []);
  } catch (error) {
    console.error('테이블 데이터 조회 중 오류 발생:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tables: TableData[] = await request.json();
    const client = await getRedisClient();
    await client.set('tables', JSON.stringify(tables));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('테이블 데이터 저장 중 오류 발생:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 