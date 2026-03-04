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

    // En producción: enviamos un formato JSON estructurado
    // limpio para que plataformas como Vercel/Railway o Axiom puedan categorizar los logs.
    if (process.env.NODE_ENV === 'production') {
      // Helper para serializar errores correctamente, ya que JSON.stringify ignora las propiedades de Error
      const logData = data instanceof Error
        ? { name: data.name, message: data.message, stack: data.stack }
        : data;

      const prodEntry = {
        level: entry.level,
        message: entry.message,
        timestamp: entry.timestamp,
        ...(logData && { data: logData }),
      };

      // Solo usamos el nivel 'error' o 'log' (para todo lo demás)
      console[level === 'error' ? 'error' : 'log'](JSON.stringify(prodEntry));
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

