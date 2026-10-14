import React from 'react';
import { Toaster } from 'sonner';
import { useStore } from '../contexts/StoreContext';

export function ThemedToaster() {
  const { theme } = useStore();
  return <Toaster theme={theme} position="top-right" richColors closeButton toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />;
}