// Layout para las páginas de autenticación (login)
// Este layout se aplica a todas las rutas dentro de /auth

// Aquí va:
// - Layout común para las páginas de autenticación
// - Diseño centrado en la pantalla
// - Logo de la aplicación (DER)
// - Fondo o diseño específico para las páginas de auth
// - NO incluir el Sidebar (solo en dashboard)
// - Estructura base para las páginas de autenticación

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Estructura común para las páginas de autenticación */}
      {children}
    </div>
  );
}