import type { MetadataRoute } from 'next';

/**
 * El sistema no tiene nada que buscar desde fuera: es una herramienta interna
 * de la clínica. Sin esto, la pantalla de login termina indexada y el
 * despliegue aparece en Google, que es por donde llegan los curiosos.
 *
 * Es una petición, no una barrera — un rastreador puede ignorarla. La barrera
 * es la puerta de escritorio del middleware.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
