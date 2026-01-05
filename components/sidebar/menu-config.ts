import { Users, Briefcase, Calendar, User, Table, LayoutGrid, Clock, Eye } from 'lucide-react';

export type UserRole = 'coordinator' | 'professor' | 'student';

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
    roles: ['coordinator', 'professor', 'student'],
    labelByRole: {
      coordinator: 'Dashboard',
      professor: 'Mi Panel',
      student: 'Mi Panel',
    },
  },
  {
    label: 'Casos',
    href: '/dashboard/cases',
    icon: Briefcase,
    roles: ['coordinator', 'professor', 'student'],
  },
  {
    label: 'Solicitantes',
    href: '/dashboard/applicants',
    icon: User,
    roles: ['coordinator', 'professor', 'student'],
  },
  {
    label: 'Citas',
    href: '/dashboard/appointments',
    icon: Calendar,
    roles: ['coordinator', 'professor', 'student'],
  },
  {
    label: 'Reportes',
    href: '/dashboard/reports',
    icon: Clock,
    roles: ['coordinator', 'professor', 'student'],
  },
  {
    label: 'Usuarios',
    href: '/dashboard/users',
    icon: Users,
    roles: ['coordinator'],
  },
  {
    label: 'Gestión de Equipo',
    href: '/dashboard/team',
    icon: Users,
    roles: ['professor'],
  },
  {
    label: 'Catálogos',
    href: '/dashboard/catalogs',
    icon: Table,
    roles: ['coordinator'],
  },
  {
    label: 'Auditoría',
    href: '/dashboard/audit',
    icon: Eye,
    roles: ['coordinator'],
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
  coordinator: getMenuByRole('coordinator'),
  professor: getMenuByRole('professor'),
  student: getMenuByRole('student'),
};