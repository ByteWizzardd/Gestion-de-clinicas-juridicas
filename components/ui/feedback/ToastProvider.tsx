'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toast: {
        success: (message: string, title?: string, duration?: number) => void;
        error: (message: string, title?: string, duration?: number) => void;
        info: (message: string, title?: string, duration?: number) => void;
        warning: (message: string, title?: string, duration?: number) => void;
    };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, message: string, title?: string, duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message, title, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toastMethods = {
        success: (msg: string, title?: string, duration?: number) => addToast('success', msg, title, duration),
        error: (msg: string, title?: string, duration?: number) => addToast('error', msg, title, duration),
        info: (msg: string, title?: string, duration?: number) => addToast('info', msg, title, duration),
        warning: (msg: string, title?: string, duration?: number) => addToast('warning', msg, title, duration),
    };

    return (
        <ToastContext.Provider value={{ toast: toastMethods }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none sm:max-w-md w-full p-4">
                <AnimatePresence mode="popLayout">
                    {toasts.map((t) => (
                        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

const toastVariants = {
    initial: { opacity: 0, x: 50, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const styles = {
        success: { icon: <CheckCircle2 className="w-6 h-6 text-green-500" />, border: 'border-green-200', bg: 'bg-white/95', highlight: 'bg-green-500' },
        error: { icon: <AlertCircle className="w-6 h-6 text-red-500" />, border: 'border-red-200', bg: 'bg-white/95', highlight: 'bg-red-500' },
        info: { icon: <Info className="w-6 h-6 text-blue-500" />, border: 'border-blue-200', bg: 'bg-white/95', highlight: 'bg-blue-500' },
        warning: { icon: <AlertTriangle className="w-6 h-6 text-amber-500" />, border: 'border-amber-200', bg: 'bg-white/95', highlight: 'bg-amber-500' },
    };

    const style = styles[toast.type];

    return (
        <motion.div
            layout
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
        pointer-events-auto relative overflow-hidden
        flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md
        ${style.bg} ${style.border}
      `}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.highlight}`} />

            <div className="mt-0.5 shrink-0 pl-1">{style.icon}</div>
            <div className="flex-1 min-w-0 pt-0.5">
                {toast.title && <h4 className="font-semibold text-sm text-gray-900 mb-1">{toast.title}</h4>}
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{toast.message}</p>
            </div>
            <button
                onClick={onRemove}
                className="shrink-0 -mt-1 -mr-1 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors cursor-pointer"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
