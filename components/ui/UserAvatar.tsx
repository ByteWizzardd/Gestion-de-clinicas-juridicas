'use client';

import { User } from 'lucide-react';
import Image from 'next/image';

interface UserAvatarProps {
  fotoPerfil: string | null | undefined;
  size?: number;
  className?: string;
}

export default function UserAvatar({ fotoPerfil, size = 20, className = '' }: UserAvatarProps) {
  if (fotoPerfil) {
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

  return (
    <User className={`text-gray-600 flex-shrink-0 ${className}`} style={{ width: size, height: size }} />
  );
}
