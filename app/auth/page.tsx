"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
export default function AuthHome (){
    const router = useRouter();
    const [isExiting, setIsExiting] = useState(false);
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

    const handleLogin = () => {
        setIsExiting(true);
        setTimeout(() => {
            router.push("/auth/login");
        }, prefersReducedMotion ? 0 : 150);
    }

    return(
        <div className="bg-background relative overflow-hidden min-h-svh">
            <AnimatePresence>
                {!isExiting && (
                    <>
                        {/* Logo */}
                        <motion.div 
                            key="logo"
                            className="absolute top-4 left-4 z-10"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut"}}>
                            <Image src="/image.png" alt="DER Logo" width={240} height={87} className="object-contain w-36 sm:w-60 h-auto"/>
                        </motion.div>
                        
                        {/* Decoración 1 - Esquina superior derecha */}
                        <motion.div 
                            key="deco1"
                            className="absolute top-[-10] right-0 z-0 pointer-events-none"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}>
                            <Image src="/deco1.svg" alt="Decoración 1" width={600} height={600} className="object-contain w-48 sm:w-80 md:w-[600px] h-auto"/>
                        </motion.div>
                        
                        {/* Decoración 2 - Esquina inferior izquierda */}
                        <motion.div 
                            key="deco2"
                            className="absolute bottom-[-10] left-0 z-0 pointer-events-none"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}>
                            <Image src="/deco2.svg" alt="Decoración 2" width={600} height={600} className="object-contain w-48 sm:w-80 md:w-[600px] h-auto"/>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Contenedor centrado para la tarjeta */}
            <div className="flex min-h-svh justify-center items-center relative z-10 px-4">
                <AnimatePresence>
                    {!isExiting && (
                        <motion.div 
                            key="card"
                            className="w-full max-w-md bg-[#FCFCFC] rounded-3xl sm:rounded-4xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8 py-10 sm:py-12"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut"}}>
                    <div className="text-foreground text-center mb-8">
                        {/*Textos*/}
                        <p className="text-3xl sm:text-5xl font-semibold font-primary mb-2">
                            Clínica Jurídica
                        </p>
                        <p className="text-base sm:text-xl font-normal font-primary">
                            UCAB - Ext. Guayana
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                        {/* Botón de Iniciar Sesión */}
                        <Button 
                            children="Iniciar sesión" 
                            variant="primary" 
                            size="lg" 
                            isLoading={false} 
                            className="rounded-3xl! text-xl! w-full" 
                            onClick={handleLogin}
                        />
                    </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}