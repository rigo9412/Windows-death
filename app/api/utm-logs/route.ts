import { list, put } from '@vercel/blob';
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

const BLOB_FILENAME = 'utm-logs.json';

async function getLogs(): Promise<UTMLog[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      const logs = await response.json();
      return logs;
    }
  } catch (error) {
    console.error('Error reading logs:', error);
  }
  return [];
}

async function saveLogs(logs: UTMLog[]) {
  try {
    await put(BLOB_FILENAME, JSON.stringify(logs), { 
      access: 'public',
      contentType: 'application/json',
    });
  } catch (error) {
    console.error('Error saving logs:', error);
    throw error;
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
      user_agent: request.headers.get('user-agent') || 'Unknown',
    };

    // Obtener logs existentes
    const logs = await getLogs();
    
    // Agregar nuevo log al inicio
    logs.unshift(log);
    
    // Mantener solo los últimos 500 registros
    if (logs.length > 500) {
      logs.splice(500);
    }

    // Guardar en blob
    await saveLogs(logs);

    return NextResponse.json({ success: true, log });
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
    const logs = await getLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ 
      error: 'Failed to get logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
