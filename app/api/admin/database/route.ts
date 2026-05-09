import { NextResponse } from 'next/server';
import { getDatabaseBootstrapStatus } from '@/lib/system/database-status';

export async function GET() {
  try {
    return NextResponse.json(await getDatabaseBootstrapStatus());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to inspect database state';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'In-app database restore is disabled for PostgreSQL-based deployments. Use your database provider backup and restore workflow instead.',
    },
    { status: 405 },
  );
}
