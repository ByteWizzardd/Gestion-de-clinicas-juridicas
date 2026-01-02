"use client";
import { useState, useEffect, Suspense } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/forms/Input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isExiting, setIsExiting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [formData, setFormData] = useState({
        cedula: "",
        email: "",
        newPassword: "",
        confirmPassword: "",
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

    useEffect(() => {
        const cedula = searchParams.get('cedula');
        const email = searchParams.get('email');
        if (cedula) {
            setFormData(prev => ({ ...prev, cedula: decodeURIComponent(cedula) }));
        }
        if (email) {
            setFormData(prev => ({ ...prev, email: decodeURIComponent(email) }));
        }
    }, [searchParams]);

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

        if (!formData.cedula || !formData.newPassword || !formData.confirmPassword) {
            setError("Por favor complete todos los campos");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setIsLoading(true);

        try {
            const { resetPasswordAction } = await import('@/app/actions/auth');
            const formDataToSend = new FormData();
            formDataToSend.append('cedula', formData.cedula);
            formDataToSend.append('newPassword', formData.newPassword);
            formDataToSend.append('confirmPassword', formData.confirmPassword);

            const result = await resetPasswordAction(formDataToSend);

            if (!result.success) {
                throw new Error(result.error?.message || "Error al restablecer la contraseña");
            }

            setSuccess(true);
            // Redirigir a login después de 2 segundos
            setTimeout(() => {
                setIsExiting(true);
                setTimeout(() => {
                    router.push("/auth/login");
                }, prefersReducedMotion ? 0 : 150);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al restablecer la contraseña");
            setIsLoading(false);
        }
    };

    return(
        <div className="bg-background relative overflow-hidden h-screen">
            <AnimatePresence>
                {!isExiting && (
                    <motion.div
                        key="back-arrow"
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}>
                        <Link href="/auth/login" onClick={handleBack}
                            className="absolute top-10 left-8 z-30 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-8 h-8 text-foreground hover:text-primary transition-colors" />
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Contenedor principal con layout flex */}
            <div className="flex h-screen items-center justify-start px-12 relative">
                <AnimatePresence>
                    {!isExiting && (
                        <motion.div 
                            key="reset-password-form"
                            className="w-full max-w-md pl-15"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                        <div className="mb-5">
                            <h1 className="text-5xl font-normal text-foreground mb-2 text-center font-primary">Restablecer Contraseña</h1>
                            <div className="w-full h-0.5 bg-secondary mt-5"/>
                        </div>
                        {error && (
                            <div className="bg-danger-light border border-danger rounded-lg p-3 text-danger text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                                Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...
                            </div>
                        )}
                        <div className="flex flex-col gap-4 !font-urbanist">
                            {formData.email && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                                    <strong>Correo:</strong> {formData.email}
                                </div>
                            )}
                            {/* Campo oculto para cedula */}
                            <input type="hidden" name="cedula" value={formData.cedula} />
                            <Input 
                                label="Nueva contraseña" 
                                placeholder="Ingrese su nueva contraseña" 
                                className="bg-gray-100 text-base"
                                name="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                required
                                disabled={success}
                            />
                            <Input 
                                label="Confirmar contraseña" 
                                placeholder="Confirme su nueva contraseña" 
                                className="bg-gray-200 !text-base"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                disabled={success}
                            />
                        </div>
                        <div className="flex flex-col gap-2 mt-4 !font-urbanist">
                            <Button 
                                children={success ? "Redirigiendo..." : "Restablecer contraseña"} 
                                variant="primary" 
                                size="lg" 
                                isLoading={isLoading}  
                                className="!rounded-3xl !text-xl w-full" 
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
                            className="absolute right-5 top-1/2 -translate-y-1/2 translate-x-1/2 font-primary"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}>
                            <div className="w-[1620px] h-[1620px] flex flex-col justify-center items-start rounded-full border-4 border-primary bg-primary">
                                <p className="text-white w-1/2 font-semibold text-7xl text-right pl-50 pr-20">Juntos por la Justicia Social.</p>
                                <p className="text-white text-right w-1/2 text-4xl/8 pl-30 pr-20 mt-2">ODS 16 - Promoviendo la paz y la inclusión en Ciudad Guayana.</p>
                            </div>
                        </motion.div>)}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}

