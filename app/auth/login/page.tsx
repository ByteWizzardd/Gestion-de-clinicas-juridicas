"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/forms/Input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export default function LoginPage() {
    const router = useRouter();
    const [isExiting, setIsExiting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [formData, setFormData] = useState({
        nombreUsuario: "",
        password: "",
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);
        
        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };
        
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsExiting(true);
        setTimeout(() => {
            router.push("/auth");
        }, prefersReducedMotion ? 0 : 150);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError(null);
    };

    const handleLogin = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        
        setError(null);
        
        if (!formData.nombreUsuario || !formData.password) {
            setError("Por favor complete todos los campos");
            return;
        }

        setIsLoading(true);

        try {
            const { loginAction } = await import('@/app/actions/auth');
            const formDataToSend = new FormData();
            formDataToSend.append('nombreUsuario', formData.nombreUsuario);
            formDataToSend.append('password', formData.password);

            const result = await loginAction(formDataToSend);

            if (!result.success) {
                throw new Error(result.error?.message || "Error al iniciar sesión");
            }

            // Login exitoso
            setIsExiting(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, prefersReducedMotion ? 0 : 150);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al iniciar sesión");
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin();
    };

    return(
        <div className="bg-background relative overflow-hidden min-h-svh">
            <AnimatePresence>
                {!isExiting && (
                    <motion.div
                        key="back-arrow"
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}>
                        <Link href="/auth" onClick={handleBack}
                            className="absolute top-4 left-4 sm:top-10 sm:left-8 z-30 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8 text-foreground hover:text-primary transition-colors" />
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Contenedor principal con layout flex */}
            <div className="flex min-h-svh items-center justify-center sm:justify-start px-4 sm:px-12 relative">
                <AnimatePresence>
                    {!isExiting && (
                        <motion.div 
                            key="login-form"
                            className="w-full max-w-md mx-auto sm:mx-0 sm:pl-15"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                        <div className="mb-5">
                            <h1 className="text-3xl sm:text-5xl font-normal text-foreground mb-2 text-center font-primary">Iniciar Sesión</h1>
                            <div className="w-full h-0.5 bg-secondary mt-5"/>
                        </div>
                        {error && (
                            <div className="bg-danger-light border border-danger rounded-lg p-3 text-danger text-sm">
                                {error}
                            </div>
                        )}
                        <div className="flex flex-col gap-4 font-urbanist!">
                            <Input 
                                label="Nombre de usuario" 
                                placeholder="Ingrese su nombre de usuario" 
                                className="bg-gray-100 text-base"
                                name="nombreUsuario"
                                type="text"
                                value={formData.nombreUsuario}
                                onChange={handleInputChange}
                                required
                            />
                            <Input 
                                label="Contraseña" 
                                placeholder="Ingrese su contraseña" 
                                className="bg-gray-200 text-base!"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                            <Link href="/auth/forgot-password" className="text-sm sm:text-base text-primary text-right -mt-2 hover:underline">¿Olvidó su contraseña?</Link>
                        </div>
                            <div className="flex flex-col gap-2 mt-4 font-urbanist!">
                                <Button 
                                    children="Ingresar a tu cuenta" 
                                    variant="primary" 
                                    size="lg" 
                                    isLoading={isLoading}  
                                    className="rounded-3xl! text-xl! w-full" 
                                    type="submit"
                                    disabled={isLoading}
                                />
                            </div>
                        </form>
                    </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Círculo con información y decoración - Derecha */}
                <AnimatePresence>
                    {!isExiting && (
                        <motion.div 
                            key="circle"
                            className="hidden lg:block absolute right-5 top-1/2 -translate-y-1/2 translate-x-1/2 font-primary"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}>
                            <div className="lg:w-[1200px] lg:h-[1200px] xl:w-[1620px] xl:h-[1620px] flex flex-col justify-center items-start rounded-full border-4 border-primary bg-primary">
                                <p className="text-white w-1/2 font-semibold text-5xl xl:text-7xl text-right pl-50 pr-20">Juntos por la Justicia Social.</p>
                                <p className="text-white text-right w-1/2 text-3xl/8 xl:text-4xl/8 pl-30 pr-20 mt-2">ODS 16 - Promoviendo la paz y la inclusión en Ciudad Guayana.</p>
                            </div>
                        </motion.div>)}
                </AnimatePresence>
            </div>
        </div>
    );
}