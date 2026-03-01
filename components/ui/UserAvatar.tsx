'use client';

import { User } from 'lucide-react';
import Image from 'next/image';

interface UserAvatarProps {
  fotoPerfil: string | null | undefined;
  size?: number;
  className?: string;
  nombre?: string; // Add name for fallback
}

export default function UserAvatar({ fotoPerfil, size = 20, className = '', nombre }: UserAvatarProps) {
  // Manejar el caso de string vacío como si fuera null
  if (fotoPerfil && fotoPerfil.trim() !== '') {
    return (
      <div className={`relative flex-shrink-0 rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
        <Image
          src={fotoPerfil}
          alt="Foto de perfil"
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  // Fallback: Si hay nombre, mostrar inicial
  if (nombre) {
    return (
      <div
        className={`flex-shrink-0 rounded-full bg-[var(--sidebar-hover)] flex items-center justify-center font-medium text-[var(--foreground)] opacity-60 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.45 }}
      >
        {nombre.charAt(0).toUpperCase()}
      </div>
    );
  }

  // Fallback por defecto: Icono de usuario
  return (
    <User className={`text-[var(--foreground)] opacity-60 flex-shrink-0 ${className}`} style={{ width: size, height: size }} />
  );
}
