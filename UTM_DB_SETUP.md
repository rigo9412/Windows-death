# UTM Tracking System - Configuración de Vercel Blob

## Configuración en Vercel (Producción)

### 1. Crear el Blob Store

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Navega a la pestaña **Storage**
3. Click en **Create Database**
4. Selecciona **Blob**
5. Asigna un nombre (ej: `utm-logs-blob`)
6. Click en **Create**

### 2. Conectar a tu proyecto

1. En la página de tu Blob Store, click en **Connect Project**
2. Selecciona tu proyecto de la lista
3. La variable `BLOB_READ_WRITE_TOKEN` se configurará automáticamente

### 3. ¡Listo!

No necesitas inicializar nada. El sistema creará automáticamente el archivo `utm-logs.json` cuando guardes el primer log UTM.

## Desarrollo Local

### 1. Descargar las variables de entorno

```bash
vercel env pull .env.local
```

### 2. Ejecutar el servidor

```bash
bun run dev
```

## Cómo Funciona

- Los logs UTM se guardan en un archivo JSON en Vercel Blob
- Cada vez que se detecta un parámetro UTM, se agrega al archivo
- Se mantienen los últimos 500 registros automáticamente
- Fallback a localStorage si Blob no está configurado

## Funcionalidades

- ✅ Almacenamiento persistente en Vercel Blob
- ✅ Fallback a localStorage si falla Blob
- ✅ Auto-refresh cada 5 segundos
- ✅ Exportar logs a JSON
- ✅ Limpiar logs locales
- ✅ Filtrado en tiempo real
- ✅ Límite de 500 registros

## Endpoints

- `POST /api/utm-logs` - Guardar nuevo log UTM
- `GET /api/utm-logs` - Obtener todos los logs

## Ver los Logs

Visita `/utm-logs` para ver todos los registros guardados.

## Ventajas de Vercel Blob

- ✅ Configuración simple (solo 1 variable de entorno)
- ✅ No requiere esquema de base de datos
- ✅ Escalable y rápido
- ✅ Ideal para archivos JSON
- ✅ Incluido en el plan gratuito de Vercel
