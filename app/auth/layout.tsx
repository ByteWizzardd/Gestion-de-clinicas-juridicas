// Layout para las páginas de autenticación (login y register)
// Este layout se aplica a todas las rutas dentro de /auth

// Aquí va:
// - Layout común para login y register
// - Diseño centrado en la pantalla
// - Logo de la aplicación (DER)
// - Fondo o diseño específico para las páginas de auth
// - NO incluir el Sidebar (solo en dashboard)
// - Estructura base para que login y register tengan el mismo diseño

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Estructura común para login y register */}
      {children}
    </div>
  );
}

