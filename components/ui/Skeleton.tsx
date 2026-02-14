'use client';

import { CSSProperties } from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
    style?: CSSProperties;
}

/**
 * Componente base de Skeleton con animación shimmer.
 * Se usa como bloque de construcción para skeletons más complejos.
 */
export function Skeleton({
    width,
    height,
    borderRadius = '8px',
    className = '',
    style,
}: SkeletonProps) {
    return (
        <div
            className={`skeleton-shimmer ${className}`}
            style={{
                width: width ?? '100%',
                height: height ?? '16px',
                borderRadius,
                ...style,
            }}
        />
    );
}

/**
 * Skeleton circular (para avatares, iconos).
 */
export function SkeletonCircle({
    size = 40,
    className = '',
}: {
    size?: number;
    className?: string;
}) {
    return (
        <Skeleton
            width={size}
            height={size}
            borderRadius="50%"
            className={className}
        />
    );
}

/**
 * Skeleton de texto: genera múltiples líneas con anchos variables.
 */
export function SkeletonText({
    lines = 3,
    className = '',
}: {
    lines?: number;
    className?: string;
}) {
    const widths = ['100%', '92%', '85%', '76%', '60%'];
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={widths[i % widths.length]}
                    height={12}
                    borderRadius="6px"
                />
            ))}
        </div>
    );
}
