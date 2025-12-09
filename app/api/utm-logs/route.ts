import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'utm-logs.json');

interface UTMLog {
  timestamp: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  url: string;
  userAgent: string;
}

function getLogs(): UTMLog[] {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const data = fs.readFileSync(LOG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading logs:', error);
  }
  return [];
}

function saveLogs(logs: UTMLog[]) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error saving logs:', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { utm_source, utm_medium, utm_campaign, utm_content, utm_term, url } = body;

    const log: UTMLog = {
      timestamp: new Date().toISOString(),
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      url,
      userAgent: request.headers.get('user-agent') || 'Unknown',
    };

    const logs = getLogs();
    logs.unshift(log); // Agregar al inicio
    
    // Mantener solo los últimos 1000 registros
    if (logs.length > 1000) {
      logs.splice(1000);
    }

    saveLogs(logs);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const logs = getLogs();
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ error: 'Failed to get logs' }, { status: 500 });
  }
}
