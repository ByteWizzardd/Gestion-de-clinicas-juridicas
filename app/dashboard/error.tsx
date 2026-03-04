'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { logger } from '@/lib/utils/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Error en dashboard:', error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Algo salió mal
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'Ocurrió un error inesperado'}
        </p>
        <Button onClick={reset} variant="primary">
          Intentar de nuevo
        </Button>
      </div>
    </div>
  );
}

