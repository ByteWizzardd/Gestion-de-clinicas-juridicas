import { UserGroupIcon, BriefcaseIcon, CalendarIcon, UserIcon, TableCellsIcon, Squares2X2Icon, ClockIcon } from '@heroicons/react/24/solid';

export type UserRole = 'admin' | 'professor' | 'student';

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[]; // Si no se especifica, está disponible para todos los roles
  // Para items que tienen diferentes labels según el rol
  labelByRole?: Record<UserRole, string>;
}

// Menú completo con todos los items y sus permisos
export const fullMenu: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Squares2X2Icon,
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
    icon: BriefcaseIcon,
    roles: ['admin', 'professor', 'student'],
  },
  {
    label: 'Solicitantes',
    href: '/dashboard/applicants',
    icon: UserIcon,
    roles: ['admin', 'professor', 'student'],
  },
  {
    label: 'Programación y Consultas',
    href: '/dashboard/appointments',
    icon: CalendarIcon,
    roles: ['admin', 'professor', 'student'],
  },
  {
    label: 'Gestión de Usuarios',
    href: '/dashboard/users',
    icon: UserGroupIcon,
    roles: ['admin'],
    labelByRole: {
      admin: 'Gestión de Usuarios',
      professor: 'Gestión de Equipo',
      student: 'Gestión de Usuarios',
    },
  },
  {
    label: 'Gestión de Catálogos',
    href: '/dashboard/catalogs',
    icon: TableCellsIcon,
    roles: ['admin'],
  },
  {
    label: 'Reportes',
    href: '/dashboard/reports',
    icon: ClockIcon,
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
    }));
}

// Configuración de menús por rol (alternativa más explícita)
export const menuByRole: Record<UserRole, MenuItem[]> = {
  admin: getMenuByRole('admin'),
  professor: getMenuByRole('professor'),
  student: getMenuByRole('student'),
};