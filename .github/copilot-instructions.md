# Copilot Instructions for Gestion de Clínicas Jurídicas

## Visión General

Este proyecto es una aplicación web de gestión para clínicas jurídicas, construida con Next.js (App Router), React 19, TypeScript y TailwindCSS. El objetivo es facilitar la administración de casos, citas, usuarios y reportes en un entorno universitario.

## Estructura Principal

- **`/app`**: Rutas y layouts de Next.js. Subcarpetas para autenticación (`/auth`), dashboard y secciones funcionales (casos, citas, solicitantes, usuarios, etc.).
- **`/components`**: Componentes reutilizables, organizados por dominio (ej. `CaseTools`, `forms`, `sidebar`, `Table`, `ui`).
- **`/types`**: Tipos TypeScript compartidos (ej. `appointment.ts`).
- **`/public`**: Recursos estáticos (imágenes, SVGs).

## Patrones y Convenciones

- **Componentes UI**: Todos los inputs, selects, modales, botones, etc. usan componentes propios en `components/ui/` con estilos de Tailwind y variantes personalizadas.
- **Roles y Menús**: La navegación lateral se genera dinámicamente según el rol del usuario usando `components/sidebar/menu-config.ts`.
- **Formularios**: Los formularios modales (`components/forms/`) gestionan su propio estado y validación local, y usan componentes UI personalizados.
- **Tablas**: El sistema de tablas es genérico y paginado (`components/Table/`).
- **Animaciones**: Se usa la librería `motion` para transiciones y animaciones en formularios y páginas de auth.
- **Internacionalización**: La interfaz y los mensajes están en español.

## Flujos de Desarrollo

- **Desarrollo local**:
  - Iniciar: `npm run dev`
  - Build: `npm run build`
  - Lint: `npm run lint`
- **No hay tests automatizados definidos** (al 2025-11-26).
- **Autenticación**: Las páginas de login y registro están en `/app/auth/`. El layout de auth es independiente del dashboard.
- **Redirección**: La raíz (`/app/page.tsx`) redirige automáticamente a `/dashboard`.

## Integraciones y Dependencias

- **@heroicons/react**: Íconos SVG en toda la UI.
- **motion**: Animaciones y transiciones.
- **TailwindCSS**: Utilidades y temas personalizados (ver `tailwind.config.ts` y `app/globals.css`).
- **No hay backend ni API definida** en este repo; los datos son mockeados en el frontend.

## Ejemplos de Patrones Clave

- **Menú por rol**: Usa `getMenuByRole(role)` de `components/sidebar/menu-config.ts` para obtener el menú adecuado.
- **Formulario de caso**: Ver `components/forms/CaseFormModal.tsx` para validación y manejo de estado.
- **Tabla genérica**: Ver `components/Table/Table.tsx` para paginación y renderizado dinámico.

## Notas y Reglas Específicas

- **No modificar directamente el layout de dashboard para incluir lógica de negocio**; usar componentes.
- **Mantener la consistencia visual usando los componentes de `ui/` y las variables CSS definidas en `globals.css`**.
- **No hay lógica de backend ni persistencia**: cualquier integración debe ser mock o local.
- **No hay instrucciones previas de AI ni reglas de agentes**: este archivo es la referencia principal.

---

¿Falta algún flujo, convención o integración importante? Por favor, indícalo para mejorar estas instrucciones.