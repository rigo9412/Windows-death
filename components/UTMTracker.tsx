'use client';

import { useUTM } from '@/lib/hooks/useUTM';

export function UTMTracker() {
  useUTM();
  return null;
}
