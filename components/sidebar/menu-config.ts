import { Users, Briefcase, Calendar, User, Table, LayoutGrid, Clock } from 'lucide-react';

export type UserRole = 'admin' | 'professor' | 'student';

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[]; // Si no se especifica, está disponible para todos los roles
  // Para items que tienen diferentes labels según el rol
  labelByRole?: Record<UserRole, string>;
  // Para items que tienen diferentes hrefs según el rol
  hrefByRole?: Record<UserRole, string>;
}

// Menú completo con todos los items y sus permisos
export const fullMenu: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
    roles: ['admin', 'professor', 'student'],
    labelByRole: {
      admin: 'Dashboard',
      professor: 'Mi Panel',
      student: 'Mi Panel',
    },
  },
  {
    label: 'Listado de Casos',
    href: '/dashboard/cases',
    icon: Briefcase,
    roles: ['admin', 'professor', 'student'],
  },
  {
    label: 'Solicitantes',
    href: '/dashboard/applicants',
    icon: User,
    roles: ['admin', 'professor', 'student'],
  },
  {
    label: 'Programación y Consultas',
    href: '/dashboard/appointments',
    icon: Calendar,
    roles: ['admin', 'professor', 'student'],
  },
  {
    label: 'Gestión de Usuarios',
    href: '/dashboard/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    label: 'Gestión de Equipo',
    href: '/dashboard/team',
    icon: Users,
    roles: ['professor'],
  },
  {
    label: 'Gestión de Catálogos',
    href: '/dashboard/catalogs',
    icon: Table,
    roles: ['admin'],
  },
  {
    label: 'Reportes',
    href: '/dashboard/reports',
    icon: Clock,
    roles: ['professor', 'student'],
  },
];

// Función helper para obtener el menú filtrado por rol
export function getMenuByRole(role: UserRole): MenuItem[] {
  return fullMenu
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      label: item.labelByRole?.[role] || item.label,
      href: item.hrefByRole?.[role] || item.href,
    }));
}

// Configuración de menús por rol (alternativa más explícita)
export const menuByRole: Record<UserRole, MenuItem[]> = {
  admin: getMenuByRole('admin'),
  professor: getMenuByRole('professor'),
  student: getMenuByRole('student'),
};