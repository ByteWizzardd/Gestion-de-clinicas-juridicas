'use client';
import { useState, useRef, useEffect, ReactNode } from 'react';
import { User, Key, Bell, HelpCircle, LogOut, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';

interface ProfileDropdownProps {
  userName: string;
  userRole: string;
  userCedula?: string;
  onProfileClick: () => void;
  onPasswordClick: () => void;
  onHelpClick: () => void;
  onLogoutClick: () => void;
  children: ReactNode;
}

export default function ProfileDropdown({
  userName,
  userRole,
  userCedula,
  onProfileClick,
  onPasswordClick,
  onHelpClick,
  onLogoutClick,
  children,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleToggleTheme = () => {
    // Usar resolvedTheme para determinar el estado actual real (incluyendo system preference)
    const effectiveTheme = theme === 'system' ? resolvedTheme : theme;
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';

    setTheme(newTheme);

    // Persistir en cookie específica del usuario (similar al sidebar)
    if (userCedula) {
      document.cookie = `theme_preference_${userCedula}=${newTheme}; path=/; max-age=31536000`; // 1 año
    }
  };

  const isDarkMode = resolvedTheme === 'dark';

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
            className={`absolute left-full ml-1 md:ml-2 w-48 sm:w-56 bg-[var(--dropdown-bg)] rounded-xl shadow-xl border border-[var(--dropdown-border)] z-50 py-2 transition-colors ${showAbove ? 'bottom-0' : 'top-0'
              } max-w-[calc(100vw-4rem)]`}
          >
            {/* Opciones del menú */}
            <div className="py-1">
              <button
                onClick={() => handleAction(onProfileClick)}
                className="group w-full px-4 py-2.5 text-left text-base text-[var(--dropdown-text)] hover:text-[var(--dropdown-text-hover)] hover:bg-[var(--dropdown-hover)] flex items-center gap-3 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-[var(--dropdown-text)] group-hover:text-[var(--dropdown-text-hover)] transition-colors" />
                Perfil
              </button>

              <button
                onClick={() => handleAction(onPasswordClick)}
                className="group w-full px-4 py-2.5 text-left text-base text-[var(--dropdown-text)] hover:text-[var(--dropdown-text-hover)] hover:bg-[var(--dropdown-hover)] flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Key className="w-4 h-4 text-[var(--dropdown-text)] group-hover:text-[var(--dropdown-text-hover)] transition-colors" />
                Cambiar contraseña
              </button>

              <button
                onClick={() => handleAction(onHelpClick)}
                className="group w-full px-4 py-2.5 text-left text-base text-[var(--dropdown-text)] hover:text-[var(--dropdown-text-hover)] hover:bg-[var(--dropdown-hover)] flex items-center gap-3 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-[var(--dropdown-text)] group-hover:text-[var(--dropdown-text-hover)] transition-colors" />
                Preguntas frecuentes
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleTheme();
                }}
                className="group w-full px-4 py-2.5 text-left text-base text-[var(--dropdown-text)] hover:text-[var(--dropdown-text-hover)] hover:bg-[var(--dropdown-hover)] flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {mounted && isDarkMode ? (
                    <Sun className="w-4 h-4 text-[var(--dropdown-text)] group-hover:text-[var(--dropdown-text-hover)] transition-colors" />
                  ) : (
                    <Moon className="w-4 h-4 text-[var(--dropdown-text)] group-hover:text-[var(--dropdown-text-hover)] transition-colors" />
                  )}
                  {mounted && isDarkMode ? 'Modo claro' : 'Modo oscuro'}
                </div>
                {mounted && (
                  <div className={`w-8 h-4 rounded-full flex items-center transition-colors px-0.5 ${isDarkMode ? 'bg-primary' : 'bg-gray-200'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                )}
              </button>
            </div>

            {/* Separador antes de cerrar sesión */}
            <div className="border-t border-[var(--dropdown-border)] my-1"></div>

            {/* Cerrar sesión */}
            <div className="py-1">
              <button
                onClick={() => handleAction(onLogoutClick)}
                className="group w-full px-4 py-2.5 text-left text-base text-[var(--dropdown-text)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[var(--dropdown-text)] group-hover:text-red-600 transition-colors" />
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
