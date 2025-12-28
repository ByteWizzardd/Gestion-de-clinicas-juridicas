'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import ActionHistoryCard from './ActionHistoryCard';

interface Action {
  mainText: string;
  subText?: string;
  caseInfo: string;
  date: string;
  time?: string; // Opcional, ya no se muestra
  actionType: 'document' | 'appointment' | 'view' | 'update' | 'other';
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
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-12">
          <ClipboardList className="w-16 h-16 mb-4 opacity-40 text-gray-400" />
          <p className="text-lg font-medium text-gray-600">No hay acciones recientes</p>
          <p className="text-sm mt-2 text-gray-500">Las actividades de tus casos aparecerán aquí</p>
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
                actionType={action.actionType}
                isLast={index === actions.length - 1}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

