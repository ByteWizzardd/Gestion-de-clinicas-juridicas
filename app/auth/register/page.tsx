"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/forms/Input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export default function RegisterPage() {
    const router = useRouter();
    const [isExiting, setIsExiting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nombreCompleto: "",
        cedula: "",
        correo: "",
        password: "",
        confirmPassword: "",
    });

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsExiting(true);
        setTimeout(() => {
            router.push("/auth");
        }, 1200);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError(null);
    };

    const handleRegister = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        
        setError(null);
        
        // Validaciones básicas
        if (!formData.nombreCompleto || !formData.cedula || !formData.correo || !formData.password || !formData.confirmPassword) {
            setError("Por favor complete todos los campos");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombreCompleto: formData.nombreCompleto,
                    cedula: formData.cedula,
                    correo: formData.correo,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || "Error al registrar usuario");
            }

            // Registro exitoso
            setIsExiting(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 800);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al registrar usuario");
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleRegister();
    };

    return(
        <div className="bg-background relative overflow-hidden h-screen">
            <AnimatePresence>
                {!isExiting && (
                    <motion.div
                        key="back-arrow"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}>
                        <Link href="/auth" onClick={handleBack}
                            className="absolute top-10 left-[820px] z-30 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                            <ArrowLeft className="w-8 h-8 text-foreground hover:text-primary transition-colors" />
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contenedor principal con layout flex */}
            <div className="flex h-screen items-center justify-end px-12 relative">
                {/* Círculo con información y decoración - Izquierda */}
                <AnimatePresence>
                    {!isExiting && (
                        <motion.div 
                            key="circle"
                            className="absolute left-5 top-1/2 -translate-y-1/2 -translate-x-1/2 font-primary"
                            initial={{ opacity: 0, x: -200, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -200, scale: 0.8 }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}>
                            <div className="w-[1620px] h-[1620px] flex flex-col justify-center items-end rounded-full border-4 border-primary bg-primary">
                                <p className="text-white w-1/2 font-semibold text-7xl text-left pr-20 pl-15">Acceso a la Justicia para Todos. </p>
                                <p className="text-white text-left w-1/2 text-4xl/8 pr-40 pl-15 mt-2">Su trabajo garantiza un proceso eficaz y responsable.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Cuadro para registrar - Derecha */}
                <AnimatePresence>
                    {!isExiting && (
                        <motion.div 
                            key="register-form"
                            className="w-full max-w-md pr-15"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                        <div className="mb-5">
                            <h1 className="text-5xl font-normal text-foreground mb-2 text-center font-primary">Crear Cuenta</h1>
                            <div className="w-full h-0.5 bg-secondary mt-5"/>
                        </div>
                        {error && (
                            <div className="bg-danger-light border border-danger rounded-lg p-3 text-danger text-sm">
                                {error}
                            </div>
                        )}
                        <div className="flex flex-col gap-4 !font-urbanist">
                            <Input 
                                label="Nombre Completo" 
                                placeholder="Ingrese su nombre completo" 
                                className="bg-gray-100 text-base"
                                name="nombreCompleto"
                                value={formData.nombreCompleto}
                                onChange={handleInputChange}
                                required
                            />
                            <Input 
                                label="Cédula" 
                                placeholder="Ingrese su cédula" 
                                className="bg-gray-100 text-base"
                                name="cedula"
                                value={formData.cedula}
                                onChange={handleInputChange}
                                required
                            />
                            <Input 
                                label="Correo institucional" 
                                placeholder="Ingrese su correo institucional" 
                                className="bg-gray-100 text-base"
                                name="correo"
                                type="email"
                                value={formData.correo}
                                onChange={handleInputChange}
                                required
                            />
                            <Input 
                                label="Contraseña" 
                                placeholder="Ingrese su contraseña" 
                                type="password" 
                                className="bg-gray-100 text-base"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                            <Input 
                                label="Confirmar contraseña" 
                                placeholder="Confirme su contraseña" 
                                type="password" 
                                className="bg-gray-100 text-base"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                            <div className="flex flex-col gap-2 mt-4 !font-urbanist">
                                <Button 
                                    children="Registrarse" 
                                    variant="primary" 
                                    size="lg" 
                                    isLoading={isLoading}  
                                    className="!rounded-3xl !text-xl w-full" 
                                    type="submit"
                                    disabled={isLoading}
                                />
                                <p className="text-base text-center text-foreground">
                                    ¿Ya tiene una cuenta? <Link href="/auth/login" className="text-primary hover:underline">Inicie sesión acá</Link>
                                </p>
                            </div>
                        </form>
                    </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}