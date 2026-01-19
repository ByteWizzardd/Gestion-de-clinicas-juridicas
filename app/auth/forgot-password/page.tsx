"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/forms/Input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [isExiting, setIsExiting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [result, setResult] = useState<{ data?: { message?: string; emailFound?: boolean } } | null>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
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
            router.push("/auth/login");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setResult(null);

        if (!formData.email || formData.email.trim() === '') {
            setError("Por favor ingrese su correo electrónico");
            return;
        }

        setIsLoading(true);

        try {
            const { forgotPasswordAction } = await import('@/app/actions/auth');
            const formDataToSend = new FormData();
            formDataToSend.append('email', formData.email);

            const actionResult = await forgotPasswordAction(formDataToSend);

            if (!actionResult.success) {
                throw new Error(actionResult.error?.message || "Error al procesar la solicitud");
            }

            setResult(actionResult);
            setSuccess(true);
            
            // Solo redirigir si el correo existe (emailFound === true)
            if (actionResult.data?.emailFound) {
                // Redirigir a verify-code después de 2 segundos solo si el correo existe
                setTimeout(() => {
                    setIsExiting(true);
                    setTimeout(() => {
                        router.push(`/auth/verify-code?email=${encodeURIComponent(formData.email)}`);
                    }, prefersReducedMotion ? 0 : 150);
                }, 2000);
            } else {
                // Si el correo no existe, permitir que el usuario intente de nuevo
                setIsLoading(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al procesar la solicitud");
            setIsLoading(false);
        }
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
                        <Link href="/auth/login" onClick={handleBack}
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
                            key="forgot-password-form"
                            className="w-full max-w-md mx-auto sm:mx-0 sm:pl-15"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                        <div className="mb-5">
                            <h1 className="text-3xl sm:text-5xl font-normal text-foreground mb-2 text-center font-primary">¿Olvidó su contraseña?</h1>
                            <div className="w-full h-0.5 bg-secondary mt-5"/>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 text-center mb-2">
                            Ingrese su correo electrónico y le enviaremos instrucciones para restablecer su contraseña.
                        </p>
                        {error && (
                            <div className="bg-danger-light border border-danger rounded-lg p-3 text-danger text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className={`rounded-lg p-3 text-sm ${
                                result?.data?.emailFound === false 
                                    ? "bg-yellow-50 border border-yellow-200 text-yellow-700" 
                                    : "bg-green-50 border border-green-200 text-green-700"
                            }`}>
                                {result?.data?.message || "Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña."}
                            </div>
                        )}
                        <div className="flex flex-col gap-4 font-urbanist!">
                            <Input 
                                label="Correo electrónico" 
                                placeholder="Ingrese su correo electrónico" 
                                className="bg-gray-100 text-base"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                disabled={success}
                            />
                        </div>
                        <div className="flex flex-col gap-2 mt-4 font-urbanist!">
                            <Button 
                                children={success ? "Redirigiendo..." : "Enviar instrucciones"} 
                                variant="primary" 
                                size="lg" 
                                isLoading={isLoading}  
                                className="rounded-3xl! text-xl! w-full" 
                                type="submit"
                                disabled={isLoading || success}
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

