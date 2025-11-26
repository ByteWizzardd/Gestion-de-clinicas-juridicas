'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { getMenuByRole, type UserRole } from './menu-config';

interface SidebarProps {
  role: UserRole;
  userName?: string;
}

export default function Sidebar({ role, userName = 'Nombre Apellido' }: SidebarProps) {
  const pathname = usePathname();
  const menu = getMenuByRole(role);

  // Función para obtener el label del rol en español
  const getRoleLabel = (role: UserRole): string => {
    const roleLabels: Record<UserRole, string> = {
      admin: 'Administrador',
      professor: 'Profesor',
      student: 'Estudiante',
    };
    return roleLabels[role];
  };

  const handleLogout = () => {
    console.log('Cerrar sesión');
  };

  return (
    <aside className="w-56 bg-background flex flex-col h-[calc(100vh-2rem)] rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] m-4">
      <div className="p-6 flex justify-center">
        <Image src="/image.png" alt="DER Logo" width={240} height={87} className="object-contain"/>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 overflow-y-auto mt-[-8] p-4">
        <ul className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-200
                      ${isActive ? 'bg-primary text-white font-semibold rounded-3xl'
                          : 'text-foreground hover:bg-gray-100 rounded-lg hover:rounded-3xl'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-foreground'}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer del Sidebar */}
      <div className="px-4 pb-8 space-y-3">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-gray-600">{getRoleLabel(role)}</p>
          </div>
        </div>

        <button onClick={handleLogout} className="w-full bg-primary text-white px-3 py-1.5 rounded-lg text-sm cursor-pointer font-medium flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors ">
          <ArrowRightOnRectangleIcon className="w-4 h-4"/>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

