import { put, head } from '@vercel/blob';
import { NextResponse } from 'next/server';

interface UTMLog {
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
    // Verificar si el archivo existe
    const metadata = await head(BLOB_FILENAME);
    if (metadata) {
      const response = await fetch(metadata.url);
      const logs = await response.json();
      return Array.isArray(logs) ? logs : [];
    }
  } catch (error) {
    console.log('Blob file not found yet, starting with empty array');
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
      utm_source: utm_source || undefined,
      utm_medium: utm_medium || undefined,
      utm_campaign: utm_campaign || undefined,
      utm_content: utm_content || undefined,
      utm_term: utm_term || undefined,
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

    return NextResponse.json({ success: true, log, totalLogs: logs.length });
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
