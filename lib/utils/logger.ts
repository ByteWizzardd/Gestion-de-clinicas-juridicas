type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

/**
 * Logger simple para la aplicación
 * En desarrollo: muestra logs en consola
 * En producción: puede extenderse para enviar a servicios externos (Sentry, LogRocket, etc.)
 */
class Logger {
  private log(level: LogLevel, message: any, data?: any) {
    const entry: LogEntry = {
      level,
      message: typeof message === 'string' ? message : String(message),
      timestamp: new Date().toISOString(),
      ...(data && { data }),
    };

    // En desarrollo: mostrar en consola
    if (process.env.NODE_ENV === 'development') {
      const emoji = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        debug: '🔍',
      }[level];

      console[level === 'error' ? 'error' : 'log'](
        `${emoji} [${entry.timestamp}] ${entry.message}`,
        data || ''
      );
    }

    // En producción: aquí podrías enviar a un servicio de logging
    // Ejemplo: Sentry, LogRocket, CloudWatch, etc.
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implementar envío a servicio de logging
    }
  }

  /**
   * Log de información general
   */
  info(message: any, data?: any) {
    this.log('info', message, data);
  }

  /**
   * Log de advertencia
   */
  warn(message: any, data?: any) {
    this.log('warn', message, data);
  }

  /**
   * Log de error
   */
  error(message: any, data?: any) {
    this.log('error', message, data);
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(message: any, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }
}

export const logger = new Logger();

