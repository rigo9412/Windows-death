import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (command: string, action: string, options?: Record<string, string>) => void;
  }
}

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export function useUTM() {
  useEffect(() => {
    // Obtener parámetros UTM de la URL
    const params = new URLSearchParams(window.location.search);
    const utm: UTMParams = {};
    
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    
    utmKeys.forEach(key => {
      const value = params.get(key);
      if (value) {
        utm[key as keyof UTMParams] = value;
      }
    });

    // Si hay parámetros UTM, enviarlos a Google Analytics
    if (Object.keys(utm).length > 0) {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'utm_campaign_detected', utm as Record<string, string>);
      }
      
      // Guardar en localStorage con timestamp
      const log = {
        ...utm,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
      
      // Obtener logs existentes
      const existingLogs = localStorage.getItem('utm_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      // Agregar nuevo log al inicio
      logs.unshift(log);
      
      // Mantener solo los últimos 100 registros
      if (logs.length > 100) {
        logs.splice(100);
      }
      
      // Guardar logs actualizados
      localStorage.setItem('utm_logs', JSON.stringify(logs));
      
      // También guardar el último UTM
      localStorage.setItem('utm_params', JSON.stringify(utm));
      
      // Guardar en la base de datos
      fetch('/api/utm-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...utm,
          url: window.location.href,
        }),
      }).catch(error => console.error('Error saving UTM log:', error));
    }
  }, []);
}

export function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem('utm_params');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {};
}
