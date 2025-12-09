import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

interface UTMLog {
  id?: number;
  timestamp: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  url: string;
  user_agent: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { utm_source, utm_medium, utm_campaign, utm_content, utm_term, url } = body;

    // Insertar en la base de datos
    await sql`
      INSERT INTO utm_logs (
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, url, user_agent
      ) VALUES (
        ${utm_source || null}, ${utm_medium || null}, ${utm_campaign || null},
        ${utm_content || null}, ${utm_term || null}, ${url},
        ${request.headers.get('user-agent') || 'Unknown'}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving log:', error);
    return NextResponse.json({ 
      error: 'Failed to save log',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Obtener los últimos 100 logs
    const result = await sql`
      SELECT * FROM utm_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `;

    const logs = result.rows.map(row => ({
      timestamp: row.created_at,
      utm_source: row.utm_source,
      utm_medium: row.utm_medium,
      utm_campaign: row.utm_campaign,
      utm_content: row.utm_content,
      utm_term: row.utm_term,
      url: row.url,
      user_agent: row.user_agent,
    }));

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ 
      error: 'Failed to get logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
