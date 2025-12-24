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