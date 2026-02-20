"use client";
import { useState, useEffect, Suspense } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/forms/Input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

function VerifyCodeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isExiting, setIsExiting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [formData, setFormData] = useState({
        codigo: "",
    });
    const [email, setEmail] = useState<string>("");

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
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(decodeURIComponent(emailParam));
        }
    }, [searchParams]);

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsExiting(true);
        setTimeout(() => {
            router.push("/auth/forgot-password");
        }, prefersReducedMotion ? 0 : 150);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Solo permitir números
        const numericValue = value.replace(/\D/g, '').slice(0, 6);
        setFormData(prev => ({
            ...prev,
            [name]: numericValue,
        }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!formData.codigo || formData.codigo.trim() === '') {
            setError("Por favor ingrese el código de verificación");
            return;
        }

        if (formData.codigo.length !== 6) {
            setError("El código debe tener 6 dígitos");
            return;
        }

        setIsLoading(true);

        try {
            const { verifyCodeAction } = await import('@/app/actions/auth');
            const formDataToSend = new FormData();
            formDataToSend.append('codigo', formData.codigo);

            const result = await verifyCodeAction(formDataToSend);

            if (!result.success) {
                throw new Error(result.error?.message || "Error al verificar el código");
            }

            setSuccess(true);
            // Redirigir a reset-password con la cédula después de 1 segundo
            setTimeout(() => {
                setIsExiting(true);
                setTimeout(() => {
                    if (result.data) {
                        router.push(`/auth/reset-password?cedula=${encodeURIComponent(result.data.cedula)}&email=${encodeURIComponent(result.data.email)}`);
                    }
                }, prefersReducedMotion ? 0 : 150);
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al verificar el código");
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background relative overflow-hidden min-h-svh">
            <AnimatePresence>
                {!isExiting && (
                    <motion.div
                        key="back-arrow"
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}>
                        <Link href="/auth/forgot-password" onClick={handleBack}
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
                            key="verify-code-form"
                            className="w-full max-w-md mx-auto sm:mx-0 sm:pl-15"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                                <div className="mb-5">
                                    <h1 className="text-3xl sm:text-5xl font-normal text-foreground mb-2 text-center font-primary">Verificar Código</h1>
                                    <div className="w-full h-0.5 bg-secondary mt-5" />
                                </div>
                                <p className="text-sm sm:text-base text-gray-600 text-center mb-2 wrap-break-word">
                                    {email ? `Ingrese el código de 6 dígitos enviado a ${email}` : 'Ingrese el código de 6 dígitos enviado a su correo electrónico'}
                                </p>
                                {error && (
                                    <div className="bg-danger/11 border border-danger/20 rounded-lg p-3 text-danger text-sm font-medium">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                                        Código verificado correctamente. Redirigiendo...
                                    </div>
                                )}
                                <div className="flex flex-col gap-4 font-urbanist!">
                                    <Input
                                        label="Código de verificación"
                                        placeholder="000000"
                                        className="bg-gray-100 text-center text-xl sm:text-2xl tracking-widest font-mono"
                                        name="codigo"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={formData.codigo}
                                        onChange={handleInputChange}
                                        required
                                        disabled={success}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 mt-4 font-urbanist!">
                                    <Button
                                        children={success ? "Verificando..." : "Verificar código"}
                                        variant="primary"
                                        size="lg"
                                        isLoading={isLoading}
                                        className="rounded-3xl! text-xl! w-full"
                                        type="submit"
                                        disabled={isLoading || success}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 text-center">
                                    ¿No recibiste el código? <Link href="/auth/forgot-password" className="text-primary hover:underline">Solicitar uno nuevo</Link>
                                </p>
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

export default function VerifyCodePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-svh items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <VerifyCodeContent />
        </Suspense>
    );
}

