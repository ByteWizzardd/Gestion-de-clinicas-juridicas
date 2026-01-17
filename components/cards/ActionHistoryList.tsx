'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import ActionHistoryCard from './ActionHistoryCard';
import EmptyState from '@/components/ui/EmptyState';

interface Action {
  mainText: string;
  subText?: string;
  caseInfo: string;
  date: string;
  time?: string; // Opcional, ya no se muestra
}

interface ActionHistoryListProps {
  actions: Action[];
}

export default function ActionHistoryList({
  actions,
}: ActionHistoryListProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="relative h-full flex flex-col">
      {actions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={ClipboardList}
            title="Sin actividad reciente"
            description="Las acciones realizadas en los casos se mostrarán aquí"
          />
        </div>
      ) : (
        <div className="space-y-0">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.15,
                delay: prefersReducedMotion ? 0 : index * 0.05,
                ease: "easeOut"
              }}
            >
              <ActionHistoryCard
                mainText={action.mainText}
                subText={action.subText}
                caseInfo={action.caseInfo}
                date={action.date}
                time={action.time}
                isLast={index === actions.length - 1}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}