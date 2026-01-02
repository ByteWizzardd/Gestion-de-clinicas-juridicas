'use client';
import { useState, useRef, useEffect, ReactNode } from 'react';
import { User, Key, Bell, HelpCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileDropdownProps {
  userName: string;
  userRole: string;
  onProfileClick: () => void;
  onPasswordClick: () => void;
  onNotificationsClick: () => void;
  onHelpClick: () => void;
  onLogoutClick: () => void;
  children: ReactNode;
}

export default function ProfileDropdown({
  userName,
  userRole,
  onProfileClick,
  onPasswordClick,
  onNotificationsClick,
  onHelpClick,
  onLogoutClick,
  children,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Verificar si hay espacio suficiente abajo
      const checkPosition = () => {
        if (buttonRef.current && menuRef.current) {
          const buttonRect = buttonRef.current.getBoundingClientRect();
          const menuHeight = menuRef.current.offsetHeight || 250;
          const spaceBelow = window.innerHeight - buttonRect.bottom;
          const spaceAbove = buttonRect.top;
          
          // Si no hay espacio abajo pero sí arriba, mostrar arriba
          if (spaceBelow < menuHeight + 10 && spaceAbove > menuHeight + 10) {
            setShowAbove(true);
          } else {
            setShowAbove(false);
          }
        }
      };
      
      // Verificar posición después de que el menú se renderice
      setTimeout(checkPosition, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div 
        ref={buttonRef} 
        onClick={() => setIsOpen(!isOpen)} 
        className="cursor-pointer"
      >
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            ref={menuRef} 
            initial={{ opacity: 0, y: showAbove ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: showAbove ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`absolute left-full ml-0.1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2 ${
              showAbove ? 'bottom-0' : 'top-0'
            }`}
          >
            {/* Opciones del menú */}
          <div className="py-1">
            <button 
              onClick={() => handleAction(onProfileClick)} 
              className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
              Perfil
            </button>
            
            <button 
              onClick={() => handleAction(onPasswordClick)} 
              className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Key className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
              Cambiar contraseña
            </button>
            
            <button 
              onClick={() => handleAction(onNotificationsClick)} 
              className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
              Notificaciones
            </button>
            
            <button 
              onClick={() => handleAction(onHelpClick)} 
              className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
              Preguntas frecuentes
            </button>
          </div>

          {/* Separador antes de cerrar sesión */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Cerrar sesión */}
          <div className="py-1">
            <button 
              onClick={() => handleAction(onLogoutClick)} 
              className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
              Cerrar sesión
            </button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
