'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-xl mb-6" aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="text-[var(--card-text-muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
      >
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-[var(--card-text-muted)] opacity-60 transition-colors" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-[var(--card-text-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--foreground)] font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

