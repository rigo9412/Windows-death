'use client';

import { useEffect, useState, useCallback } from 'react';

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

export default function UTMLogs() {
  const [logs, setLogs] = useState<UTMLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      // Obtener logs de la base de datos
      const response = await fetch('/api/utm-logs');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        // Fallback a localStorage si falla la BD
        const storedLogs = localStorage.getItem('utm_logs');
        const localData = storedLogs ? JSON.parse(storedLogs) : [];
        setLogs(localData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Fallback a localStorage
      const storedLogs = localStorage.getItem('utm_logs');
      const localData = storedLogs ? JSON.parse(storedLogs) : [];
      setLogs(localData);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Auto-refresh cada 5s
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    if (!filter) return true;
    const searchStr = filter.toLowerCase();
    return (
      log.utm_source?.toLowerCase().includes(searchStr) ||
      log.utm_medium?.toLowerCase().includes(searchStr) ||
      log.utm_campaign?.toLowerCase().includes(searchStr) ||
      log.url.toLowerCase().includes(searchStr)
    );
  });

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `utm-logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (confirm('¿Estás seguro de que quieres borrar todos los logs?')) {
      localStorage.removeItem('utm_logs');
      setLogs([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-500 text-white font-mono p-8 flex items-center justify-center">
        <div className="text-xl">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-500 text-white font-mono p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">UTM TRACKING LOGS</h1>
          <div className="text-sm text-green-600 mb-4 flex justify-between items-center">
            <span>Total entries: {logs.length} | Auto-refresh: 5s | Stored in Vercel Blob</span>
            <div className="space-x-2">
              <button
                onClick={exportLogs}
                className="px-4 py-1 bg-green-900 hover:bg-green-800 border border-green-600 text-white transition-colors"
                disabled={logs.length === 0}
              >
                Export JSON
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-1 bg-red-900 hover:bg-red-800 border border-red-600 text-red-400 transition-colors"
                disabled={logs.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Filter by source, medium, campaign, or URL..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-gray-900 border border-green-800 px-4 py-2 text-white placeholder-green-800 focus:outline-none focus:border-green-600"
          />
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center text-green-600 py-12">
            No UTM logs found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-green-900 p-4 hover:border-green-600 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-green-600">TIMESTAMP:</span> {formatDate(log.timestamp)}
                  </div>
                  {log.utm_source && (
                    <div>
                      <span className="text-green-600">SOURCE:</span> {log.utm_source}
                    </div>
                  )}
                  {log.utm_medium && (
                    <div>
                      <span className="text-green-600">MEDIUM:</span> {log.utm_medium}
                    </div>
                  )}
                  {log.utm_campaign && (
                    <div>
                      <span className="text-green-600">CAMPAIGN:</span> {log.utm_campaign}
                    </div>
                  )}
                  {log.utm_content && (
                    <div>
                      <span className="text-green-600">CONTENT:</span> {log.utm_content}
                    </div>
                  )}
                  {log.utm_term && (
                    <div>
                      <span className="text-green-600">TERM:</span> {log.utm_term}
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <span className="text-green-600">URL:</span>{' '}
                    <span className="break-all">{log.url}</span>
                  </div>
                  <div className="md:col-span-2 text-xs text-green-700">
                    <span className="text-green-600">USER-AGENT:</span> {log.userAgent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
